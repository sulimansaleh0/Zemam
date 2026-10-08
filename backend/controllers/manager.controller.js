const managerService = require('../services/manager.service');
const { success, error, serverError } = require('../utils/responses');

/**
 * Controller رقيق لإدارة مدراء الأساطيل
 */
class ManagerController {
  async createFleetManager(req, res) {
    try {
      const fleetManager = await managerService.createFleetManager({
        adminUser: req.user,
        team: req.team,
        data: req.body,
      });
      return success(res, 201, { fleetManager }, 'تم إنشاء حساب مدير الأسطول بنجاح');
    } catch (err) {
      if (err.status) {
        return error(res, err.status, err.message);
      }
      console.error('Error in createFleetManager:', err);
      return serverError(res);
    }
  }

  async listFleetManagers(req, res) {
    try {
      const result = await managerService.listFleetManagers({
        adminUser: req.user,
        query: req.query,
      });
      return success(res, 200, result);
    } catch (err) {
      if (err.status) {
        return error(res, err.status, err.message);
      }
      console.error('Error in listFleetManagers:', err);
      return serverError(res);
    }
  }

  async getFleetManagerById(req, res) {
    try {
      const manager = await managerService.getFleetManagerById({
        user: req.user,
        managerId: req.params.id,
      });
      return success(res, 200, { manager });
    } catch (err) {
      if (err.status) {
        return error(res, err.status, err.message);
      }
      console.error('Error in getFleetManagerById:', err);
      return serverError(res);
    }
  }

  async getManagerStats(req, res) {
    try {
      const stats = await managerService.getManagerStats({
        user: req.user,
        managerId: req.params.id,
      });
      return success(res, 200, { stats });
    } catch (err) {
      if (err.status) {
        return error(res, err.status, err.message);
      }
      console.error('Error in getManagerStats:', err);
      return serverError(res);
    }
  }

  async assignManager(req, res) {
    try {
      await managerService.assignManagerToTeam({
        adminUser: req.user,
        managerId: req.params.id,
        team: req.team,
        teamId: req.body?.teamId,
      });
      return success(res, 200, null, 'تم تعيين مدير الأسطول للفريق بنجاح');
    } catch (err) {
      if (err.status) {
        return error(res, err.status, err.message);
      }
      console.error('Error in assignManager:', err);
      return serverError(res);
    }
  }

  async removeFleetManager(req, res) {
    try {
      await managerService.removeManagerFromTeam({
        adminUser: req.user,
        managerId: req.params.id,
      });
      return success(res, 200, null, 'تم فك ارتباط مدير الأسطول عن الفريق بنجاح');
    } catch (err) {
      if (err.status) {
        return error(res, err.status, err.message);
      }
      console.error('Error in removeFleetManager:', err);
      return serverError(res);
    }
  }

  async changeManagerStatus(req, res) {
    try {
      const { status } = req.body;
      const manager = await managerService.changeManagerStatus({
        adminUser: req.user,
        managerId: req.params.id,
        status,
      });
      return success(res, 200, { manager }, 'تم تحديث حالة حساب مدير الأسطول بنجاح');
    } catch (err) {
      if (err.status) {
        return error(res, err.status, err.message);
      }
      console.error('Error in changeManagerStatus:', err);
      return serverError(res);
    }
  }

  async deleteFleetManager(req, res) {
    try {
      await managerService.deleteFleetManager({
        adminUser: req.user,
        managerId: req.params.id,
      });
      return success(res, 200, null, 'تم حذف حساب مدير الأسطول بنجاح');
    } catch (err) {
      if (err.status) {
        return error(res, err.status, err.message);
      }
      console.error('Error in deleteFleetManager:', err);
      return serverError(res);
    }
  }
}

module.exports = new ManagerController();
