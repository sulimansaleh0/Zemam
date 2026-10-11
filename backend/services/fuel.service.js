const mongoose = require("mongoose");
const Fuel = require("../models/fuel.model");
const Task = require("../models/task.model");
const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");
const { userRoles } = require("../data/roles");
const { mainStatus, taskStatus, expenseRecordStatus } = require("../data/status");
const { paginate } = require("../utils/paginate");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const configuredEfficiencyTolerance = Number(process.env.FUEL_EFFICIENCY_TOLERANCE_PERCENT);
const fuelEfficiencyTolerancePercent =
  Number.isFinite(configuredEfficiencyTolerance) && configuredEfficiencyTolerance >= 0
    ? configuredEfficiencyTolerance
    : 20;

class FuelService {
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
        await session.endSession();
      }
    }
  }

  /**
   * جلب كميات الوقود المسجلة بين دورتي تعبئة كاملة
   */
  async getFuelRecordsBetweenFullRefills({ vehicleId, companyId, previousFull, currentFull, session }) {
    const aggregateQuery = Fuel.aggregate([
      {
        $match: {
          vehicleId,
          companyId,
          status: expenseRecordStatus.APPROVED,
          $and: [
            {
              $or: [
                { createdAt: { $gt: previousFull.createdAt } },
                { createdAt: previousFull.createdAt, _id: { $gt: previousFull._id } },
              ],
            },
            {
              $or: [
                { createdAt: { $lt: currentFull.createdAt } },
                { createdAt: currentFull.createdAt, _id: { $lte: currentFull._id } },
              ],
            },
          ],
        },
      },
      { $group: { _id: null, totalFuel: { $sum: "$qty" } } },
    ]);

    if (session) {
      aggregateQuery.session(session);
    }

    const records = await aggregateQuery;
    return records[0]?.totalFuel || 0;
  }

  /**
   * فحص انحراف استهلاك الوقود عن المعدل المتوقع للمركبة
   */
  buildFuelIssue({ distance, actualEfficiency, expectedEfficiency }) {
    if (distance < 0) {
      return {
        fuelIssue: true,
        fuelIssueType: "efficiency_deviation",
        fuelIssueMessage: "قراءة العداد أقل من التعبئة الكاملة السابقة؛ لا يمكن احتساب الكفاءة بدقة.",
      };
    }

    const hasEfficiencyIssue =
      actualEfficiency !== null &&
      Number.isFinite(expectedEfficiency) &&
      expectedEfficiency > 0 &&
      (Math.abs(actualEfficiency - expectedEfficiency) / expectedEfficiency) * 100 >
        fuelEfficiencyTolerancePercent;

    if (!hasEfficiencyIssue) {
      return {
        fuelIssue: false,
        fuelIssueType: null,
        fuelIssueMessage: null,
      };
    }

    const isHighConsumption = actualEfficiency < expectedEfficiency;
    return {
      fuelIssue: true,
      fuelIssueType: isHighConsumption ? "high_consumption" : "efficiency_deviation",
      fuelIssueMessage: isHighConsumption
        ? `الكفاءة الفعلية (${actualEfficiency.toFixed(2)} كم/لتر) أقل من المتوقع (${expectedEfficiency.toFixed(2)} كم/لتر) بنسبة تتجاوز ${fuelEfficiencyTolerancePercent}%.`
        : `الكفاءة الفعلية (${actualEfficiency.toFixed(2)} كم/لتر) تختلف عن المتوقع (${expectedEfficiency.toFixed(2)} كم/لتر) بنسبة تتجاوز ${fuelEfficiencyTolerancePercent}%.`,
    };
  }

  /**
   * احتساب دورة التعبئة الكاملة وتحديد الكفاءة والانحرافات
   */
  async calculateFullTankCycle({ fuelRecord, vehicle, companyId, session }) {
    const query = Fuel.findOne({
      vehicleId: fuelRecord.vehicleId,
      companyId,
      status: expenseRecordStatus.APPROVED,
      isFullTank: true,
      $or: [
        { createdAt: { $lt: fuelRecord.createdAt } },
        { createdAt: fuelRecord.createdAt, _id: { $lt: fuelRecord._id } },
      ],
    }).sort({ createdAt: -1, _id: -1 });

    if (session) {
      query.session(session);
    }

    const previousFull = await query;
    if (!previousFull) return null;

    const distanceSinceLastFull = fuelRecord.odometer - previousFull.odometer;
    const recordsFuel = await this.getFuelRecordsBetweenFullRefills({
      vehicleId: fuelRecord.vehicleId,
      companyId,
      previousFull,
      currentFull: fuelRecord,
      session,
    });
    const fuelSinceLastFull = recordsFuel + fuelRecord.qty;
    const fuelEfficiency =
      fuelSinceLastFull > 0 && distanceSinceLastFull >= 0
        ? distanceSinceLastFull / fuelSinceLastFull
        : null;

    return {
      distanceSinceLastFull: distanceSinceLastFull >= 0 ? distanceSinceLastFull : null,
      fuelSinceLastFull,
      fuelEfficiency,
      ...this.buildFuelIssue({
        distance: distanceSinceLastFull,
        actualEfficiency: fuelEfficiency,
        expectedEfficiency: vehicle.expectedFuelEfficiency,
      }),
    };
  }

  /**
   * تجميع إحصائيات الوقود والتكلفة ورصيد المركبات من السيرفر
   */
  async getFuelStats({ companyId, teamId, vehicleId }) {
    const fuelMatch = { companyId };
    if (teamId) fuelMatch.teamId = teamId;
    if (vehicleId) fuelMatch.vehicleId = vehicleId;

    const taskMatch = { companyId, status: taskStatus.FINISHED };
    if (teamId) taskMatch.teamId = teamId;
    if (vehicleId) taskMatch.vehicleId = vehicleId;

    const vehicleMatch = { companyId, isDeleted: false };
    if (teamId) vehicleMatch.teamId = teamId;
    if (vehicleId) vehicleMatch._id = vehicleId;

    const [[fuelSummary], [taskSummary], [balanceSummary]] = await Promise.all([
      Fuel.aggregate([
        { $match: fuelMatch },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            totalCost: {
              $sum: {
                $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$cost", 0],
              },
            },
            totalQty: { $sum: "$qty" },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.PENDING] }, 1, 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, 1, 0] },
            },
            declined: {
              $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.DECLINED] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalRecords: 1,
            totalCost: 1,
            totalQty: 1,
            pending: 1,
            approved: 1,
            declined: 1,
          },
        },
      ]),
      Task.aggregate([
        { $match: taskMatch },
        {
          $group: {
            _id: null,
            distance: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$fuelConsumptionAppliedAt", null] },
                      { $ne: ["$startOdometer", null] },
                      { $ne: ["$endOdometer", null] },
                      { $gte: ["$endOdometer", "$startOdometer"] },
                    ],
                  },
                  { $subtract: ["$endOdometer", "$startOdometer"] },
                  0,
                ],
              },
            },
            fuelConsumed: {
              $sum: {
                $cond: [
                  { $ne: ["$fuelConsumptionAppliedAt", null] },
                  { $ifNull: ["$fuelConsumedLitres", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),
      Vehicle.aggregate([
        { $match: vehicleMatch },
        {
          $group: {
            _id: null,
            fuelBalanceLitres: { $sum: { $ifNull: ["$fuelBalanceLitres", 0] } },
          },
        },
      ]),
    ]);

    return {
      ...(fuelSummary || {
        totalRecords: 0,
        totalCost: 0,
        totalQty: 0,
        pending: 0,
        approved: 0,
        declined: 0,
      }),
      fuelBalanceLitres: balanceSummary?.fuelBalanceLitres || 0,
      averageEfficiency: taskSummary?.fuelConsumed
        ? taskSummary.distance / taskSummary.fuelConsumed
        : 0,
    };
  }

  /**
   * إنشاء وتوثيق إيصال وقود جديد مع التحقق من الأهلية وسعة الخزان
   */
  async createFuelRecord({ user, vehicleId, cost, qty, isFullTank, location, image, odometer }) {
    if (!image) {
      throw { status: 400, message: "صورة فاتورة أو إيصال الوقود مطلوبة إجبارياً" };
    }

    const vehicleFilters = {
      _id: vehicleId,
      companyId: user.companyId,
      status: mainStatus.ACTIVE,
      isDeleted: false,
    };

    if (user.role === userRoles.FLEET_MANAGER) {
      vehicleFilters.teamId = user.teamId;
    } else if (user.role === userRoles.DRIVER) {
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
          message: "يمكنك توثيق الوقود فقط للمركبة المسندة إليك أو في مهمة نشطة",
        };
      }
      if (activeTask) {
        vehicleFilters.teamId = activeTask.teamId;
      }
    }

    const vehicle = await Vehicle.findOne(vehicleFilters);
    if (!vehicle) {
      throw { status: 404, message: "المركبة غير موجودة أو غير مصرح لك بتسجيل الوقود لها" };
    }

    if (Number(qty) > vehicle.tankCapacity) {
      throw {
        status: 400,
        message: `كمية الوقود (${qty} لتر) تتجاوز السعة القصوى لخزان المركبة (${vehicle.tankCapacity} لتر)`,
      };
    }

    // قراءة العداد المدخلة أو قراءة المركبة الحالية
    const inputOdo = Number(odometer);
    const effectiveOdometer =
      Number.isFinite(inputOdo) && inputOdo >= 0 ? inputOdo : (vehicle.currentOdometer || 0);

    const record = await Fuel.create({
      vehicleId: vehicle._id,
      cost,
      qty,
      odometer: effectiveOdometer,
      image,
      isFullTank,
      companyId: user.companyId,
      teamId: vehicle.teamId || null,
      userId: user._id,
      location,
    });

    // تحديث قراءة عداد المركبة إذا كانت القراءة المدخلة أكبر من القراءة السابقة
    if (effectiveOdometer > (vehicle.currentOdometer || 0)) {
      await Vehicle.updateOne(
        { _id: vehicle._id, companyId: user.companyId },
        { $max: { currentOdometer: effectiveOdometer } }
      );
    }

    return record;
  }

  /**
   * استعلام سجلات الوقود مع دعم الفلاتر والبحث والترقيم السيرفري
   */
  async listFuelRecords({ user, teamId, status, vehicleId, driverId, search, page, limit, all }) {
    const filters = { companyId: user.companyId };

    if (user.role === userRoles.DRIVER) {
      // عزل أمني صارم: السائق يرى حصراً فواتيره الخاصة التي قام برفعها
      filters.userId = user._id;
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

    if (vehicleId && vehicleId !== "all") {
      if (mongoose.Types.ObjectId.isValid(vehicleId)) {
        filters.vehicleId = vehicleId;
      }
    }

    if (driverId && driverId !== "all") {
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
        throw { status: 400, message: "معرف السائق غير صالح" };
      }
      filters.userId = driverId;
    }

    // البحث النصي المتعدد (الموديل، رقم اللوحة، اسم السائق، البريد)
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

      const searchConditions = [];
      if (vehicleIds.length > 0) {
        searchConditions.push({ vehicleId: { $in: vehicleIds } });
      }
      if (userIds.length > 0) {
        searchConditions.push({ userId: { $in: userIds } });
      }

      if (searchConditions.length > 0) {
        filters.$or = searchConditions;
      } else {
        return {
          records: [],
          pagination: {
            total: 0,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
    }

    const populates = [
      { path: "vehicleId", select: "model plateNumber expectedFuelEfficiency currentOdometer" },
      { path: "userId", select: "name email" },
      { path: "verifiedBy", select: "name email" },
    ];

    const shouldPaginate =
      (page !== undefined || limit !== undefined) && all !== true && all !== "true";

    if (shouldPaginate) {
      const result = await paginate(Fuel, filters, {
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

    const records = await Fuel.find(filters)
      .populate(populates[0])
      .populate(populates[1])
      .populate(populates[2])
      .sort({ createdAt: -1 })
      .lean();

    return { records };
  }

  /**
   * مراجعة واعتماد أو رفض إيصال الوقود مع تحديث رصيد المركبة ذرياً
   */
  async verifyFuelRecord({ user, recordId, status }) {
    if (!recordId) {
      throw { status: 400, message: "معرف الإيصال مطلوب" };
    }

    const filters = {
      _id: recordId,
      companyId: user.companyId,
    };

    if (user.role === userRoles.FLEET_MANAGER) {
      filters.teamId = user.teamId;
    }

    const fuelRecord = await Fuel.findOne({ ...filters, status: expenseRecordStatus.PENDING });
    if (!fuelRecord || !fuelRecord.vehicleId) {
      throw { status: 404, message: "إيصال الوقود قيد المراجعة غير موجود" };
    }

    const vehicle = await Vehicle.findOne({
      _id: fuelRecord.vehicleId,
      companyId: user.companyId,
    }).select("tankCapacity currentOdometer expectedFuelEfficiency");

    if (!vehicle) {
      throw { status: 404, message: "مركبة إيصال الوقود غير موجودة" };
    }

    if (status === expenseRecordStatus.APPROVED) {
      if (!fuelRecord.image) {
        throw { status: 400, message: "صورة فاتورة الوقود مطلوبة للاعتماد" };
      }
      if (!Number.isFinite(fuelRecord.cost) || fuelRecord.cost < 0) {
        throw { status: 400, message: "تكلفة الوقود يجب أن تكون رقماً موجباً" };
      }
      if (!Number.isFinite(fuelRecord.qty) || fuelRecord.qty <= 0) {
        throw { status: 400, message: "كمية الوقود يجب أن تكون أكبر من صفر" };
      }
      if (fuelRecord.qty > vehicle.tankCapacity) {
        throw { status: 400, message: "كمية الوقود تتجاوز سعة خزان المركبة" };
      }
      if (
        !Number.isFinite(fuelRecord.odometer) ||
        fuelRecord.odometer < 0 ||
        fuelRecord.odometer > vehicle.currentOdometer
      ) {
        throw { status: 409, message: "قراءة عداد الوقود غير صالحة لسجل المركبة الحالي" };
      }
    }

    let recordWasUpdated = false;

    await this.withTransaction(async (session) => {
      recordWasUpdated = false;

      const fullTankCycle =
        status === expenseRecordStatus.APPROVED && fuelRecord.isFullTank
          ? await this.calculateFullTankCycle({
              fuelRecord,
              vehicle,
              companyId: user.companyId,
              session,
            })
          : null;

      const updateQuery = Fuel.updateOne(
        { ...filters, status: expenseRecordStatus.PENDING },
        {
          $set: {
            status,
            verifiedBy: user._id,
            verifiedAt: new Date(),
            ...(fullTankCycle || {}),
          },
        },
        { runValidators: true }
      );

      if (session) {
        updateQuery.session(session);
      }

      const result = await updateQuery;
      if (!result.modifiedCount) return;

      recordWasUpdated = true;

      if (status === expenseRecordStatus.APPROVED) {
        const balanceQuery = Vehicle.updateOne(
          { _id: fuelRecord.vehicleId, companyId: user.companyId, isDeleted: false },
          { $inc: { fuelBalanceLitres: fuelRecord.qty } }
        );

        if (session) {
          balanceQuery.session(session);
        }

        const balanceUpdate = await balanceQuery;
        if (!balanceUpdate.matchedCount) {
          throw new Error("تعذر العثور على المركبة لإضافة رصيد الوقود المعتمد");
        }
      }
    });

    const updatedRecord = await Fuel.findById(recordId)
      .populate("vehicleId", "model plateNumber expectedFuelEfficiency currentOdometer")
      .populate("userId", "name email")
      .populate("verifiedBy", "name email");

    return updatedRecord;
  }

  /**
   * إلغاء وعكس اعتماد إيصال الوقود (Void Fuel Approval)
   * يعكس رصيد الوقود في المركبة بخصم الكمية التي أضيفت سابقاً داخل عملية ذرية
   */
  async voidFuelRecord({ user, recordId, reason }) {
    if (!recordId) {
      throw { status: 400, message: "معرف الإيصال مطلوب" };
    }

    const filters = {
      _id: recordId,
      companyId: user.companyId,
    };

    if (user.role === userRoles.FLEET_MANAGER) {
      filters.teamId = user.teamId;
    }

    const fuelRecord = await Fuel.findOne(filters);
    if (!fuelRecord) {
      throw { status: 404, message: "إيصال الوقود غير موجود" };
    }

    if (fuelRecord.status !== expenseRecordStatus.APPROVED) {
      throw {
        status: 400,
        message: "يمكن فقط إلغاء وعكس الإيصالات التي تم اعتمادها مسبقاً",
      };
    }

    let recordWasVoided = false;

    await this.withTransaction(async (session) => {
      recordWasVoided = false;

      const updateQuery = Fuel.updateOne(
        { ...filters, status: expenseRecordStatus.APPROVED },
        {
          $set: {
            status: expenseRecordStatus.DECLINED,
            voidedBy: user._id,
            voidedAt: new Date(),
            voidReason: reason || "تم إلغاء الاعتماد وعكس رصيد الوقود",
          },
        },
        { runValidators: true }
      );

      if (session) {
        updateQuery.session(session);
      }

      const result = await updateQuery;
      if (!result.modifiedCount) return;

      recordWasVoided = true;

      // عكس رصيد الوقود بخصم الكمية من المركبة
      const balanceQuery = Vehicle.updateOne(
        { _id: fuelRecord.vehicleId, companyId: user.companyId },
        { $inc: { fuelBalanceLitres: -fuelRecord.qty } }
      );

      if (session) {
        balanceQuery.session(session);
      }

      await balanceQuery;
    });

    if (!recordWasVoided) {
      throw { status: 409, message: "تعذر إلغاء الإيصال، قد تكون حالته تغيرت" };
    }

    const updatedRecord = await Fuel.findById(recordId)
      .populate("vehicleId", "model plateNumber expectedFuelEfficiency currentOdometer")
      .populate("userId", "name email")
      .populate("verifiedBy", "name email")
      .populate("voidedBy", "name email");

    return updatedRecord;
  }
}

const fuelService = new FuelService();

module.exports = {
  FuelService,
  fuelService,
  getFuelStats: fuelService.getFuelStats.bind(fuelService),
  calculateFullTankCycle: fuelService.calculateFullTankCycle.bind(fuelService),
};
