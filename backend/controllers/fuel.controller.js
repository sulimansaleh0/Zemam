const mongoose = require("mongoose");
const { userRoles } = require("../data/roles");
const { success, error, serverError } = require("../utils/responses");
const { fuelService } = require("../services/fuel.service");

exports.createFuelRecord = async (req, res) => {
  const user = req.user;
  const { vehicleId, cost, qty, isFullTank, location, odometer } = req.body;
  const image = req.body.image || req.body.images?.[0];

  try {
    const record = await fuelService.createFuelRecord({
      user,
      vehicleId,
      cost,
      qty,
      isFullTank,
      location,
      image,
      odometer,
    });

    success(res, 201, { record });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error creating fuel record:", err);
    serverError(res);
  }
};

exports.listFuelRecords = async (req, res) => {
  const user = req.user;
  const { status, vehicleId, search, page, limit, all } = req.query;
  const teamId = user.role === userRoles.FLEET_MANAGER ? user.teamId : req.query.teamId;
  const driverId = req.query.driverId || req.query.userId;

  try {
    const result = await fuelService.listFuelRecords({
      user,
      teamId,
      status,
      vehicleId,
      driverId,
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
    console.error("Error listing fuel records:", err);
    serverError(res);
  }
};

exports.getFuelStats = async (req, res) => {
  const user = req.user;
  try {
    const teamId = user.role === userRoles.FLEET_MANAGER ? user.teamId : req.teamId;
    const vehicleId =
      typeof req.query.vehicleId === "string" && mongoose.isValidObjectId(req.query.vehicleId)
        ? new mongoose.Types.ObjectId(req.query.vehicleId)
        : null;

    const stats = await fuelService.getFuelStats({
      companyId: user.companyId,
      teamId,
      vehicleId,
    });

    success(res, 200, { stats });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error fetching fuel stats:", err);
    serverError(res);
  }
};

exports.verifyFuelRecord = async (req, res) => {
  const user = req.user;
  const { status } = req.body;
  const recordId = req.params.id;

  try {
    const record = await fuelService.verifyFuelRecord({
      user,
      recordId,
      status,
    });

    success(res, 200, { record });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error verifying fuel record:", err);
    serverError(res);
  }
};

exports.voidFuelRecord = async (req, res) => {
  const user = req.user;
  const recordId = req.params.id;
  const { reason } = req.body;

  try {
    const record = await fuelService.voidFuelRecord({
      user,
      recordId,
      reason,
    });

    success(res, 200, { record });
  } catch (err) {
    if (err && err.status) {
      return error(res, err.status, err.message);
    }
    console.error("Error voiding fuel record:", err);
    serverError(res);
  }
};
