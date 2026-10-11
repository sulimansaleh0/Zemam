const driverService = require("../services/driver.service");
const { success, error, serverError } = require("../utils/responses");

class DriverController {
  async createDriver(req, res) {
    try {
      const user = req.user;
      const teamId = req.teamId;
      const payload = { ...req.body };
      if (teamId) payload.teamId = teamId;

      const driver = await driverService.createDriver(
        payload,
        user.companyId,
        user.role
      );

      return success(res, 201, { driver, msg: "تم إنشاء السائق بنجاح" });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error creating driver:", err);
      return serverError(res);
    }
  }

  async listDrivers(req, res) {
    try {
      const user = req.user;
      const teamId = req.teamId || req.query.teamId;
      const { withoutTeam, status, licenseType, search, page, limit, all } =
        req.query;

      const result = await driverService.listDrivers(
        {
          companyId: user.companyId,
          teamId,
          withoutTeam,
          status,
          licenseType,
          search,
          page,
          limit,
          all,
        },
        user
      );

      return success(res, 200, result);
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error listing drivers:", err);
      return serverError(res);
    }
  }

  async getDriverById(req, res) {
    try {
      const user = req.user;
      const driverId = req.params.id;

      const driver = await driverService.getDriverById(
        driverId,
        user.companyId,
        user
      );

      return success(res, 200, { driver });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error getting driver by id:", err);
      return serverError(res);
    }
  }

  async getDriverStats(req, res) {
    try {
      const user = req.user;
      const driverId = req.params.id;

      const stats = await driverService.getDriverStats(
        driverId,
        user.companyId
      );

      return success(res, 200, { stats });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error getting driver stats:", err);
      return serverError(res);
    }
  }

  async changeDriverStatus(req, res) {
    try {
      const user = req.user;
      const driverId = req.params.userId || req.params.id;
      const { status } = req.body;

      await driverService.changeDriverStatus(
        driverId,
        status,
        user.companyId,
        user
      );

      return success(res, 200, { msg: "تم تحديث حالة السائق بنجاح" });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error changing driver status:", err);
      return serverError(res);
    }
  }

  async assignDriverToVehicle(req, res) {
    try {
      const user = req.user;
      const driverId = req.params.id;
      const { vehicleId } = req.body;

      const result = await driverService.assignDriverToVehicle(
        driverId,
        vehicleId,
        user.companyId,
        user
      );

      return success(res, 200, {
        msg: "تم تعيين السائق للمركبة بنجاح",
        ...result,
      });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error assigning driver to vehicle:", err);
      return serverError(res);
    }
  }

  async unassignDriverFromVehicle(req, res) {
    try {
      const user = req.user;
      const driverId = req.params.id;

      await driverService.unassignDriverFromVehicle(driverId, user.companyId);

      return success(res, 200, { msg: "تم فك ارتباط السائق عن المركبة بنجاح" });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error unassigning driver from vehicle:", err);
      return serverError(res);
    }
  }

  async setDriverToTeam(req, res) {
    try {
      const user = req.user;
      const driverId = req.params.id;
      const team = req.team;
      const teamId = team ? team._id : req.body.teamId;

      await driverService.assignDriverToTeam(
        driverId,
        teamId,
        user.companyId
      );

      return success(res, 200, { msg: "تم تعيين السائق للفريق بنجاح" });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error assigning driver to team:", err);
      return serverError(res);
    }
  }

  async removeDriverFromTeam(req, res) {
    try {
      const user = req.user;
      const driverId = req.params.id;

      await driverService.removeDriverFromTeam(
        driverId,
        user.companyId,
        user
      );

      return success(res, 200, { msg: "تم فك ارتباط السائق عن الفريق بنجاح" });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error removing driver from team:", err);
      return serverError(res);
    }
  }

  async deleteDriver(req, res) {
    try {
      const user = req.user;
      const driverId = req.params.id;

      await driverService.deleteDriver(driverId, user.companyId, user);

      return success(res, 200, { msg: "تم حذف السائق بنجاح" });
    } catch (err) {
      if (err.statusCode) {
        return error(res, err.statusCode, err.message);
      }
      console.error("Error deleting driver:", err);
      return serverError(res);
    }
  }
}

module.exports = new DriverController();
