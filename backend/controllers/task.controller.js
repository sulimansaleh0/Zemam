const taskService = require("../services/task.service");
const { success, error, serverError } = require("../utils/responses");

exports.createTask = async (req, res) => {
  try {
    const result = await taskService.createTask(
      req.body,
      req.user,
      req.teamId
    );
    return success(res, 201, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error creating task:", err);
    return serverError(res);
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const result = await taskService.getTaskStats(req.user, req.teamId);
    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error getting task stats:", err);
    return serverError(res);
  }
};

exports.listTasks = async (req, res) => {
  try {
    const { vehicleId, driverId, teamId, status, search, page, limit, all } = req.query;
    const result = await taskService.listTasks(
      {
        vehicleId,
        driverId,
        teamId: teamId || req.query.teamId,
        status,
        search,
        page,
        limit,
        all: all === "true" || all === true,
      },
      req.user,
      req.teamId
    );
    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error listing tasks:", err);
    return serverError(res);
  }
};

exports.listTask = async (req, res) => {
  try {
    const result = await taskService.getTaskById(
      req.params.id,
      req.user,
      req.teamId
    );
    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error getting task:", err);
    return serverError(res);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const result = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user,
      req.teamId
    );
    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error updating task:", err);
    return serverError(res);
  }
};

exports.acceptTask = async (req, res) => {
  try {
    const result = await taskService.acceptTask(req.params.id, req.user);
    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error accepting task:", err);
    return serverError(res);
  }
};

exports.finishTask = async (req, res) => {
  try {
    const result = await taskService.finishTask(req.params.id, req.user, req.body);
    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error finishing task:", err);
    return serverError(res);
  }
};

exports.declineTask = async (req, res) => {
  try {
    const result = await taskService.declineTask(
      req.params.id,
      req.body || {},
      req.user,
      req.teamId
    );
    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error declining task:", err);
    return serverError(res);
  }
};

exports.listDriverTasks = async (req, res) => {
  try {
    const { page, limit, all } = req.query;
    const result = await taskService.listDriverTasks(req.user, {
      page,
      limit,
      all: all === "true" || all === true,
    });
    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error listing driver tasks:", err);
    return serverError(res);
  }
};
