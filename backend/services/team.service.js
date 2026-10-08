const mongoose = require("mongoose");
const Team = require("../models/team.model");
const User = require("../models/user.model");
const Vehicle = require("../models/vehicle.model");
const Task = require("../models/task.model");
const getStatics = require("../utils/getStatics");
const { userRoles } = require("../data/roles");
const { mainStatus, taskStatus } = require("../data/status");
const { paginate } = require("../utils/paginate");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

class TeamService {
  /**
   * Helper to execute database operations in a resilient transaction with replica-set fallback
   */
  async withTransaction(workFn) {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      session = null;
    }

    try {
      const result = await workFn(session);
      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (err) {
      if (session) {
        await session.abortTransaction();
      }
      throw err;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  /**
   * Create a new team with optional manager, drivers, and vehicles atomic assignment
   */
  async createTeam({ name, managerId, driversIds, vehiclesIds }, companyId, user) {
    const trimmedName = name ? name.trim() : "";
    if (!trimmedName) {
      const err = new Error("اسم الفريق مطلوب");
      err.statusCode = 400;
      throw err;
    }

    // Check name uniqueness in the same company
    const existingTeam = await Team.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i") },
      companyId,
      isDeleted: false,
    });

    if (existingTeam) {
      const err = new Error("اسم الفريق مسجل بالفعل لهذه الشركة");
      err.statusCode = 400;
      throw err;
    }

    // Verify Fleet Manager eligibility if specified
    if (managerId) {
      const isFleetManager = await User.findOne({
        _id: managerId,
        companyId,
        role: userRoles.FLEET_MANAGER,
        isDeleted: false,
      });

      if (!isFleetManager) {
        const err = new Error("المستخدم المحدد ليس مدير أسطول مصرحاً به في الشركة");
        err.statusCode = 400;
        throw err;
      }

      const isInTeam = await Team.findOne({
        managerId,
        companyId,
        isDeleted: false,
      });

      if (isInTeam) {
        const err = new Error("مدير الأسطول مسند بالفعل لفريق آخر");
        err.statusCode = 400;
        throw err;
      }
    }

    let createdTeamId = null;

    await this.withTransaction(async (session) => {
      const sessionOpt = session ? { session } : {};

      const [team] = await Team.create(
        [
          {
            name: trimmedName,
            managerId: managerId || null,
            companyId,
          },
        ],
        sessionOpt
      );

      createdTeamId = team._id;

      if (managerId) {
        await User.findByIdAndUpdate(managerId, { teamId: team._id }, sessionOpt);
      }

      if (Array.isArray(driversIds) && driversIds.length > 0) {
        await User.updateMany(
          {
            _id: { $in: driversIds },
            companyId,
            role: userRoles.DRIVER,
            isDeleted: false,
          },
          { teamId: team._id },
          sessionOpt
        );
      }

      if (Array.isArray(vehiclesIds) && vehiclesIds.length > 0) {
        await Vehicle.updateMany(
          {
            _id: { $in: vehiclesIds },
            companyId,
            isDeleted: false,
          },
          { teamId: team._id },
          sessionOpt
        );
      }
    });

    return await Team.findById(createdTeamId).populate(
      "managerId",
      "name email status phone"
    );
  }

  /**
   * List teams with multi-tenancy, search, manager status filtering, and optional pagination
   */
  async listTeams({ companyId, search, status, managerFilter, page, limit, sort, all = true }, user) {
    const filters = {
      companyId,
      isDeleted: false,
    };

    // Role-based isolation: fleet managers or drivers only see their assigned team
    if (user && (user.role === userRoles.FLEET_MANAGER || user.role === userRoles.DRIVER)) {
      if (!user.teamId) {
        return all ? { teams: [] } : { teams: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
      }
      filters._id = user.teamId;
    }

    if (search && search.trim()) {
      filters.name = { $regex: new RegExp(escapeRegex(search.trim()), "i") };
    }

    if (status && [mainStatus.ACTIVE, mainStatus.INACTIVE].includes(status)) {
      filters.status = status;
    }

    if (managerFilter === "assigned") {
      filters.managerId = { $ne: null };
    } else if (managerFilter === "unassigned") {
      filters.managerId = null;
    }

    const sortOption = sort || { createdAt: -1 };

    // Support pagination if explicitly requested and all !== true
    const shouldPaginate = page !== undefined && limit !== undefined && all !== true && all !== "true";

    if (shouldPaginate) {
      const paginated = await paginate(Team, filters, {
        page,
        limit,
        sort: sortOption,
        populate: { path: "managerId", select: "name email status phone" },
      });
      return {
        teams: paginated.docs,
        pagination: paginated.pagination,
      };
    }

    const teams = await Team.find(filters)
      .sort(sortOption)
      .populate("managerId", "name email status phone")
      .lean();

    return { teams };
  }

  /**
   * Get single team details by ID with role authorization
   */
  async getTeamById(teamId, companyId, user) {
    if (!teamId) {
      const err = new Error("معرّف الفريق مطلوب");
      err.statusCode = 400;
      throw err;
    }

    // Role verification
    if (user && (user.role === userRoles.FLEET_MANAGER || user.role === userRoles.DRIVER)) {
      if (!user.teamId || String(user.teamId) !== String(teamId)) {
        const err = new Error("غير مصرح لك بالوصول لبيانات هذا الفريق");
        err.statusCode = 403;
        throw err;
      }
    }

    const team = await Team.findOne({
      _id: teamId,
      companyId,
      isDeleted: false,
    }).populate("managerId", "name email status phone");

    if (!team) {
      const err = new Error("الفريق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    return team;
  }

  /**
   * Update team name or status
   */
  async updateTeam(teamId, { name, status }, companyId) {
    if (!teamId) {
      const err = new Error("معرّف الفريق مطلوب");
      err.statusCode = 400;
      throw err;
    }

    const team = await Team.findOne({
      _id: teamId,
      companyId,
      isDeleted: false,
    });

    if (!team) {
      const err = new Error("الفريق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    if (name && name.trim() && name.trim() !== team.name) {
      const trimmedName = name.trim();
      const duplicate = await Team.findOne({
        _id: { $ne: teamId },
        name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i") },
        companyId,
        isDeleted: false,
      });

      if (duplicate) {
        const err = new Error("اسم الفريق مسجل بالفعل لفريق آخر");
        err.statusCode = 400;
        throw err;
      }
      team.name = trimmedName;
    }

    if (status && [mainStatus.ACTIVE, mainStatus.INACTIVE].includes(status)) {
      team.status = status;
    }

    await team.save();

    return await Team.findById(teamId).populate(
      "managerId",
      "name email status phone"
    );
  }

  /**
   * Delete team (soft delete) and atomically dissociate manager, drivers, and vehicles
   */
  async deleteTeam(teamId, companyId) {
    if (!teamId) {
      const err = new Error("معرّف الفريق مطلوب");
      err.statusCode = 400;
      throw err;
    }

    const team = await Team.findOne({
      _id: teamId,
      companyId,
      isDeleted: false,
    });

    if (!team) {
      const err = new Error("الفريق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    // Check if team has active or pending tasks
    const hasActiveTasks = await Task.exists({
      teamId,
      companyId,
      status: { $in: [taskStatus.INPROGRESS, taskStatus.PENDING] },
    });

    if (hasActiveTasks) {
      const err = new Error("لا يمكن حذف الفريق لوجود مهام تشغيلية نشطة أو معلقة قيد التنفيذ");
      err.statusCode = 400;
      throw err;
    }

    const currentManagerId = team.managerId;

    await this.withTransaction(async (session) => {
      const sessionOpt = session ? { session } : {};

      // 1. Mark team as deleted and clear managerId
      await Team.findByIdAndUpdate(
        teamId,
        { isDeleted: true, managerId: null },
        sessionOpt
      );

      // 2. Unassign fleet manager from team if one was assigned
      if (currentManagerId) {
        await User.findByIdAndUpdate(
          currentManagerId,
          { teamId: null },
          sessionOpt
        );
      }

      // 3. Unassign vehicles and drivers from team
      await Promise.all([
        Vehicle.updateMany(
          { teamId, companyId },
          { teamId: null, driverId: null },
          sessionOpt
        ),
        User.updateMany(
          { teamId, companyId },
          { teamId: null },
          sessionOpt
        ),
      ]);
    });

    return true;
  }

  /**
   * Assign drivers and vehicles to team
   */
  async assignResources(teamId, { driversIds = [], vehiclesIds = [] }, companyId) {
    if (!teamId) {
      const err = new Error("معرّف الفريق مطلوب");
      err.statusCode = 400;
      throw err;
    }

    const team = await Team.findOne({
      _id: teamId,
      companyId,
      isDeleted: false,
    });

    if (!team) {
      const err = new Error("الفريق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    const activeFilter = {
      companyId,
      status: mainStatus.ACTIVE,
      isDeleted: false,
    };

    await this.withTransaction(async (session) => {
      const sessionOpt = session ? { session } : {};

      const operations = [];

      if (Array.isArray(driversIds) && driversIds.length > 0) {
        operations.push(
          User.updateMany(
            {
              _id: { $in: driversIds },
              ...activeFilter,
              role: userRoles.DRIVER,
            },
            { $set: { teamId } },
            sessionOpt
          )
        );
      }

      if (Array.isArray(vehiclesIds) && vehiclesIds.length > 0) {
        operations.push(
          Vehicle.updateMany(
            {
              _id: { $in: vehiclesIds },
              ...activeFilter,
            },
            { $set: { teamId, driverId: null } },
            sessionOpt
          )
        );
      }

      if (operations.length > 0) {
        await Promise.all(operations);
      }
    });

    return true;
  }

  /**
   * Get team overview statistics with clean, type-safe numeric reductions
   */
  async getTeamStats(teamId, companyId) {
    const rawStatics = await getStatics({
      teamId,
      companyId,
      isDeleted: false,
    });

    // Guarantee clean numeric values for costs
    const fuelCost = typeof rawStatics.FuelRecordsCost === "number"
      ? rawStatics.FuelRecordsCost
      : Array.isArray(rawStatics.FuelRecordsCost)
        ? rawStatics.FuelRecordsCost[0]?.totalCost || 0
        : 0;

    const maintenanceCost = typeof rawStatics.maintenanceRecordsCost === "number"
      ? rawStatics.maintenanceRecordsCost
      : Array.isArray(rawStatics.maintenanceRecordsCost)
        ? rawStatics.maintenanceRecordsCost[0]?.totalCost || 0
        : 0;

    return {
      ...rawStatics,
      FuelRecordsCost: fuelCost,
      maintenanceRecordsCost: maintenanceCost,
    };
  }
}

module.exports = new TeamService();
