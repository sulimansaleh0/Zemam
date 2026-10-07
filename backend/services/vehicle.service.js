const mongoose = require("mongoose");
const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");
const Maintenance = require("../models/maintenance.model");
const Task = require("../models/task.model");
const Fuel = require("../models/fuel.model");
const { userRoles } = require("../data/roles");
const { mainStatus, expenseRecordStatus, taskStatus, vehicleStatus } = require("../data/status");
const { getDriverVehicleEligibilityError } = require("../utils/driverEligibility");
const { vehicleTypes } = require("../data/vehicleTypes");
const { paginate } = require("../utils/paginate");

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

class VehicleService {
    /**
     * Create a new vehicle with driver validation & atomic assignment
     */
    async createVehicle({ user, teamId, data }) {
        const {
            model,
            year,
            plateNumber,
            vehicleType,
            driverId,
            expectedFuelEfficiency,
            tankCapacity,
            fuelType,
            licenseNumber,
            licenseExpiry,
            issuingAuthority,
            insuranceNumber,
            insuranceCompany,
            insuranceExpiry,
        } = data;

        const effectiveTeamId = teamId || data.teamId || null;
        const selectedVehicleType = vehicleType || vehicleTypes.NORMAL;

        // Verify plate uniqueness in company
        const existingVehicle = await Vehicle.findOne({
            plateNumber: plateNumber?.trim(),
            companyId: user.companyId,
            isDeleted: false,
        });

        if (existingVehicle) {
            const err = new Error("رقم اللوحة مسجل بالفعل لمركبة أخرى في الشركة");
            err.statusCode = 400;
            throw err;
        }

        let driver = null;
        if (driverId) {
            const driverQuery = {
                _id: driverId,
                companyId: user.companyId,
                role: userRoles.DRIVER,
                isDeleted: false,
            };
            if (effectiveTeamId) {
                driverQuery.teamId = effectiveTeamId;
            }

            driver = await User.findOne(driverQuery);

            if (!driver) {
                const err = new Error("السائق غير موجود أو لا ينتمي للفريق المحدد");
                err.statusCode = 404;
                throw err;
            }

            if (driver.status !== mainStatus.ACTIVE) {
                const err = new Error("السائق غير نشط حالياً");
                err.statusCode = 400;
                throw err;
            }

            const eligibilityError = getDriverVehicleEligibilityError(driver, { vehicleType: selectedVehicleType });
            if (eligibilityError) {
                const err = new Error(eligibilityError);
                err.statusCode = 400;
                throw err;
            }
        }

        // Resilient Session & ACID Transaction
        let session = null;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch {
            // Standalone MongoDB without replica set fallback
            session = null;
        }

        try {
            const sessionOpt = session ? { session } : {};

            if (driver) {
                // Unlink driver from any other vehicle in company atomically
                await Vehicle.updateMany(
                    { driverId: driver._id, companyId: user.companyId },
                    { driverId: null },
                    sessionOpt
                );
            }

            const vehiclePayload = {
                model: model?.trim(),
                year,
                plateNumber: plateNumber?.trim(),
                vehicleType: selectedVehicleType,
                expectedFuelEfficiency,
                tankCapacity,
                fuelType,
                licenseNumber: licenseNumber?.trim(),
                licenseExpiry,
                issuingAuthority,
                insuranceNumber: insuranceNumber?.trim(),
                insuranceCompany: insuranceCompany?.trim(),
                insuranceExpiry,
                teamId: effectiveTeamId,
                companyId: user.companyId,
                driverId: driver ? driver._id : null,
            };

            let createdVehicle;
            if (session) {
                const [created] = await Vehicle.create([vehiclePayload], { session });
                createdVehicle = created;
                await session.commitTransaction();
            } else {
                createdVehicle = await Vehicle.create(vehiclePayload);
            }

            return await Vehicle.findById(createdVehicle._id)
                .populate("driverId", "name email phone status")
                .populate("teamId", "name");
        } catch (err) {
            if (session) {
                await session.abortTransaction();
            }
            if (err.code === 11000) {
                const dupErr = new Error("رقم اللوحة مسجل بالفعل لمركبة أخرى في الشركة");
                dupErr.statusCode = 400;
                throw dupErr;
            }
            throw err;
        } finally {
            if (session) {
                session.endSession();
            }
        }
    }

    /**
     * List vehicles with optional team, pagination, search and filter support
     */
    async getVehicles({ user, teamId, query = {} }) {
        const { withoutTeam, status, vehicleType, search, page, limit } = query;

        const filters = {
            companyId: user.companyId,
            isDeleted: false,
        };

        if (teamId) {
            filters.teamId = teamId;
        } else if (withoutTeam === "true") {
            filters.teamId = null;
        }

        if (status && status !== "all") {
            filters.status = status;
        }

        if (vehicleType && vehicleType !== "all") {
            filters.vehicleType = vehicleType;
        }

        if (search && search.trim()) {
            const safeSearch = escapeRegex(search.trim());
            const regex = new RegExp(safeSearch, "i");
            filters.$or = [
                { model: regex },
                { plateNumber: regex },
                { licenseNumber: regex },
                { fuelType: regex },
            ];
        }

        // If pagination is explicitly requested
        if (page) {
            const paginated = await paginate(Vehicle, filters, {
                page,
                limit,
                populate: [
                    { path: "driverId", select: "name email phone status" },
                    { path: "teamId", select: "name" },
                ],
                sort: { createdAt: -1 },
            });
            return {
                vehicles: paginated.docs,
                pagination: paginated.pagination,
            };
        }

        // Default: return full array for backwards compatibility
        const vehicles = await Vehicle.find(filters)
            .populate("driverId", "name email phone status")
            .populate("teamId", "name")
            .sort({ createdAt: -1 })
            .lean();

        return { vehicles };
    }

    /**
     * Get single vehicle by ID
     */
    async getVehicleById({ user, teamId, id }) {
        if (!id || !mongoose.isValidObjectId(id)) {
            const err = new Error("معرف المركبة غير صالح");
            err.statusCode = 400;
            throw err;
        }

        const filters = {
            _id: id,
            companyId: user.companyId,
            isDeleted: false,
        };

        if (teamId) filters.teamId = teamId;

        const vehicle = await Vehicle.findOne(filters)
            .populate("driverId", "name email phone status")
            .populate("teamId", "name")
            .lean();

        if (!vehicle) {
            const err = new Error("المركبة غير موجودة");
            err.statusCode = 404;
            throw err;
        }

        return vehicle;
    }

    /**
     * Update vehicle specifications & license/insurance info
     */
    async updateVehicle({ user, teamId, id, body }) {
        if (!id || !mongoose.isValidObjectId(id)) {
            const err = new Error("معرف المركبة غير صالح");
            err.statusCode = 400;
            throw err;
        }

        const allowedFields = [
            "model",
            "year",
            "plateNumber",
            "vehicleType",
            "expectedFuelEfficiency",
            "tankCapacity",
            "fuelType",
            "licenseNumber",
            "licenseExpiry",
            "issuingAuthority",
            "insuranceNumber",
            "insuranceCompany",
            "insuranceExpiry",
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) updates[field] = body[field];
        }

        const filters = { _id: id, companyId: user.companyId, isDeleted: false };
        if (teamId) filters.teamId = teamId;

        if (updates.plateNumber) {
            const duplicate = await Vehicle.findOne({
                plateNumber: updates.plateNumber,
                companyId: user.companyId,
                isDeleted: false,
                _id: { $ne: id },
            });

            if (duplicate) {
                const err = new Error("رقم اللوحة مستخدم بالفعل لمركبة أخرى");
                err.statusCode = 400;
                throw err;
            }
        }

        try {
            const vehicle = await Vehicle.findOneAndUpdate(
                filters,
                { $set: updates },
                { returnDocument: "after", runValidators: true }
            )
                .populate("driverId", "name email phone status")
                .populate("teamId", "name");

            if (!vehicle) {
                const err = new Error("المركبة غير موجودة");
                err.statusCode = 404;
                throw err;
            }

            return vehicle;
        } catch (err) {
            if (err.code === 11000) {
                const dupErr = new Error("رقم اللوحة مستخدم بالفعل لمركبة أخرى");
                dupErr.statusCode = 400;
                throw dupErr;
            }
            throw err;
        }
    }

    /**
     * Aggregated statistics for single vehicle
     */
    async getVehicleStats({ user, teamId, id }) {
        if (!id || !mongoose.isValidObjectId(id)) {
            const err = new Error("معرف المركبة غير صالح");
            err.statusCode = 400;
            throw err;
        }

        const filters = { _id: id, companyId: user.companyId, isDeleted: false };
        if (teamId) filters.teamId = teamId;

        const vehicle = await Vehicle.findOne(filters).lean();
        if (!vehicle) {
            const err = new Error("المركبة غير موجودة");
            err.statusCode = 404;
            throw err;
        }

        const [fuel, maintenance, tasks] = await Promise.all([
            Fuel.aggregate([
                { $match: { vehicleId: vehicle._id, companyId: user.companyId, status: expenseRecordStatus.APPROVED } },
                {
                    $group: {
                        _id: null,
                        totalFuel: { $sum: "$qty" },
                        totalFuelCost: { $sum: "$cost" },
                    },
                },
            ]),
            Maintenance.aggregate([
                { $match: { vehicleId: vehicle._id, status: expenseRecordStatus.APPROVED } },
                { $group: { _id: null, totalMaintenanceCost: { $sum: "$cost" } } },
            ]),
            Task.aggregate([
                { $match: { vehicleId: vehicle._id, status: taskStatus.FINISHED } },
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
        ]);

        const fuelStats = fuel[0] || {};
        const taskStats = tasks[0] || {};
        const maintenanceStats = maintenance[0] || {};

        return {
            distance: taskStats.distance || 0,
            totalFuel: fuelStats.totalFuel || 0,
            totalFuelCost: fuelStats.totalFuelCost || 0,
            totalMaintenanceCost: maintenanceStats.totalMaintenanceCost || 0,
            fuelEfficiency: taskStats.fuelConsumed ? Number((taskStats.distance / taskStats.fuelConsumed).toFixed(2)) : 0,
            fuelBalanceLitres: vehicle.fuelBalanceLitres || 0,
        };
    }

    /**
     * Aggregated overview statistics for company/team fleet (active, inactive, inTask, maintenance)
     */
    async getFleetOverviewStats({ user, teamId }) {
        const match = {
            companyId: new mongoose.Types.ObjectId(user.companyId),
            isDeleted: false,
        };
        if (teamId) {
            match.teamId = new mongoose.Types.ObjectId(teamId);
        }

        const [stats] = await Vehicle.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: {
                        $sum: { $cond: [{ $eq: ["$status", vehicleStatus.ACTIVE] }, 1, 0] }
                    },
                    inactive: {
                        $sum: { $cond: [{ $eq: ["$status", vehicleStatus.INACTIVE] }, 1, 0] }
                    },
                    inTask: {
                        $sum: { $cond: [{ $eq: ["$isInTask", true] }, 1, 0] }
                    },
                    inMaintenance: {
                        $sum: { $cond: [{ $eq: ["$status", vehicleStatus.INMAINTENANCE] }, 1, 0] }
                    },
                }
            }
        ]);

        return stats || { total: 0, active: 0, inactive: 0, inTask: 0, inMaintenance: 0 };
    }

    /**
     * Assign vehicle to a team
     */
    async setVehicleToTeam({ user, vehicleId, team }) {
        if (!vehicleId || !mongoose.isValidObjectId(vehicleId)) {
            const err = new Error("معرف المركبة غير صالح");
            err.statusCode = 400;
            throw err;
        }

        const vehicle = await Vehicle.findOne({
            _id: vehicleId,
            companyId: user.companyId,
            isDeleted: false,
            status: mainStatus.ACTIVE,
        });

        if (!vehicle) {
            const err = new Error("المركبة غير موجودة أو غير نشطة");
            err.statusCode = 404;
            throw err;
        }

        // If vehicle changes team, unassign driver if from previous team
        if (vehicle.teamId && vehicle.teamId.toString() !== team._id.toString()) {
            vehicle.driverId = null;
        }

        vehicle.teamId = team._id;
        await vehicle.save();
        return vehicle;
    }

    /**
     * Remove vehicle from its current team
     */
    async removeVehicleFromTeam({ user, vehicleId }) {
        if (!vehicleId || !mongoose.isValidObjectId(vehicleId)) {
            const err = new Error("معرف المركبة غير صالح");
            err.statusCode = 400;
            throw err;
        }

        const vehicle = await Vehicle.findOne({
            _id: vehicleId,
            companyId: user.companyId,
            isDeleted: false,
        });

        if (!vehicle) {
            const err = new Error("المركبة غير موجودة");
            err.statusCode = 404;
            throw err;
        }

        if (!vehicle.teamId) {
            const err = new Error("المركبة غير معينة لأي فريق حالياً");
            err.statusCode = 400;
            throw err;
        }

        vehicle.teamId = null;
        vehicle.driverId = null;
        await vehicle.save();
        return vehicle;
    }

    /**
     * Change operational status (active, inactive, inmaintenance)
     */
    async changeVehicleStatus({ user, teamId, id, status }) {
        if (!id || !mongoose.isValidObjectId(id)) {
            const err = new Error("معرف المركبة غير صالح");
            err.statusCode = 400;
            throw err;
        }

        const filters = {
            _id: id,
            companyId: user.companyId,
            isDeleted: false,
        };
        if (teamId) filters.teamId = teamId;

        const currentVehicle = await Vehicle.findOne(filters).select("status");
        if (!currentVehicle) {
            const err = new Error("المركبة غير موجودة");
            err.statusCode = 404;
            throw err;
        }

        if (currentVehicle.status === vehicleStatus.INMAINTENANCE) {
            const err = new Error("لا يمكن تغيير حالة المركبة حتى يتم التحقق من طلب الصيانة القائم");
            err.statusCode = 409;
            throw err;
        }

        const vehicle = await Vehicle.findOneAndUpdate(
            { ...filters, status: { $ne: vehicleStatus.INMAINTENANCE } },
            { $set: { status } },
            { new: true, runValidators: true }
        )
            .populate("driverId", "name email phone status")
            .populate("teamId", "name");

        return vehicle;
    }

    /**
     * Soft delete vehicle with validation checks
     */
    async deleteVehicle({ user, teamId, id }) {
        if (!id || !mongoose.isValidObjectId(id)) {
            const err = new Error("معرف المركبة غير صالح");
            err.statusCode = 400;
            throw err;
        }

        const filters = {
            _id: id,
            companyId: user.companyId,
            isDeleted: false,
        };
        if (teamId) filters.teamId = teamId;

        const existingVehicle = await Vehicle.findOne(filters);
        if (!existingVehicle) {
            const err = new Error("المركبة غير موجودة");
            err.statusCode = 404;
            throw err;
        }

        if (existingVehicle.isInTask || existingVehicle.status === vehicleStatus.INMAINTENANCE) {
            const err = new Error("لا يمكن حذف المركبة أثناء وجودها في مهمة نشطة أو قيد الصيانة");
            err.statusCode = 400;
            throw err;
        }

        const activeMaintenance = await Maintenance.exists({
            vehicleId: existingVehicle._id,
            status: { $in: [expenseRecordStatus.PENDING, expenseRecordStatus.APPROVED] },
        });

        if (activeMaintenance) {
            const err = new Error("لا يمكن حذف المركبة مع وجود سجل صيانة نشط");
            err.statusCode = 400;
            throw err;
        }

        existingVehicle.isDeleted = true;
        existingVehicle.driverId = null;
        existingVehicle.teamId = null;
        await existingVehicle.save();

        return { success: true };
    }
}

module.exports = new VehicleService();
