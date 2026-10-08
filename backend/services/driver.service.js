const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Vehicle = require("../models/vehicle.model");
const Team = require("../models/team.model");
const Task = require("../models/task.model");
const Fuel = require("../models/fuel.model");
const { userRoles } = require("../data/roles");
const { mainStatus, taskStatus, expenseRecordStatus } = require("../data/status");
const { getDriverVehicleEligibilityError } = require("../utils/driverEligibility");
const { paginate } = require("../utils/paginate");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

class DriverService {
  /**
   * Resilient transaction runner with replica-set fallback
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
   * Helper to attach assignedVehicle to an array of driver plain objects
   */
  async attachAssignedVehicles(drivers, companyId) {
    if (!drivers || drivers.length === 0) return drivers;
    const driverIds = drivers.map((d) => d._id);
    const vehicles = await Vehicle.find({
      driverId: { $in: driverIds },
      companyId,
      isDeleted: false,
    })
      .select("_id model year plateNumber vehicleType driverId")
      .lean();

    const vehicleByDriverId = new Map();
    for (const v of vehicles) {
      if (v.driverId) {
        vehicleByDriverId.set(String(v.driverId), {
          _id: v._id,
          model: v.model,
          year: v.year,
          plateNumber: v.plateNumber,
          vehicleType: v.vehicleType,
        });
      }
    }

    return drivers.map((d) => {
      const copy = { ...d };
      copy.assignedVehicle = vehicleByDriverId.get(String(d._id)) || null;
      return copy;
    });
  }

  /**
   * Create driver with atomic vehicle linkage & license qualification checks
   */
  async createDriver({
    email,
    name,
    phone,
    teamId,
    vehicleId,
    licenseNumber,
    licenseTypes,
    licenseExpiry,
  }, companyId, userRole) {
    const trimmedEmail = email ? email.trim().toLowerCase() : "";
    const isFound = await User.findOne({
      email: trimmedEmail,
      isDeleted: false,
    });

    if (isFound) {
      const err = new Error("البريد الإلكتروني مسجل بالفعل لمستخدم آخر");
      err.statusCode = 400;
      throw err;
    }

    const selectedLicenseTypes = Array.isArray(licenseTypes) ? licenseTypes : [];

    let vehicle = null;
    if (vehicleId) {
      const vehicleQuery = {
        _id: vehicleId,
        companyId,
        status: mainStatus.ACTIVE,
        isDeleted: false,
      };
      if (teamId) {
        vehicleQuery.teamId = teamId;
      }

      vehicle = await Vehicle.findOne(vehicleQuery);
      if (!vehicle) {
        const err = new Error("المركبة المحددة غير موجودة أو غير نشطة في شركتك أو لا تنتمي لنفس الفريق");
        err.statusCode = 404;
        throw err;
      }

      const eligibilityError = getDriverVehicleEligibilityError(
        { licenseNumber, licenseTypes: selectedLicenseTypes, licenseExpiry },
        vehicle
      );
      if (eligibilityError) {
        const err = new Error(eligibilityError);
        err.statusCode = 400;
        throw err;
      }
    }

    // Default driver password
    const defaultPassword = "123456789";
    const passwordHash = await bcrypt.hash(defaultPassword, 9);

    let createdDriverId = null;

    await this.withTransaction(async (session) => {
      const sessionOpt = session ? { session } : {};

      const [driver] = await User.create(
        [
          {
            email: trimmedEmail,
            name: name ? name.trim() : trimmedEmail.split("@")[0],
            phone: phone ? phone.trim() : undefined,
            password: passwordHash,
            role: userRoles.DRIVER,
            companyId,
            teamId: teamId || null,
            licenseNumber: licenseNumber ? licenseNumber.trim() : undefined,
            licenseTypes: selectedLicenseTypes,
            licenseExpiry,
            driverScore: 100,
            faultIncidentsCount: 0,
            scoreHistory: [
              {
                pointsChange: 100,
                reason: "إنشاء حساب السائق واعتماد رخصة القيادة الأولية",
                category: "manual",
              },
            ],
          },
        ],
        sessionOpt
      );

      createdDriverId = driver._id;

      if (vehicle) {
        await Vehicle.findByIdAndUpdate(
          vehicle._id,
          { driverId: driver._id },
          sessionOpt
        );
      }
    });

    const created = await User.findById(createdDriverId)
      .populate("teamId", "name")
      .lean();

    if (vehicle) {
      created.assignedVehicle = {
        _id: vehicle._id,
        model: vehicle.model,
        year: vehicle.year,
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
      };
    } else {
      created.assignedVehicle = null;
    }

    return created;
  }

  /**
   * List drivers with filtering, search, pagination & populated assigned vehicles
   */
  async listDrivers({
    companyId,
    teamId,
    withoutTeam,
    status,
    licenseType,
    search,
    page,
    limit,
    all = true,
  }, user) {
    const filters = {
      companyId,
      role: userRoles.DRIVER,
      isDeleted: false,
    };

    // Role-based scoping: Fleet managers can only see drivers belonging to their team
    if (user && user.role === userRoles.FLEET_MANAGER) {
      if (!user.teamId) {
        return all
          ? { drivers: [] }
          : {
              drivers: [],
              pagination: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
              },
            };
      }
      filters.teamId = user.teamId;
    } else if (teamId) {
      filters.teamId = teamId;
    } else if (withoutTeam === "true" || withoutTeam === true) {
      filters.teamId = null;
    }

    if (status && [mainStatus.ACTIVE, mainStatus.INACTIVE].includes(status)) {
      filters.status = status;
    }

    if (licenseType && licenseType !== "all") {
      filters.licenseTypes = licenseType;
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const regex = new RegExp(safeSearch, "i");
      filters.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { licenseNumber: regex },
      ];
    }

    const shouldPaginate =
      page !== undefined &&
      limit !== undefined &&
      all !== true &&
      all !== "true";

    if (shouldPaginate) {
      const paginated = await paginate(User, filters, {
        page,
        limit,
        populate: { path: "teamId", select: "name" },
        sort: { createdAt: -1 },
      });

      const driversWithVehicles = await this.attachAssignedVehicles(
        paginated.docs,
        companyId
      );

      return {
        drivers: driversWithVehicles,
        pagination: paginated.pagination,
      };
    }

    const drivers = await User.find(filters)
      .populate("teamId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const driversWithVehicles = await this.attachAssignedVehicles(
      drivers,
      companyId
    );

    return { drivers: driversWithVehicles };
  }

  /**
   * Get single driver by ID with authorization and vehicle relations
   */
  async getDriverById(driverId, companyId, user) {
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
      const err = new Error("معرّف السائق غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const filters = {
      _id: driverId,
      companyId,
      role: userRoles.DRIVER,
      isDeleted: false,
    };

    if (user && user.role === userRoles.FLEET_MANAGER) {
      if (!user.teamId) {
        const err = new Error("غير مصرح لك بالوصول لبيانات هذا السائق");
        err.statusCode = 403;
        throw err;
      }
      filters.teamId = user.teamId;
    }

    const driver = await User.findOne(filters)
      .populate("teamId", "name")
      .lean();

    if (!driver) {
      const err = new Error("السائق غير موجود أو ليس مصرحاً بالوصول إليه");
      err.statusCode = 404;
      throw err;
    }

    // Attach assigned vehicle
    const assignedVehicle = await Vehicle.findOne({
      driverId: driver._id,
      companyId,
      isDeleted: false,
    })
      .select("_id model year plateNumber vehicleType fuelType")
      .lean();

    driver.assignedVehicle = assignedVehicle || null;

    return driver;
  }

  /**
   * Change driver status (active / inactive)
   */
  async changeDriverStatus(driverId, status, companyId, user) {
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
      const err = new Error("معرّف السائق غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const filters = {
      _id: driverId,
      companyId,
      role: userRoles.DRIVER,
      isDeleted: false,
    };

    if (user && user.role === userRoles.FLEET_MANAGER) {
      if (!user.teamId) {
        const err = new Error("غير مصرح لك بتعديل حالة هذا السائق");
        err.statusCode = 403;
        throw err;
      }
      filters.teamId = user.teamId;
    }

    const driver = await User.findOne(filters);
    if (!driver) {
      const err = new Error("السائق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    driver.status = status;
    await driver.save();

    return driver;
  }

  /**
   * Assign driver to vehicle with atomic mutual exclusivity and eligibility check
   */
  async assignDriverToVehicle(driverId, vehicleId, companyId, user) {
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
      const err = new Error("معرّف السائق غير صالح أو مطلوب");
      err.statusCode = 400;
      throw err;
    }

    if (!vehicleId || !mongoose.isValidObjectId(vehicleId)) {
      const err = new Error("معرّف المركبة غير صالح أو مطلوب");
      err.statusCode = 400;
      throw err;
    }

    const driverFilters = {
      _id: driverId,
      companyId,
      isDeleted: false,
      role: userRoles.DRIVER,
      status: mainStatus.ACTIVE,
    };

    const vehicleFilters = {
      _id: vehicleId,
      companyId,
      isDeleted: false,
      status: mainStatus.ACTIVE,
    };

    if (user && user.role === userRoles.FLEET_MANAGER) {
      if (!user.teamId) {
        const err = new Error("غير مصرح لك بإدارة هذا السائق أو المركبة");
        err.statusCode = 403;
        throw err;
      }
      driverFilters.teamId = user.teamId;
      vehicleFilters.teamId = user.teamId;
    }

    const [driver, vehicle] = await Promise.all([
      User.findOne(driverFilters),
      Vehicle.findOne(vehicleFilters),
    ]);

    if (!driver) {
      const err = new Error("السائق غير موجود أو غير نشط في شركتك");
      err.statusCode = 404;
      throw err;
    }

    if (!vehicle) {
      const err = new Error("المركبة غير موجودة أو غير نشطة في شركتك");
      err.statusCode = 404;
      throw err;
    }

    // Team matching rules
    if (vehicle.teamId && driver.teamId) {
      if (String(driver.teamId) !== String(vehicle.teamId)) {
        const err = new Error("يجب أن ينتمي السائق والمركبة لنفس الفريق التشغيلي");
        err.statusCode = 400;
        throw err;
      }
    } else if (vehicle.teamId && !driver.teamId) {
      // Auto-assign driver to vehicle team
      driver.teamId = vehicle.teamId;
    } else if (!vehicle.teamId && driver.teamId) {
      const err = new Error("المركبة غير مسندة لفريق، بينما السائق منتمٍ لفريق تشغيلي. يرجى إسناد المركبة للفريق أولاً.");
      err.statusCode = 400;
      throw err;
    }

    // Check license eligibility
    const eligibilityError = getDriverVehicleEligibilityError(driver, vehicle);
    if (eligibilityError) {
      const err = new Error(eligibilityError);
      err.statusCode = 400;
      throw err;
    }

    await this.withTransaction(async (session) => {
      const sessionOpt = session ? { session } : {};

      // 1. Unlink driver from any other vehicle
      await Vehicle.updateMany(
        { driverId, companyId, _id: { $ne: vehicle._id } },
        { driverId: null },
        sessionOpt
      );

      // 2. Link driver to this vehicle
      vehicle.driverId = driverId;
      await vehicle.save(sessionOpt);
      await driver.save(sessionOpt);
    });

    return { driver, vehicle };
  }

  /**
   * Unassign driver from vehicle
   */
  async unassignDriverFromVehicle(driverId, companyId) {
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
      const err = new Error("معرّف السائق غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const vehicle = await Vehicle.findOne({
      $or: [{ driverId }, { _id: driverId }],
      companyId,
      isDeleted: false,
    });

    if (!vehicle) {
      const err = new Error("لم يتم العثور على مركبة مسندة لهذا السائق");
      err.statusCode = 404;
      throw err;
    }

    vehicle.driverId = null;
    await vehicle.save();

    return vehicle;
  }

  /**
   * Assign driver to operational team
   */
  async assignDriverToTeam(driverId, teamId, companyId) {
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
      const err = new Error("معرّف السائق غير صالح");
      err.statusCode = 400;
      throw err;
    }

    if (!teamId || !mongoose.isValidObjectId(teamId)) {
      const err = new Error("معرّف الفريق غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const [driver, team] = await Promise.all([
      User.findOne({
        _id: driverId,
        companyId,
        role: userRoles.DRIVER,
        isDeleted: false,
      }),
      Team.findOne({
        _id: teamId,
        companyId,
        isDeleted: false,
      }),
    ]);

    if (!driver) {
      const err = new Error("السائق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    if (!team) {
      const err = new Error("الفريق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    driver.teamId = team._id;
    await driver.save();

    return driver;
  }

  /**
   * Remove driver from team with atomic vehicle unlinking
   */
  async removeDriverFromTeam(driverId, companyId, user) {
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
      const err = new Error("معرّف السائق غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const filters = {
      _id: driverId,
      companyId,
      role: userRoles.DRIVER,
      isDeleted: false,
    };

    if (user && user.role === userRoles.FLEET_MANAGER) {
      if (!user.teamId) {
        const err = new Error("غير مصرح لك بإدارة هذا السائق");
        err.statusCode = 403;
        throw err;
      }
      filters.teamId = user.teamId;
    }

    const driver = await User.findOne(filters);
    if (!driver) {
      const err = new Error("السائق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    await this.withTransaction(async (session) => {
      const sessionOpt = session ? { session } : {};

      driver.teamId = null;
      await driver.save(sessionOpt);

      // Unassign driver from any vehicles
      await Vehicle.updateMany(
        { driverId, companyId },
        { driverId: null },
        sessionOpt
      );
    });

    return true;
  }

  /**
   * Soft delete driver with atomic vehicle dissociation
   */
  async deleteDriver(driverId, companyId, user) {
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
      const err = new Error("معرّف السائق غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const filters = {
      _id: driverId,
      companyId,
      role: userRoles.DRIVER,
      isDeleted: false,
    };

    if (user && user.role === userRoles.FLEET_MANAGER) {
      if (!user.teamId) {
        const err = new Error("غير مصرح لك بحذف هذا السائق");
        err.statusCode = 403;
        throw err;
      }
      filters.teamId = user.teamId;
    }

    const driver = await User.findOne(filters);
    if (!driver) {
      const err = new Error("السائق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    // Check if driver is currently in an active task
    const hasActiveTask = await Task.exists({
      driverId,
      companyId,
      status: { $in: [taskStatus.INPROGRESS, taskStatus.PENDING] },
    });

    if (hasActiveTask) {
      const err = new Error("لا يمكن حذف السائق لوجود مهمة نشطة أو معلقة قيد التنفيذ مسندة إليه");
      err.statusCode = 400;
      throw err;
    }

    await this.withTransaction(async (session) => {
      const sessionOpt = session ? { session } : {};

      driver.isDeleted = true;
      driver.teamId = null;
      await driver.save(sessionOpt);

      await Vehicle.updateMany(
        { driverId, companyId },
        { driverId: null },
        sessionOpt
      );
    });

    return true;
  }

  /**
   * Get comprehensive operational statistics for single driver
   */
  async getDriverStats(driverId, companyId) {
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
      const err = new Error("معرّف السائق غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const driver = await User.findOne({
      _id: driverId,
      companyId,
      role: userRoles.DRIVER,
      isDeleted: false,
    }).lean();

    if (!driver) {
      const err = new Error("السائق غير موجود");
      err.statusCode = 404;
      throw err;
    }

    const [tasks, fuel] = await Promise.all([
      Task.aggregate([
        { $match: { driverId: new mongoose.Types.ObjectId(driverId), companyId: new mongoose.Types.ObjectId(companyId) } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            finishedTasks: {
              $sum: { $cond: [{ $eq: ["$status", taskStatus.FINISHED] }, 1, 0] },
            },
            inProgressTasks: {
              $sum: { $cond: [{ $eq: ["$status", taskStatus.INPROGRESS] }, 1, 0] },
            },
            onTimeTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", taskStatus.FINISHED] },
                      { $ne: ["$finishedAt", null] },
                      { $ne: ["$expectedEndTime", null] },
                      { $lte: ["$finishedAt", "$expectedEndTime"] },
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
        {
          $match: {
            userId: new mongoose.Types.ObjectId(driverId),
            companyId: new mongoose.Types.ObjectId(companyId),
            status: expenseRecordStatus.APPROVED,
          },
        },
        {
          $group: {
            _id: null,
            totalFuelCost: { $sum: "$cost" },
            totalFuelQty: { $sum: "$qty" },
            recordsCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const taskStats = tasks[0] || {
      totalTasks: 0,
      finishedTasks: 0,
      inProgressTasks: 0,
      onTimeTasks: 0,
    };

    const fuelStats = fuel[0] || {
      totalFuelCost: 0,
      totalFuelQty: 0,
      recordsCount: 0,
    };

    const onTimeRate = taskStats.finishedTasks > 0
      ? Math.round((taskStats.onTimeTasks / taskStats.finishedTasks) * 100)
      : 100;

    return {
      totalTasks: taskStats.totalTasks,
      finishedTasks: taskStats.finishedTasks,
      inProgressTasks: taskStats.inProgressTasks,
      onTimeRate,
      totalFuelCost: fuelStats.totalFuelCost,
      totalFuelQty: fuelStats.totalFuelQty,
      fuelRecordsCount: fuelStats.recordsCount,
      driverScore: driver.driverScore ?? 100,
      faultIncidentsCount: driver.faultIncidentsCount ?? 0,
    };
  }
}

module.exports = new DriverService();
