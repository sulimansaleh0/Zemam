const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Team = require('../models/team.model');
const Task = require('../models/task.model');
const Fuel = require('../models/fuel.model');
const Maintenance = require('../models/maintenance.model');
const { userRoles } = require('../data/roles');
const { mainStatus, taskStatus, expenseRecordStatus } = require('../data/status');
const { paginate } = require('../utils/paginate');

/**
 * Escapes characters for safe regular expression search (ReDoS protection)
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Executes a callback within a MongoDB transaction if replica set supports it,
 * with graceful fallback to non-transactional execution.
 */
async function withTransaction(callback) {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch {
    session = null;
  }

  try {
    const result = await callback(session);
    if (session) {
      await session.commitTransaction();
    }
    return result;
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error('Error aborting transaction in manager.service:', abortErr.message);
      }
      // Resilient fallback: If transaction failed due to environment/concurrency, execute without session
      if (err.name === 'MongoServerError' || err.code === 117 || err.code === 263 || err.code === 251) {
        try {
          return await callback(null);
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }
    }
    throw err;
  } finally {
    if (session) {
      try {
        session.endSession();
      } catch {
        // ignore
      }
    }
  }
}

class ManagerService {
  /**
   * Create a new fleet manager with initial team assignment (Atomic)
   */
  async createFleetManager({ adminUser, team, data }) {
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const phone = data.phone ? data.phone.trim() : undefined;

    // Check duplicate email across active users
    const existingUser = await User.findOne({ email, isDeleted: false });
    if (existingUser) {
      throw { status: 400, message: 'البريد الإلكتروني مسجل مسبقاً لمستخدم آخر' };
    }

    const teamId = team?._id || data.teamId;
    let targetTeam = team;
    if (!targetTeam && teamId && mongoose.Types.ObjectId.isValid(teamId)) {
      targetTeam = await Team.findOne({
        _id: teamId,
        companyId: adminUser.companyId,
        isDeleted: false,
      });
    }

    if (targetTeam?.managerId) {
      throw { status: 400, message: 'الفريق لديه مدير بالفعل، يرجى فك ارتباط المدير الحالي أولاً' };
    }

    const defaultPassword = '123456789';
    const passwordHash = await bcrypt.hash(defaultPassword, 9);

    return withTransaction(async (session) => {
      const opts = session ? { session } : {};

      const [fleetManager] = await User.create(
        [
          {
            email,
            name,
            phone,
            password: passwordHash,
            companyId: adminUser.companyId,
            teamId: targetTeam ? targetTeam._id : null,
            role: userRoles.FLEET_MANAGER,
            status: mainStatus.ACTIVE,
          },
        ],
        opts
      );

      if (targetTeam) {
        await Team.findByIdAndUpdate(targetTeam._id, { managerId: fleetManager._id }, opts);
      }

      const populatedManager = await User.findById(fleetManager._id, null, opts).populate('teamId', 'name status');
      return populatedManager;
    });
  }

  /**
   * List fleet managers with server-side pagination, search and filters
   */
  async listFleetManagers({ adminUser, query = {} }) {
    const filters = {
      role: { $in: [userRoles.FLEET_MANAGER] },
      companyId: adminUser.companyId,
      isDeleted: false,
    };

    if (query.status && query.status !== 'all') {
      filters.status = query.status;
    }

    if (query.teamId && query.teamId !== 'all') {
      if (mongoose.Types.ObjectId.isValid(query.teamId)) {
        filters.teamId = query.teamId;
      }
    }

    const andConditions = [];

    if (query.withoutTeam === 'true' || query.withoutTeam === true) {
      andConditions.push({
        $or: [{ teamId: null }, { teamId: { $exists: false } }],
      });
    }

    if (query.search && typeof query.search === 'string' && query.search.trim()) {
      const escaped = escapeRegex(query.search.trim());
      andConditions.push({
        $or: [
          { name: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } },
          { phone: { $regex: escaped, $options: 'i' } },
        ],
      });
    }

    if (andConditions.length === 1) {
      Object.assign(filters, andConditions[0]);
    } else if (andConditions.length > 1) {
      filters.$and = andConditions;
    }

    // Server-side pagination
    if (query.page !== undefined || query.limit !== undefined) {
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const result = await paginate(User, filters, {
        page,
        limit,
        populate: [{ path: 'teamId', select: 'name status' }],
        sort: { createdAt: -1 },
      });

      return {
        fleetManagers: result.docs || result.data || [],
        pagination: result.pagination,
      };
    }

    const fleetManagers = await User.find(filters)
      .populate('teamId', 'name status')
      .sort({ createdAt: -1 });

    return { fleetManagers };
  }

  /**
   * Get single manager by ID with security scoping
   */
  async getFleetManagerById({ user, managerId }) {
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw { status: 400, message: 'معرف المدير غير صالح' };
    }

    const manager = await User.findOne({
      _id: managerId,
      companyId: user.companyId,
      role: userRoles.FLEET_MANAGER,
      isDeleted: false,
    }).populate('teamId', 'name status');

    if (!manager) {
      throw { status: 404, message: 'مدير الأسطول غير موجود' };
    }

    if (user.role === userRoles.FLEET_MANAGER && manager._id.toString() !== user._id.toString()) {
      throw { status: 403, message: 'غير مصرح لك بعرض بيانات مدير أسطول آخر' };
    }

    return manager;
  }

  /**
   * Get manager performance statistics (Tasks, Fuel, Maintenance)
   */
  async getManagerStats({ user, managerId }) {
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw { status: 400, message: 'معرف المدير غير صالح' };
    }

    const manager = await User.findOne({
      _id: managerId,
      companyId: user.companyId,
      role: userRoles.FLEET_MANAGER,
      isDeleted: false,
    });

    if (!manager) {
      throw { status: 404, message: 'مدير الأسطول غير موجود' };
    }

    if (user.role === userRoles.FLEET_MANAGER && manager._id.toString() !== user._id.toString()) {
      throw { status: 403, message: 'يمكنك فقط استعراض إحصائيات فريقك الشخصي' };
    }

    const teamId = manager.teamId;
    if (!teamId) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        delayedTasks: 0,
        fuelCost: 0,
        maintenanceCost: 0,
      };
    }

    const [taskStats, fuelStats, maintenanceStats] = await Promise.all([
      Task.aggregate([
        { $match: { teamId } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', taskStatus.FINISHED] }, 1, 0] },
            },
            delayedTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$status', taskStatus.FINISHED] },
                      { $lt: ['$deadline', new Date()] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Fuel.aggregate([
        { $match: { teamId, status: expenseRecordStatus.APPROVED } },
        { $group: { _id: null, fuelCost: { $sum: '$cost' } } },
      ]),
      Maintenance.aggregate([
        { $match: { teamId, status: expenseRecordStatus.APPROVED } },
        { $group: { _id: null, maintenanceCost: { $sum: '$cost' } } },
      ]),
    ]);

    return {
      totalTasks: taskStats[0]?.totalTasks || 0,
      completedTasks: taskStats[0]?.completedTasks || 0,
      delayedTasks: taskStats[0]?.delayedTasks || 0,
      fuelCost: fuelStats[0]?.fuelCost || 0,
      maintenanceCost: maintenanceStats[0]?.maintenanceCost || 0,
    };
  }

  /**
   * Assign manager to a team (Atomic & Sequential)
   */
  async assignManagerToTeam({ adminUser, managerId, team, teamId }) {
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw { status: 400, message: 'معرف المدير غير صالح' };
    }

    const targetTeamId = team?._id || teamId;
    if (!targetTeamId || !mongoose.Types.ObjectId.isValid(targetTeamId)) {
      throw { status: 400, message: 'معرف الفريق غير صالح أو غير موجود' };
    }

    const foundTeam = team || (await Team.findOne({
      _id: targetTeamId,
      companyId: adminUser.companyId,
      isDeleted: false,
    }));

    if (!foundTeam) {
      throw { status: 404, message: 'الفريق المحدد غير موجود' };
    }

    if (foundTeam.managerId && foundTeam.managerId.toString() !== managerId.toString()) {
      throw { status: 400, message: 'الفريق لديه مدير مسند بالفعل' };
    }

    const manager = await User.findOne({
      _id: managerId,
      companyId: adminUser.companyId,
      role: userRoles.FLEET_MANAGER,
      isDeleted: false,
    });

    if (!manager) {
      throw { status: 404, message: 'مدير الأسطول غير موجود' };
    }

    if (manager.status === mainStatus.INACTIVE) {
      throw { status: 400, message: 'لا يمكن تعيين مدير أسطول غير نشط للفريق، يرجى تفعيل حسابه أولاً' };
    }

    if (manager.teamId && manager.teamId.toString() !== foundTeam._id.toString()) {
      throw { status: 400, message: 'المدير مسند بالفعل إلى فريق آخر، يرجى فك ارتباطه أولاً' };
    }

    return withTransaction(async (session) => {
      const opts = session ? { session } : {};

      await Team.findByIdAndUpdate(foundTeam._id, { managerId: manager._id }, opts);
      await User.findByIdAndUpdate(manager._id, { teamId: foundTeam._id }, opts);

      return { success: true };
    });
  }

  /**
   * Remove manager from their team (Atomic & Sequential)
   */
  async removeManagerFromTeam({ adminUser, managerId }) {
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw { status: 400, message: 'معرف المدير غير صالح' };
    }

    const manager = await User.findOne({
      _id: managerId,
      companyId: adminUser.companyId,
      role: userRoles.FLEET_MANAGER,
      isDeleted: false,
    });

    if (!manager) {
      throw { status: 404, message: 'مدير الأسطول غير موجود' };
    }

    return withTransaction(async (session) => {
      const opts = session ? { session } : {};

      if (manager.teamId) {
        await Team.findByIdAndUpdate(manager.teamId, { managerId: null }, opts);
      }

      await User.findByIdAndUpdate(manager._id, { teamId: null }, opts);

      return { success: true };
    });
  }

  /**
   * Toggle or update manager status (active/inactive)
   */
  async changeManagerStatus({ adminUser, managerId, status }) {
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw { status: 400, message: 'معرف المدير غير صالح' };
    }

    if (managerId.toString() === adminUser._id.toString()) {
      throw { status: 400, message: 'لا يمكنك تغيير حالة حسابك الشخصي' };
    }

    const manager = await User.findOne({
      _id: managerId,
      companyId: adminUser.companyId,
      role: userRoles.FLEET_MANAGER,
      isDeleted: false,
    });

    if (!manager) {
      throw { status: 404, message: 'مدير الأسطول غير موجود' };
    }

    manager.status = status;
    await manager.save();
    return manager;
  }

  /**
   * Soft delete a fleet manager and unlink team (Atomic & Sequential)
   */
  async deleteFleetManager({ adminUser, managerId }) {
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw { status: 400, message: 'معرف المدير غير صالح' };
    }

    if (managerId.toString() === adminUser._id.toString()) {
      throw { status: 400, message: 'لا يمكنك حذف حسابك الشخصي' };
    }

    const manager = await User.findOne({
      _id: managerId,
      companyId: adminUser.companyId,
      role: userRoles.FLEET_MANAGER,
      isDeleted: false,
    });

    if (!manager) {
      throw { status: 404, message: 'مدير الأسطول غير موجود' };
    }

    return withTransaction(async (session) => {
      const opts = session ? { session } : {};

      if (manager.teamId) {
        await Team.findByIdAndUpdate(manager.teamId, { managerId: null }, opts);
      }

      await User.findByIdAndUpdate(
        manager._id,
        { isDeleted: true, teamId: null, status: mainStatus.INACTIVE },
        opts
      );

      return { success: true };
    });
  }
}

module.exports = new ManagerService();
