const mongoose = require("mongoose");
const DailyInspection = require("../models/dailyInspection.model");
const Vehicle = require("../models/vehicle.model");
const Task = require("../models/task.model");
const { userRoles } = require("../data/roles");
const { mainStatus, taskStatus } = require("../data/status");
const { paginate } = require("../utils/paginate");

class DailyInspectionService {
  /**
   * تسجيل وتوثيق فحص يومي لما قبل الانطلاق للمركبة
   */
  async createInspection({ user, vehicleId, taskId, items, odometer, notes, location }) {
    const vehicleFilters = {
      _id: vehicleId,
      companyId: user.companyId,
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
          message: "يمكنك تسجيل فحص ما قبل الانطلاق فقط للمركبة المسندة إليك أو في مهمة جارية",
        };
      }
    }

    const vehicle = await Vehicle.findOne(vehicleFilters);
    if (!vehicle) {
      throw { status: 404, message: "المركبة غير موجودة أو غير مصرح لك بفحصها" };
    }

    let linkedTaskId = null;
    if (taskId) {
      const task = await Task.findOne({
        _id: taskId,
        companyId: user.companyId,
      });
      if (task) {
        linkedTaskId = task._id;
      }
    }

    // تحديد حالة الفحص الكلية: ناجح إذا اجتازت كافة البنود، فاشل إذا وُجد بند لم يجتز
    const allPassed = Array.isArray(items) && items.every((i) => Boolean(i.passed));
    const status = allPassed ? "PASSED" : "FAILED";

    const inputOdo = Number(odometer);
    const effectiveOdometer =
      Number.isFinite(inputOdo) && inputOdo >= 0 ? inputOdo : (vehicle.currentOdometer || 0);

    const inspection = await DailyInspection.create({
      vehicleId: vehicle._id,
      driverId: user.role === userRoles.DRIVER ? user._id : (vehicle.driverId || user._id),
      teamId: vehicle.teamId || null,
      companyId: user.companyId,
      taskId: linkedTaskId,
      odometer: effectiveOdometer,
      status,
      items,
      notes: notes || "",
      location: location || null,
    });

    // تحديث عداد المركبة إذا كانت القراءة المدخلة أكبر من الحالية
    if (effectiveOdometer > (vehicle.currentOdometer || 0)) {
      await Vehicle.updateOne(
        { _id: vehicle._id, companyId: user.companyId },
        { $max: { currentOdometer: effectiveOdometer } }
      );
    }

    const populated = await DailyInspection.findById(inspection._id)
      .populate("vehicleId", "model plateNumber currentOdometer")
      .populate("driverId", "name email")
      .populate("taskId", "description status");

    return populated || inspection;
  }

  /**
   * استعلام سجلات الفحص اليومي مع الترقيم والفلترة
   */
  async listInspections({ user, vehicleId, driverId, taskId, status, page, limit }) {
    const filters = { companyId: user.companyId };

    if (user.role === userRoles.DRIVER) {
      filters.driverId = user._id;
    } else if (user.role === userRoles.FLEET_MANAGER) {
      filters.teamId = user.teamId;
    }

    if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) {
      filters.vehicleId = vehicleId;
    }

    if (driverId && mongoose.Types.ObjectId.isValid(driverId)) {
      filters.driverId = driverId;
    }

    if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
      filters.taskId = taskId;
    }

    if (status && ["PASSED", "FAILED"].includes(status)) {
      filters.status = status;
    }

    const populates = [
      { path: "vehicleId", select: "model plateNumber currentOdometer" },
      { path: "driverId", select: "name email" },
      { path: "taskId", select: "description status" },
    ];

    const result = await paginate(DailyInspection, filters, {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      populate: populates,
      sort: { createdAt: -1 },
    });

    return {
      inspections: result.docs || [],
      pagination: result.pagination,
    };
  }

  /**
   * جلب آخر فحص تم لمركبة معينة
   */
  async getLatestInspectionForVehicle({ vehicleId, companyId }) {
    const inspection = await DailyInspection.findOne({
      vehicleId,
      companyId,
    })
      .sort({ createdAt: -1 })
      .populate("driverId", "name email")
      .populate("vehicleId", "model plateNumber");

    return inspection;
  }
}

const dailyInspectionService = new DailyInspectionService();

module.exports = {
  DailyInspectionService,
  dailyInspectionService,
};
