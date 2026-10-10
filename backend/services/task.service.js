const mongoose = require("mongoose");
const Task = require("../models/task.model");
const TaskLivePoint = require("../models/taskLivePoint.model");
const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");
const { userRoles } = require("../data/roles");
const { mainStatus, taskStatus } = require("../data/status");
const { getDriverVehicleEligibilityError } = require("../utils/driverEligibility");
const { getExpectedEndTime } = require("../utils/taskEndTime");
const { finalizeTripSummary, stopTelemetryTracking } = require("./gpsIngestion.service");
const { notifyTripCompleted } = require("./socket.service");
const { calculateTaskFuelConsumption } = require("../utils/fuelConsumption");
const { paginate } = require("../utils/paginate");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

class TaskService {
  /**
   * Helper to execute operations in a resilient transaction with standalone replica-set fallback
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
   * Get overall task operational stats via fast MongoDB aggregation
   */
  async getTaskStats(user, scopedTeamId) {
    const match = { companyId: user.companyId };
    if (scopedTeamId) {
      match.teamId = scopedTeamId;
    }

    const now = new Date();

    const [stats] = await Task.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", taskStatus.PENDING] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", taskStatus.INPROGRESS] }, 1, 0] },
          },
          finished: {
            $sum: { $cond: [{ $eq: ["$status", taskStatus.FINISHED] }, 1, 0] },
          },
          declined: {
            $sum: { $cond: [{ $eq: ["$status", taskStatus.DECLINED] }, 1, 0] },
          },
          delayed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ["$status", [taskStatus.PENDING, taskStatus.INPROGRESS]] },
                    { $ne: ["$expectedEndTime", null] },
                    { $lt: ["$expectedEndTime", now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const total = stats?.total || 0;
    const finished = stats?.finished || 0;
    const completionRate = total > 0 ? Math.round((finished / total) * 100) : 0;

    return {
      stats: {
        total,
        pending: stats?.pending || 0,
        inProgress: stats?.inProgress || 0,
        finished,
        declined: stats?.declined || 0,
        delayed: stats?.delayed || 0,
        completionRate,
      },
    };
  }

  /**
   * Create a new task with driver and vehicle validation
   */
  async createTask(
    {
      description,
      driverId,
      vehicleId,
      startTime,
      expectedEndTime,
      pickupLocation,
      deliveryLocation,
      teamId: providedTeamId,
    },
    user,
    scopedTeamId
  ) {
    const effectiveTeamId = scopedTeamId || providedTeamId;
    if (!effectiveTeamId) {
      const err = new Error("الفريق المسؤول عن المهمة مطلوب");
      err.statusCode = 400;
      throw err;
    }

    const endTime = getExpectedEndTime(startTime, expectedEndTime);
    if (!endTime) {
      const err = new Error("وقت التسليم المتوقع يجب أن يكون بعد موعد الانطلاق بـ 15 دقيقة على الأقل");
      err.statusCode = 400;
      throw err;
    }

    const vehicleFilters = {
      _id: vehicleId,
      companyId: user.companyId,
      status: mainStatus.ACTIVE,
      isDeleted: false,
    };
    if (scopedTeamId) vehicleFilters.teamId = scopedTeamId;

    const vehicle = await Vehicle.findOne(vehicleFilters);
    if (!vehicle) {
      const err = new Error("المركبة غير موجودة أو غير نشطة أو غير تابعة لهذا الفريق");
      err.statusCode = 404;
      throw err;
    }

    const assignedDriverId = driverId || vehicle.driverId;
    if (!assignedDriverId) {
      const err = new Error("تحديد السائق مطلوب لأن المركبة المختارة لا تملك سائقاً مسنداً");
      err.statusCode = 400;
      throw err;
    }

    const driverFilters = {
      _id: assignedDriverId,
      companyId: user.companyId,
      status: mainStatus.ACTIVE,
      isDeleted: false,
    };
    if (scopedTeamId) driverFilters.teamId = scopedTeamId;

    const driver = await User.findOne(driverFilters);
    if (!driver) {
      const err = new Error("السائق غير موجود أو غير نشط أو غير تابع لهذا الفريق");
      err.statusCode = 404;
      throw err;
    }

    if (driver.role !== userRoles.DRIVER) {
      const err = new Error("المستخدم المحدد يجب أن يكون سائقاً");
      err.statusCode = 400;
      throw err;
    }

    if (!driver.teamId || !vehicle.teamId || vehicle.teamId.toString() !== driver.teamId.toString()) {
      const err = new Error("يجب أن تنتمي المركبة والسائق لنفس الفريق التشغيلي");
      err.statusCode = 400;
      throw err;
    }

    const eligibilityError = getDriverVehicleEligibilityError(driver, vehicle);
    if (eligibilityError) {
      const err = new Error(eligibilityError);
      err.statusCode = 400;
      throw err;
    }

    const task = await Task.create({
      description: description.trim(),
      vehicleId,
      driverId: assignedDriverId,
      startTime,
      expectedEndTime: endTime,
      pickupLocation,
      deliveryLocation,
      teamId: effectiveTeamId,
      companyId: user.companyId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("driverId", "name email phone avatar")
      .populate("vehicleId", "plateNumber model year type status isInTask")
      .populate("teamId", "name");

    return { task: populatedTask };
  }

  /**
   * List tasks with filters, search, and pagination
   */
  async listTasks(
    {
      vehicleId,
      driverId,
      teamId: queryTeamId,
      status,
      search,
      page,
      limit,
      all = false,
    },
    user,
    scopedTeamId
  ) {
    const filters = { companyId: user.companyId };

    // Role-based scoping
    if (scopedTeamId) {
      filters.teamId = scopedTeamId;
    } else if (queryTeamId && mongoose.Types.ObjectId.isValid(queryTeamId)) {
      filters.teamId = queryTeamId;
    }

    if (status && Object.values(taskStatus).includes(status)) {
      filters.status = status;
    }

    if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) {
      filters.vehicleId = vehicleId;
    }

    if (driverId && mongoose.Types.ObjectId.isValid(driverId)) {
      filters.driverId = driverId;
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const regex = new RegExp(safeSearch, "i");

      const [matchingDrivers, matchingVehicles] = await Promise.all([
        User.find({
          companyId: user.companyId,
          role: userRoles.DRIVER,
          name: { $regex: regex },
        }).select("_id").lean(),
        Vehicle.find({
          companyId: user.companyId,
          $or: [
            { model: { $regex: regex } },
            ...(isNaN(Number(search.trim())) ? [] : [{ plateNumber: Number(search.trim()) }]),
          ],
        }).select("_id").lean(),
      ]);

      const driverIds = matchingDrivers.map((d) => d._id);
      const vehicleIds = matchingVehicles.map((v) => v._id);

      const searchConditions = [{ description: { $regex: regex } }];
      if (driverIds.length > 0) {
        searchConditions.push({ driverId: { $in: driverIds } });
      }
      if (vehicleIds.length > 0) {
        searchConditions.push({ vehicleId: { $in: vehicleIds } });
      }

      filters.$or = searchConditions;
    }

    const populate = [
      { path: "driverId", select: "name email phone avatar" },
      { path: "vehicleId", select: "plateNumber model year type status isInTask" },
      { path: "teamId", select: "name" },
    ];

    if (page && !all) {
      const result = await paginate(Task, filters, {
        page,
        limit,
        populate,
        sort: { createdAt: -1 },
      });
      return {
        tasks: result.docs,
        pagination: result.pagination,
      };
    }

    const tasks = await Task.find(filters)
      .populate(populate[0])
      .populate(populate[1])
      .populate(populate[2])
      .sort({ createdAt: -1 })
      .lean();

    return { tasks };
  }

  /**
   * Get single task by ID
   */
  async getTaskById(id, user, scopedTeamId) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("معرف المهمة غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const filters = { _id: id, companyId: user.companyId };
    if (scopedTeamId) filters.teamId = scopedTeamId;

    const task = await Task.findOne(filters)
      .populate("driverId", "name email phone avatar")
      .populate("vehicleId", "plateNumber model year type status isInTask")
      .populate("teamId", "name");

    if (!task) {
      const err = new Error("المهمة غير موجودة أو غير مصرح بالوصول إليها");
      err.statusCode = 404;
      throw err;
    }

    return { task };
  }

  /**
   * Update pending task details
   */
  async updateTask(
    id,
    {
      description,
      driverId,
      vehicleId,
      startTime,
      expectedEndTime,
      pickupLocation,
      deliveryLocation,
      teamId: providedTeamId,
    },
    user,
    scopedTeamId
  ) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("معرف المهمة غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const taskFilters = { _id: id, companyId: user.companyId };
    if (scopedTeamId) taskFilters.teamId = scopedTeamId;

    const task = await Task.findOne(taskFilters);
    if (!task) {
      const err = new Error("المهمة غير موجودة");
      err.statusCode = 404;
      throw err;
    }

    if (task.status !== taskStatus.PENDING) {
      const err = new Error("لا يمكن تعديل المهمة إلا عندما تكون في حالة قيد الانتظار");
      err.statusCode = 400;
      throw err;
    }

    const nextStartTime = startTime !== undefined ? startTime : task.startTime;
    const nextExpectedEndTime = expectedEndTime !== undefined ? expectedEndTime : task.expectedEndTime;
    const validatedExpectedEndTime = getExpectedEndTime(nextStartTime, nextExpectedEndTime);
    if (!validatedExpectedEndTime) {
      const err = new Error("وقت التسليم المتوقع يجب أن يكون بعد موعد الانطلاق بساعتين على الأقل");
      err.statusCode = 400;
      throw err;
    }

    const nextDriverId = driverId || task.driverId;
    const nextVehicleId = vehicleId || task.vehicleId;
    const teamFilters = scopedTeamId ? { teamId: scopedTeamId } : {};

    const [nextDriver, nextVehicle] = await Promise.all([
      User.findOne({ _id: nextDriverId, companyId: user.companyId, isDeleted: false, ...teamFilters }),
      Vehicle.findOne({ _id: nextVehicleId, companyId: user.companyId, isDeleted: false, ...teamFilters }),
    ]);

    if (!nextDriver) {
      const err = new Error("السائق غير موجود أو غير تابع للفريق");
      err.statusCode = 400;
      throw err;
    }
    if (nextDriver.role !== userRoles.DRIVER) {
      const err = new Error("المستخدم المحدد يجب أن يكون سائقاً");
      err.statusCode = 400;
      throw err;
    }
    if (nextDriver.status !== mainStatus.ACTIVE) {
      const err = new Error("حساب السائق غير نشط");
      err.statusCode = 400;
      throw err;
    }
    if (!nextVehicle) {
      const err = new Error("المركبة غير موجودة أو غير تابعة للفريق");
      err.statusCode = 400;
      throw err;
    }
    if (nextVehicle.status !== mainStatus.ACTIVE) {
      const err = new Error("المركبة غير نشطة");
      err.statusCode = 400;
      throw err;
    }
    if (nextVehicle.isInTask && nextVehicle._id.toString() !== task.vehicleId.toString()) {
      const err = new Error("المركبة مرتبطة بمهمة أخرى جارية حالياً");
      err.statusCode = 409;
      throw err;
    }
    if (!nextDriver.teamId || !nextVehicle.teamId || nextDriver.teamId.toString() !== nextVehicle.teamId.toString()) {
      const err = new Error("يجب أن ينتمي السائق والمركبة لنفس الفريق");
      err.statusCode = 400;
      throw err;
    }

    const eligibilityError = getDriverVehicleEligibilityError(nextDriver, nextVehicle);
    if (eligibilityError) {
      const err = new Error(eligibilityError);
      err.statusCode = 400;
      throw err;
    }

    const updates = {
      driverId: nextDriverId,
      vehicleId: nextVehicleId,
      expectedEndTime: validatedExpectedEndTime,
    };
    if (providedTeamId && !scopedTeamId) updates.teamId = providedTeamId;

    const optionalUpdates = { description, startTime, pickupLocation, deliveryLocation };
    for (const [field, value] of Object.entries(optionalUpdates)) {
      if (value !== undefined) updates[field] = value;
    }

    Object.assign(task, updates);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("driverId", "name email phone avatar")
      .populate("vehicleId", "plateNumber model year type status isInTask")
      .populate("teamId", "name");

    return { task: populatedTask };
  }

  /**
   * Driver accepts pending task to begin trip
   */
  async acceptTask(id, user) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("معرف المهمة غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const task = await Task.findOne({
      _id: id,
      companyId: user.companyId,
      teamId: user.teamId,
      driverId: user._id,
    });
    if (!task) {
      const err = new Error("المهمة غير موجودة أو غير مسندة لك");
      err.statusCode = 404;
      throw err;
    }

    if (task.status !== taskStatus.PENDING) {
      const err = new Error("لا يمكن قبول هذه المهمة لأنها ليست في حالة قيد الانتظار");
      err.statusCode = 400;
      throw err;
    }

    const GRACE_PERIOD_MS = 30 * 60 * 1000; // 30 دقيقة سماح مبكر
    const earliestAllowedStart = new Date(new Date(task.startTime).getTime() - GRACE_PERIOD_MS);
    if (new Date() < earliestAllowedStart) {
      const err = new Error("لا يمكنك قبول وبدء تنفيذ المهمة قبل موعد انطلاقها بأكثر من 30 دقيقة");
      err.statusCode = 400;
      throw err;
    }

    const vehicle = await Vehicle.findOne({
      _id: task.vehicleId,
      companyId: user.companyId,
      teamId: user.teamId,
      status: mainStatus.ACTIVE,
      isDeleted: false,
      isInTask: false,
    });

    if (!vehicle) {
      const err = new Error("المركبة غير متاحة حالياً لبدء المهمة");
      err.statusCode = 409;
      throw err;
    }

    const vehicleUpdate = await Vehicle.updateOne(
      {
        _id: vehicle._id,
        companyId: user.companyId,
        teamId: user.teamId,
        status: mainStatus.ACTIVE,
        isDeleted: false,
        isInTask: false,
      },
      { $set: { isInTask: true } }
    );
    if (!vehicleUpdate.modifiedCount) {
      const err = new Error("المركبة مشغولة بمهمة أخرى حالياً");
      err.statusCode = 409;
      throw err;
    }

    const startedAt = new Date();
    const acceptedTask = await Task.findOneAndUpdate(
      {
        _id: task._id,
        companyId: user.companyId,
        teamId: user.teamId,
        driverId: user._id,
        status: taskStatus.PENDING,
      },
      {
        $set: {
          status: taskStatus.INPROGRESS,
          startedAt,
          startOdometer: vehicle.currentOdometer || 0,
        },
      },
      { new: true }
    );

    if (!acceptedTask) {
      await Vehicle.updateOne({ _id: vehicle._id }, { $set: { isInTask: false } });
      const err = new Error("المهمة لم تعد متاحة للبدء");
      err.statusCode = 409;
      throw err;
    }

    return { task: acceptedTask };
  }

  /**
   * Driver or Manager finishes task and records final fuel / distance
   */
  async finishTask(id, user, body = {}) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("معرف المهمة غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const taskFilters = { _id: id, companyId: user.companyId };
    if (user.role === userRoles.DRIVER) {
      taskFilters.driverId = user._id;
    }
    if (user.teamId) {
      taskFilters.teamId = user.teamId;
    }

    const task = await Task.findOne(taskFilters);
    if (!task) {
      const err = new Error("المهمة غير موجودة");
      err.statusCode = 404;
      throw err;
    }

    const isAlreadyFinished = task.status === taskStatus.FINISHED;
    if (task.status !== taskStatus.INPROGRESS && !isAlreadyFinished) {
      const err = new Error("لا يمكن إنهاء المهمة لأنها ليست قيد التنفيذ حالياً");
      err.statusCode = 400;
      throw err;
    }

    const vehicle = await Vehicle.findOne({
      _id: task.vehicleId,
      companyId: user.companyId,
      isDeleted: false,
    });
    if (!vehicle) {
      const err = new Error("المركبة المسندة للمهمة غير موجودة");
      err.statusCode = 404;
      throw err;
    }

    const rawManualOdo = body?.endOdometer;
    let manualEndOdometer = null;
    if (rawManualOdo !== undefined && rawManualOdo !== null && rawManualOdo !== "") {
      manualEndOdometer = Number(rawManualOdo);
      if (!Number.isFinite(manualEndOdometer) || manualEndOdometer < (task.startOdometer || 0)) {
        const err = new Error("قراءة العداد النهائية يجب أن تكون رقماً أكبر من أو يساوي قراءة بداية المهمة");
        err.statusCode = 400;
        throw err;
      }
    }

    if (!isAlreadyFinished) {
      task.status = taskStatus.FINISHED;
      task.finishedAt = new Date();
      await task.save();
    }

    const tripSummary =
      task.tripSummary?.finishedAt && task.tripSummary?.encodedPath
        ? task.tripSummary
        : await finalizeTripSummary(task);
    if (!tripSummary) {
      throw new Error("تعذر إغلاق وتلخيص مسار الـ GPS للمهمة");
    }

    if (manualEndOdometer !== null) {
      task.endOdometer = manualEndOdometer;
      await task.save();
    }

    const endOdometer = task.endOdometer;
    if (!Number.isFinite(endOdometer)) {
      throw new Error("قراءة العداد النهائية غير صالحة");
    }

    if (!task.fuelConsumptionAppliedAt) {
      const fuelConsumedLitres = calculateTaskFuelConsumption({
        startOdometer: task.startOdometer,
        endOdometer,
        expectedFuelEfficiency: vehicle.expectedFuelEfficiency,
      });
      if (fuelConsumedLitres === null) {
        const err = new Error("قراءة العداد أو معدل كفاءة الوقود للمركبة غير صالحة لحساب الاستهلاك");
        err.statusCode = 409;
        throw err;
      }

      await this.withTransaction(async (session) => {
        const sessionOpt = session ? { session } : {};
        const taskUpdate = await Task.updateOne(
          { _id: task._id, fuelConsumptionAppliedAt: null },
          {
            $set: {
              fuelConsumedLitres,
              fuelConsumptionAppliedAt: new Date(),
            },
          },
          sessionOpt
        );

        if (taskUpdate.modifiedCount) {
          const balanceUpdate = await Vehicle.updateOne(
            {
              _id: task.vehicleId,
              companyId: user.companyId,
              isDeleted: false,
            },
            { $inc: { fuelBalanceLitres: -fuelConsumedLitres } },
            sessionOpt
          );
          if (!balanceUpdate.matchedCount) {
            throw new Error("لم يتم العثور على المركبة لخصم استهلاك الوقود");
          }
        }
      });
    }

    const vehicleUpdate = await Vehicle.updateOne(
      {
        _id: task.vehicleId,
        companyId: user.companyId,
        isDeleted: false,
      },
      {
        $set: {
          isInTask: false,
          gpsStatus: "available",
          "currentLocation.speed": 0,
        },
        $max: { currentOdometer: endOdometer },
      }
    );
    if (!vehicleUpdate.matchedCount) {
      throw new Error("لم يتم العثور على المركبة لتحديث حالتها بعد إنهاء المهمة");
    }

    if (tripSummary?.encodedPath) {
      await TaskLivePoint.deleteMany({ taskId: task._id });
    }
    stopTelemetryTracking(task.vehicleId);

    notifyTripCompleted(user.companyId, task.teamId, tripSummary);

    return { success: true };
  }

  /**
   * Decline or cancel task by Manager or Driver
   */
  async declineTask(id, { declineReason }, user, scopedTeamId) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("معرف المهمة غير صالح");
      err.statusCode = 400;
      throw err;
    }

    const filters = { _id: id, companyId: user.companyId };
    if (scopedTeamId) filters.teamId = scopedTeamId;

    const task = await Task.findOne(filters);
    if (!task) {
      const err = new Error("المهمة غير موجودة");
      err.statusCode = 404;
      throw err;
    }

    if (![taskStatus.PENDING, taskStatus.INPROGRESS].includes(task.status)) {
      const err = new Error("لا يمكن إلغاء هذه المهمة لأنها ليست معلقة أو قيد التنفيذ");
      err.statusCode = 400;
      throw err;
    }

    task.declineReason = declineReason || "تم الإلغاء بواسطة الإدارة";
    task.status = taskStatus.DECLINED;
    await task.save();

    await Vehicle.findByIdAndUpdate(task.vehicleId, {
      isInTask: false,
      gpsStatus: "available",
      "currentLocation.speed": 0,
    });

    await TaskLivePoint.deleteMany({ taskId: task._id });
    stopTelemetryTracking(task.vehicleId);

    return { task };
  }

  /**
   * List tasks assigned to a specific driver
   */
  async listDriverTasks(user, { page, limit, all = false }) {
    const filters = { driverId: user._id, companyId: user.companyId };

    const populate = [
      { path: "vehicleId", select: "plateNumber model year type status isInTask" },
      { path: "teamId", select: "name" },
    ];

    if (page && !all) {
      const result = await paginate(Task, filters, {
        page,
        limit,
        populate,
        sort: { createdAt: -1 },
      });
      return {
        tasks: result.docs,
        pagination: result.pagination,
      };
    }

    const tasks = await Task.find(filters)
      .populate(populate[0])
      .populate(populate[1])
      .sort({ createdAt: -1 })
      .lean();

    return { tasks };
  }
}

module.exports = new TaskService();
