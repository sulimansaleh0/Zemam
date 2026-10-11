const { success, error, serverError } = require("../utils/responses");
const { dailyInspectionService } = require("../services/dailyInspection.service");

exports.createInspection = async (req, res) => {
  const user = req.user;
  const { vehicleId, taskId, items, odometer, notes, location } = req.body;

  try {
    const inspection = await dailyInspectionService.createInspection({
      user,
      vehicleId,
      taskId,
      items,
      odometer,
      notes,
      location,
    });

    success(res, 201, { inspection });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error creating daily inspection:", err);
    serverError(res);
  }
};

exports.listInspections = async (req, res) => {
  const user = req.user;
  const { vehicleId, driverId, taskId, status, page, limit } = req.query;

  try {
    const result = await dailyInspectionService.listInspections({
      user,
      vehicleId,
      driverId,
      taskId,
      status,
      page,
      limit,
    });

    success(res, 200, result);
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error listing daily inspections:", err);
    serverError(res);
  }
};

exports.getLatestInspectionForVehicle = async (req, res) => {
  const user = req.user;
  const { vehicleId } = req.params;

  try {
    const inspection = await dailyInspectionService.getLatestInspectionForVehicle({
      vehicleId,
      companyId: user.companyId,
    });

    success(res, 200, { inspection });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error getting latest vehicle inspection:", err);
    serverError(res);
  }
};
