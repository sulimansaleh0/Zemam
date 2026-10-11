const { success, error, serverError } = require("../utils/responses");
const { maintenanceService } = require("../services/maintenance.service");
const { userRoles } = require("../data/roles");

exports.createMaintenanceRecord = async (req, res) => {
  const user = req.user;
  const { vehicleId, description, cost, images, category, priority, odometer } = req.body;

  try {
    const record = await maintenanceService.createMaintenanceRecord({
      user,
      vehicleId,
      description,
      cost,
      images,
      category,
      priority,
      odometer,
    });

    success(res, 201, { record });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error creating maintenance record:", err);
    serverError(res);
  }
};

exports.listMaintenanceRecords = async (req, res) => {
  const user = req.user;
  const { status, category, vehicleId, search, page, limit, all } = req.query;
  const teamId = user.role === userRoles.FLEET_MANAGER ? user.teamId : (req.teamId || req.query.teamId);

  try {
    const result = await maintenanceService.listMaintenanceRecords({
      user,
      teamId,
      status,
      category,
      vehicleId,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      all,
    });

    success(res, 200, result);
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error listing maintenance records:", err);
    serverError(res);
  }
};

exports.verifyMaintenanceRecord = async (req, res) => {
  const user = req.user;
  const { status, declineReason, isDriverFault, cost, driverId } = req.body;
  const recordId = req.params.id;

  try {
    const record = await maintenanceService.verifyMaintenanceRecord({
      user,
      recordId,
      status,
      declineReason,
      isDriverFault,
      cost,
      driverId,
    });

    success(res, 200, { record });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error verifying maintenance record:", err);
    serverError(res);
  }
};

exports.getMaintenanceStats = async (req, res) => {
  const user = req.user;
  const teamId = user.role === userRoles.FLEET_MANAGER ? user.teamId : (req.teamId || req.query.teamId);

  try {
    const stats = await maintenanceService.getMaintenanceStats({
      user,
      teamId,
    });

    success(res, 200, { stats });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error getting maintenance stats:", err);
    serverError(res);
  }
};