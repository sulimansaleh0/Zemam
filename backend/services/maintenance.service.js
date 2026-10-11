const mongoose = require("mongoose");
const Maintenance = require("../models/maintenance.model");
const Vehicle = require("../models/vehicle.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const { userRoles } = require("../data/roles");
const { expenseRecordStatus, taskStatus, mainStatus, vehicleStatus } = require("../data/status");
const { maintenancePriority } = require("../data");
const { paginate } = require("../utils/paginate");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

class MaintenanceService {
  /**
   * تنفيذ العمليات داخل جلسة مع دعم السقوط الآمن في حال عدم وجود Replica Set
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
        await session.endSession();
      }
    }
  }

  /**
   * إنشاء وتوثيق طلب أو بلاغ صيانة جديد
   */
  async createMaintenanceRecord({
    user,
    vehicleId,
    description,
    cost,
    images,
    category,
    priority,
    odometer,
  }) {
    const vehicleFilters = {
      _id: vehicleId,
      companyId: user.companyId,
      status: mainStatus.ACTIVE,
      isDeleted: false,
    };

    if (user.role === userRoles.FLEET_MANAGER) {
      vehicleFilters.teamId = user.teamId;
    }

    if (user.role === userRoles.DRIVER) {
      const activeTask = await Task.findOne({
        driverId: user._id,
        vehicleId,
        companyId: user.companyId,
        status: { $in: [taskStatus.INPROGRESS, taskStatus.PENDING] },
      });

      const isAssigned = await Vehicle.findOne({
        _id: vehicleId,
        driverId: user._id,
        companyId: user.companyId,
      });

      if (!activeTask && !isAssigned) {
        throw {
          status: 403,
          message: "يمكنك الإبلاغ عن صيانة فقط للمركبة المسندة إليك أو في مهمة نشطة",
        };
      }

      if (activeTask) {
        vehicleFilters.teamId = activeTask.teamId;
      }
    }

    const vehicle = await Vehicle.findOne(vehicleFilters);
    if (!vehicle) {
      throw { status: 404, message: "المركبة غير موجودة أو غير مصرح لك بالإبلاغ عنها" };
    }

    const inputOdo = Number(odometer);
    const effectiveOdometer =
      Number.isFinite(inputOdo) && inputOdo >= 0 ? inputOdo : (vehicle.currentOdometer || 0);

    const numericCost = cost != null && cost !== "" ? Number(cost) : 0;
    let createdRecord = null;

    await this.withTransaction(async (session) => {
      const recordData = {
        vehicleId: vehicle._id,
        description,
        cost: numericCost,
        images: Array.isArray(images) ? images : [],
        category,
        odoMeter: effectiveOdometer,
        companyId: user.companyId,
        teamId: vehicle.teamId || null,
        reportedBy: user._id,
        driverId: user.role === userRoles.DRIVER ? user._id : vehicle.driverId,
        priority,
      };

      const [newRecord] = await Maintenance.create([recordData], session ? { session } : {});
      createdRecord = newRecord;

      // تحديث عداد المركبة إذا كانت القراءة المدخلة أعلى من الحالية
      if (effectiveOdometer > (vehicle.currentOdometer || 0)) {
        const odoUpdate = Vehicle.updateOne(
          { _id: vehicle._id, companyId: user.companyId },
          { $max: { currentOdometer: effectiveOdometer } }
        );
        if (session) odoUpdate.session(session);
        await odoUpdate;
      }

      // تحويل حالة المركبة إلى قيد الصيانة إذا كانت الأولوية عالية
      if (priority === maintenancePriority.HIGH) {
        const statusUpdate = Vehicle.updateOne(
          { _id: vehicle._id, companyId: user.companyId },
          { $set: { status: vehicleStatus.INMAINTENANCE } }
        );
        if (session) statusUpdate.session(session);
        await statusUpdate;
      }
    });

    const populatedRecord = await Maintenance.findById(createdRecord._id)
      .populate("vehicleId", "model plateNumber currentOdometer")
      .populate("reportedBy", "name email role")
      .populate("driverId", "name email role");

    return populatedRecord || createdRecord;
  }

  /**
   * استعلام سجلات الصيانة مع دعم الفلاتر والبحث والترقيم السيرفري
   */
  async listMaintenanceRecords({
    user,
    teamId,
    status,
    category,
    vehicleId,
    search,
    page,
    limit,
    all,
  }) {
    const filters = { companyId: user.companyId };

    if (user.role === userRoles.DRIVER) {
      // عزل أمني: السائق يرى حصراً السجلات المبلغ عنها من قبله أو المسندة له
      filters.$or = [{ driverId: user._id }, { reportedBy: user._id }];
    } else if (user.role === userRoles.FLEET_MANAGER) {
      filters.teamId = user.teamId;
    } else if (teamId && teamId !== "all") {
      if (mongoose.Types.ObjectId.isValid(teamId)) {
        filters.teamId = teamId;
      }
    }

    if (status && status !== "all") {
      filters.status = status;
    }

    if (category && category !== "all") {
      filters.category = category;
    }

    if (vehicleId && vehicleId !== "all") {
      if (mongoose.Types.ObjectId.isValid(vehicleId)) {
        filters.vehicleId = vehicleId;
      }
    }

    // البحث النصي في وصف الصيانة والمركبة وصاحب البلاغ
    if (search && typeof search === "string" && search.trim()) {
      const cleanSearch = escapeRegex(search.trim());
      const regex = new RegExp(cleanSearch, "i");
      const plateNum = Number(search.trim());

      const [matchingVehicles, matchingUsers] = await Promise.all([
        Vehicle.find({
          companyId: user.companyId,
          isDeleted: false,
          $or: [
            { model: regex },
            ...(Number.isFinite(plateNum) ? [{ plateNumber: plateNum }] : []),
          ],
        }).select("_id").lean(),
        User.find({
          companyId: user.companyId,
          $or: [{ name: regex }, { email: regex }],
        }).select("_id").lean(),
      ]);

      const vehicleIds = matchingVehicles.map((v) => v._id);
      const userIds = matchingUsers.map((u) => u._id);

      const searchConditions = [{ description: regex }];
      if (vehicleIds.length > 0) {
        searchConditions.push({ vehicleId: { $in: vehicleIds } });
      }
      if (userIds.length > 0) {
        searchConditions.push({ reportedBy: { $in: userIds } });
      }

      if (filters.$or) {
        // دمج القيود الأمنية السابقة مع شرط البحث
        const securityOr = filters.$or;
        delete filters.$or;
        filters.$and = [{ $or: securityOr }, { $or: searchConditions }];
      } else {
        filters.$or = searchConditions;
      }
    }

    const populates = [
      { path: "vehicleId", select: "model plateNumber currentOdometer" },
      { path: "reportedBy", select: "name email role" },
      { path: "driverId", select: "name email role" },
    ];

    const shouldPaginate =
      (page !== undefined || limit !== undefined) && all !== true && all !== "true";

    if (shouldPaginate) {
      const result = await paginate(Maintenance, filters, {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        populate: populates,
        sort: { createdAt: -1 },
      });

      return {
        records: result.docs || [],
        pagination: result.pagination,
      };
    }

    const records = await Maintenance.find(filters)
      .populate(populates[0])
      .populate(populates[1])
      .populate(populates[2])
      .sort({ createdAt: -1 })
      .lean();

    return { records };
  }

  /**
   * مراجعة واعتماد أو رفض طلب الصيانة مع تحديث حالة المركبة وتقييم السائق ذرياً
   */
  async verifyMaintenanceRecord({ user, recordId, status, declineReason, isDriverFault, cost, driverId }) {
    if (!recordId) {
      throw { status: 400, message: "معرف سجل الصيانة مطلوب" };
    }

    if (
      status === expenseRecordStatus.APPROVED &&
      (cost === undefined || cost === null || cost === "" || !Number.isFinite(Number(cost)) || Number(cost) < 0)
    ) {
      throw { status: 400, message: "تكلفة الصيانة يجب أن تكون رقماً غير سالب عند الاعتماد" };
    }

    const filters = {
      _id: recordId,
      companyId: user.companyId,
      status: expenseRecordStatus.PENDING,
    };

    if (user.role === userRoles.FLEET_MANAGER) {
      filters.$or = [
        { teamId: user.teamId },
        { teamId: null },
        { teamId: { $exists: false } },
      ];
    }

    const pendingRecord = await Maintenance.findOne(filters);
    if (!pendingRecord) {
      throw { status: 404, message: "سجل الصيانة قيد المراجعة غير موجود" };
    }

    // تحديد السائق الفعلي: إما المسجل مسبقاً، أو الممرر في الطلب، أو المسند للمركبة حالياً
    let effectiveDriverId = pendingRecord.driverId || driverId || null;
    if (!effectiveDriverId && pendingRecord.vehicleId) {
      const vehicle = await Vehicle.findById(pendingRecord.vehicleId).select("driverId");
      if (vehicle?.driverId) {
        effectiveDriverId = vehicle.driverId;
      }
    }

    if (status === expenseRecordStatus.APPROVED && Boolean(isDriverFault) && !effectiveDriverId) {
      throw { status: 400, message: "يجب تحديد سائق مرتبط بالسجل قبل تحميل المسؤولية" };
    }

    await this.withTransaction(async (session) => {
      const updateData = {
        status,
        isDriverFault: status === expenseRecordStatus.APPROVED ? Boolean(isDriverFault) : false,
      };

      if (effectiveDriverId && !pendingRecord.driverId) {
        updateData.driverId = effectiveDriverId;
      }

      if (cost !== undefined && cost !== null && cost !== "") {
        updateData.cost = Number(cost);
      }

      if (status === expenseRecordStatus.DECLINED) {
        updateData.declineReason = declineReason || "تم الرفض بواسطة الإدارة";
      }

      const update = { $set: updateData };
      if (status === expenseRecordStatus.APPROVED) {
        update.$unset = { declineReason: 1 };
      }

      const updateQuery = Maintenance.updateOne(filters, update, { runValidators: true });
      if (session) updateQuery.session(session);
      const updateResult = await updateQuery;

      if (!updateResult.modifiedCount) {
        throw new Error("تعذر تحديث حالة سجل الصيانة، ربما تم تحديثه مسبقاً");
      }

      // التحقق مما إذا كانت هناك بلاغات صيانة أخرى معلقة على نفس المركبة
      const activeMaintenanceQuery = Maintenance.exists({
        vehicleId: pendingRecord.vehicleId,
        status: expenseRecordStatus.PENDING,
        _id: { $ne: pendingRecord._id },
      });
      if (session) activeMaintenanceQuery.session(session);
      const activeMaintenance = await activeMaintenanceQuery;

      // إذا لم تعد هناك أي بلاغات معلقة، نعيد المركبة للخدمة (ACTIVE)
      if (!activeMaintenance) {
        const vehicleRevert = Vehicle.updateOne(
          { _id: pendingRecord.vehicleId, companyId: user.companyId },
          { $set: { status: vehicleStatus.ACTIVE } }
        );
        if (session) vehicleRevert.session(session);
        await vehicleRevert;
      }

      // في حال ثبوت خطأ السائق ولم تتم معالجته مسبقاً، نخصم نقاط من تقييمه ونوثق السبب
      if (
        status === expenseRecordStatus.APPROVED &&
        Boolean(isDriverFault) &&
        !pendingRecord.driverFaultProcessed &&
        effectiveDriverId
      ) {
        const points = pendingRecord.priority === maintenancePriority.HIGH ? -15 : -8;

        const driverScoreLog = User.updateOne(
          { _id: effectiveDriverId },
          {
            $inc: { faultIncidentsCount: 1 },
            $push: {
              scoreHistory: {
                pointsChange: points,
                reason: "اعتماد بلاغ صيانة ناتج عن خطأ السائق",
                category: "maintenance",
                relatedId: pendingRecord._id,
              },
            },
          }
        );
        if (session) driverScoreLog.session(session);
        await driverScoreLog;

        const driverScoreDec = User.findOneAndUpdate(
          { _id: effectiveDriverId },
          [{ $set: { driverScore: { $max: [0, { $add: ["$driverScore", points] }] } } }],
          { updatePipeline: true, session: session || undefined }
        );
        await driverScoreDec;

        const markProcessed = Maintenance.updateOne(
          { _id: pendingRecord._id },
          { $set: { driverFaultProcessed: true } }
        );
        if (session) markProcessed.session(session);
        await markProcessed;
      }
    });

    const updatedRecord = await Maintenance.findById(recordId)
      .populate("vehicleId", "model plateNumber currentOdometer")
      .populate("reportedBy", "name email role")
      .populate("driverId", "name email role");

    return updatedRecord;
  }

  /**
   * تجميع إحصائيات وتكاليف الصيانة من السيرفر
   */
  async getMaintenanceStats({ user, teamId }) {
    const match = { companyId: user.companyId };

    if (user.role === userRoles.FLEET_MANAGER) {
      match.teamId = user.teamId;
    } else if (teamId && teamId !== "all") {
      if (mongoose.Types.ObjectId.isValid(teamId)) {
        match.teamId = teamId;
      }
    }

    const [summary] = await Maintenance.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalCost: {
            $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$cost", 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.PENDING] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, 1, 0] } },
          declined: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.DECLINED] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]);

    return (
      summary || {
        totalRecords: 0,
        totalCost: 0,
        pending: 0,
        approved: 0,
        declined: 0,
      }
    );
  }
}

const maintenanceService = new MaintenanceService();

module.exports = {
  MaintenanceService,
  maintenanceService,
  createMaintenanceRecord: maintenanceService.createMaintenanceRecord.bind(maintenanceService),
  listMaintenanceRecords: maintenanceService.listMaintenanceRecords.bind(maintenanceService),
  verifyMaintenanceRecord: maintenanceService.verifyMaintenanceRecord.bind(maintenanceService),
  getMaintenanceStats: maintenanceService.getMaintenanceStats.bind(maintenanceService),
};
