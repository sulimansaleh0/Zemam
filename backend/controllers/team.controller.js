const teamService = require("../services/team.service");
const { success, error, serverError } = require("../utils/responses");

exports.createTeam = async (req, res) => {
  try {
    const user = req.user;
    const { name, managerId, driversIds, vehiclesIds } = req.body;

    const team = await teamService.createTeam(
      { name, managerId, driversIds, vehiclesIds },
      user.companyId,
      user
    );

    return success(res, 201, { team });
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error creating team:", err);
    return serverError(res);
  }
};

exports.listTeams = async (req, res) => {
  try {
    const user = req.user;
    const {
      search,
      q,
      status,
      managerFilter,
      page,
      limit,
      sort,
      all = true,
    } = req.query;

    const result = await teamService.listTeams(
      {
        companyId: user.companyId,
        search: search || q,
        status,
        managerFilter,
        page,
        limit,
        sort,
        all,
      },
      user
    );

    return success(res, 200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error listing teams:", err);
    return serverError(res);
  }
};

exports.listTeam = async (req, res) => {
  try {
    const user = req.user;
    const teamId = req.teamId || req.params.id;

    if (!teamId) {
      return error(res, 400, "معرّف الفريق مطلوب");
    }

    const team = await teamService.getTeamById(teamId, user.companyId, user);
    return success(res, 200, { team });
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error fetching team detail:", err);
    return serverError(res);
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const user = req.user;
    const teamId = req.params.id;

    if (!teamId) {
      return error(res, 400, "معرّف الفريق مطلوب");
    }

    const updatedTeam = await teamService.updateTeam(
      teamId,
      req.body,
      user.companyId
    );

    return success(res, 200, { team: updatedTeam });
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error updating team:", err);
    return serverError(res);
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const user = req.user;
    const teamId = req.params.id;

    if (!teamId) {
      return error(res, 400, "معرّف الفريق مطلوب");
    }

    await teamService.deleteTeam(teamId, user.companyId);
    return success(res, 200, { message: "تم حذف الفريق بنجاح" });
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error deleting team:", err);
    return serverError(res);
  }
};

exports.teamStatics = async (req, res) => {
  try {
    const user = req.user;
    const teamId = req.teamId || req.query.teamId || req.params.id;

    const statics = await teamService.getTeamStats(teamId, user.companyId);
    return success(res, 200, { statics });
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error fetching team statics:", err);
    return serverError(res);
  }
};

exports.assignResources = async (req, res) => {
  try {
    const user = req.user;
    const teamId = req.teamId || req.params.id;

    if (!teamId) {
      return error(res, 400, "معرّف الفريق مطلوب");
    }

    const driversIds = Array.isArray(req.body.driversIds)
      ? req.body.driversIds
      : Array.isArray(req.body.driverIds)
      ? req.body.driverIds
      : [];

    const vehiclesIds = Array.isArray(req.body.vehiclesIds)
      ? req.body.vehiclesIds
      : Array.isArray(req.body.vehicleIds)
      ? req.body.vehicleIds
      : [];

    await teamService.assignResources(
      teamId,
      { driversIds, vehiclesIds },
      user.companyId
    );

    return success(res, 200, { message: "تم تعيين الموارد بنجاح" });
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.statusCode, err.message);
    }
    console.error("Error assigning team resources:", err);
    return serverError(res);
  }
};