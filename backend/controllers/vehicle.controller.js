const vehicleService = require("../services/vehicle.service");
const { success } = require("../utils/responses");

/**
 * Vehicle Controller - Handles HTTP Layer and delegates to VehicleService
 */

exports.createVehicle = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.createVehicle({
            user: req.user,
            teamId: req.teamId || req.body.teamId,
            data: req.body,
        });
        return success(res, 201, { vehicle, msg: "تم تسجيل المركبة بنجاح" });
    } catch (err) {
        return next(err);
    }
};

exports.listVehicles = async (req, res, next) => {
    try {
        const result = await vehicleService.getVehicles({
            user: req.user,
            teamId: req.teamId,
            query: req.query,
        });
        return success(res, 200, result);
    } catch (err) {
        return next(err);
    }
};

exports.listVehicle = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.getVehicleById({
            user: req.user,
            teamId: req.teamId,
            id: req.params.id,
        });
        return success(res, 200, { vehicle });
    } catch (err) {
        return next(err);
    }
};

exports.updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.updateVehicle({
            user: req.user,
            teamId: req.teamId,
            id: req.params.id,
            body: req.body,
        });
        return success(res, 200, { vehicle, msg: "تم تحديث بيانات المركبة بنجاح" });
    } catch (err) {
        return next(err);
    }
};

exports.getVehicleStats = async (req, res, next) => {
    try {
        const stats = await vehicleService.getVehicleStats({
            user: req.user,
            teamId: req.teamId,
            id: req.params.id,
        });
        return success(res, 200, { stats });
    } catch (err) {
        return next(err);
    }
};

exports.getFleetOverviewStats = async (req, res, next) => {
    try {
        const stats = await vehicleService.getFleetOverviewStats({
            user: req.user,
            teamId: req.teamId,
        });
        return success(res, 200, { stats });
    } catch (err) {
        return next(err);
    }
};

exports.setVehicleToTeam = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.setVehicleToTeam({
            user: req.user,
            vehicleId: req.params.id,
            team: req.team,
        });
        return success(res, 200, { vehicle, msg: "تم تعيين المركبة للفريق بنجاح" });
    } catch (err) {
        return next(err);
    }
};

exports.removerVehicleFromTeam = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.removeVehicleFromTeam({
            user: req.user,
            vehicleId: req.params.id,
        });
        return success(res, 200, { vehicle, msg: "تم فك ارتباط المركبة من الفريق بنجاح" });
    } catch (err) {
        return next(err);
    }
};

exports.changeVehicleStatus = async (req, res, next) => {
    try {
        const vehicle = await vehicleService.changeVehicleStatus({
            user: req.user,
            teamId: req.teamId,
            id: req.params.id,
            status: req.body.status,
        });
        return success(res, 200, { vehicle, msg: "تم تحديث حالة المركبة بنجاح" });
    } catch (err) {
        return next(err);
    }
};

exports.deleteVehicle = async (req, res, next) => {
    try {
        await vehicleService.deleteVehicle({
            user: req.user,
            teamId: req.teamId,
            id: req.params.id,
        });
        return success(res, 200, { msg: "تم حذف المركبة بنجاح" });
    } catch (err) {
        return next(err);
    }
};