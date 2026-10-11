const mongoose = require("mongoose")
const User = require("../models/user.model")
const Team = require("../models/team.model")
const Vehicle = require("../models/vehicle.model")
const { userRoles } = require("../data/roles")
const { mainStatus } = require("../data/status")
const bcrypt = require("bcrypt")
const { success, error, serverError } = require("../utils/responses")
const { getDriverVehicleEligibilityError } = require("../utils/driverEligibility")
const Task = require("../models/task.model")
const Fuel = require("../models/fuel.model")
const Maintenance = require("../models/maintenance.model")
const { expenseRecordStatus, taskStatus } = require("../data/status")

// User
exports.me = async (req, res) => {
    const user = req.user
    if (!user) return error(res, 401, "UnAuthorized")
    try {
        const userData = await User.findById(user._id)
        if (!userData) return error(res, 400, "User Not Found")
        success(res, 200, { user: userData })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.updateProfile = async (req, res) => {
    const user = req.user
    if (!user) return error(res, 401, "UnAuthorized")
    const { name, email, password, licenseNumber, licenseTypes, licenseExpiry } = req.body;
    try {
        const updates = { name, email }
        if (password) updates.password = await bcrypt.hash(password, 9)
        if (licenseNumber !== undefined) updates.licenseNumber = licenseNumber
        if (licenseTypes !== undefined) updates.licenseTypes = licenseTypes
        if (licenseExpiry !== undefined) updates.licenseExpiry = licenseExpiry
        await User.findByIdAndUpdate(user._id, updates)
        const updatedUser = await User.findById(user._id)
        success(res, 200, { user: updatedUser })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.changeUserStatus = async (req, res) => {
    const { _id, companyId, role } = req.user
    const teamId = req.teamId
    const userId = req.params.userId || null
    if (!userId) return error(res, 400, "User Id is required")
    const { status } = req.body
    try {
        let allowedRoles = []
        if (role === userRoles.ADMIN) allowedRoles = [userRoles.FLEET_MANAGER, userRoles.DRIVER]
        if (role === userRoles.FLEET_MANAGER) allowedRoles = [userRoles.DRIVER]

        const filters = { _id: userId, companyId }
        if (teamId)
            filters.teamId = teamId

        const user = await User.findOne(filters)
        if (!user) return error(res, 404, "User not found")
        if (user.role === userRoles.ADMIN) return error(res, 400, "Cant change Admin status")
        if (user._id.toString() === _id.toString()) return error(res, 400, "Cant change your status")

        if (!allowedRoles.includes(user.role)) return error(res, 401, "You cant update this user")

        user.status = status
        await user.save()

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

// Fleet Manager
exports.createFleetManager = async (req, res) => {
    const user = req.user
    const team = req.team
    const { email, name, phone } = req.body
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email is already in use")

        if (team?.managerId) {
            return error(res, 400, "Team already has a manager. Remove the current manager first")
        }

        const password = "123456789"
        const passwordHash = await bcrypt.hash(password, 9)
        const fleetManager = await User.create({
            email,
            name: name.trim(),
            phone: phone || undefined,
            password: passwordHash,
            companyId: user.companyId,
            teamId: team ? team._id : null,
            role: userRoles.FLEET_MANAGER
        })

        if (team)
            await Team.findByIdAndUpdate(team._id, { managerId: fleetManager._id })
        // await sendRegisterEmail({ email, password })

        const populatedManager = await User.findById(fleetManager._id).populate("teamId", "name")
        success(res, 201, { fleetManager: populatedManager })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listFleetManagers = async (req, res) => {
    const user = req.user;
    const { status, withoutTeam } = req.query || null
    try {
        let filters = {
            role: { $in: [userRoles.FLEET_MANAGER] },
            companyId: user.companyId,
            isDeleted: false
        }

        if (status)
            filters.status = status

        if (withoutTeam === "true")
            filters.teamId = null

        const fleetManagers = await User.find(filters).populate("teamId", "name")
        success(res, 200, { fleetManagers })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.deleteFleetManager = async (req, res) => {
    const user = req.user
    const fleetManagerId = req.params.id || null
    if (!fleetManagerId) return error(res, 400, "fleet manager id is required")
    try {
        const manager = await User.findOneAndUpdate({ _id: fleetManagerId, companyId: user.companyId }, {
            isDeleted: true,
            teamId: null
        })
        if (!manager) return error(res, 404, "Manager not found")
        if (manager.teamId) {
            await Team.findByIdAndUpdate(manager.teamId, {
                managerId: null
            })
        }
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.assignManager = async (req, res) => {
    const user = req.user
    const managerId = req.params.id || null
    if (!managerId) return error(res, 400, "Manager Id is required")
    const team = req.team
    try {
        if (!team) return error(res, 404, "Team not found")
        if (team.managerId) return error(res, 400, "Team already has a manager")

        const manager = await User.findOne({
            _id: managerId,
            companyId: user.companyId,
            role: userRoles.FLEET_MANAGER,
            isDeleted: false,
            status: mainStatus.ACTIVE
        })
        if (!manager) return error(res, 404, "Manager not found")
        if (manager.teamId) return error(res, 400, "Manager already in a team")

        manager.teamId = team._id
        team.managerId = manager._id
        await Promise.all([
            manager.save(),
            team.save()
        ])
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.removeFleetManager = async (req, res) => {
    const user = req.user
    const managerId = req.params.id || null
    if (!managerId) return error(res, 400, "Manager Id is required")
    try {
        const manager = await User.findOneAndUpdate({ _id: managerId, companyId: user.companyId })
        if (!manager) return error(res, 404, "Manager not found")

        if (manager.teamId) {
            await Team.findByIdAndUpdate(manager.teamId, { managerId: null })
        }

        manager.teamId = null
        await manager.save()
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.getManagerStats = async (req, res) => {
    const user = req.user
    try {
        const manager = await User.findOne({
            _id: req.params.id,
            companyId: user.companyId,
            role: userRoles.FLEET_MANAGER,
            isDeleted: false
        })
        if (!manager) return error(res, 404, "Manager not found")
        if (user.role === userRoles.FLEET_MANAGER && manager._id.toString() !== user._id.toString()) {
            return error(res, 403, "You can only view your own statistics")
        }
        const teamId = manager.teamId
        if (!teamId) return success(res, 200, { stats: { totalTasks: 0, completedTasks: 0, delayedTasks: 0, fuelCost: 0, maintenanceCost: 0 } })
        const [taskStats, fuelStats, maintenanceStats] = await Promise.all([
            Task.aggregate([{ $match: { teamId } }, {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: { $sum: { $cond: [{ $eq: ["$status", taskStatus.FINISHED] }, 1, 0] } },
                }
            }]),
            Fuel.aggregate([{ $match: { teamId, status: expenseRecordStatus.APPROVED } }, { $group: { _id: null, fuelCost: { $sum: "$cost" } } }]),
            Maintenance.aggregate([{ $match: { teamId, status: expenseRecordStatus.APPROVED } }, { $group: { _id: null, maintenanceCost: { $sum: "$cost" } } }])
        ])
        success(res, 200, {
            stats: {
                ...(taskStats[0] || { totalTasks: 0, completedTasks: 0, delayedTasks: 0 }),
                fuelCost: fuelStats[0]?.fuelCost || 0,
                maintenanceCost: maintenanceStats[0]?.maintenanceCost || 0,
                driverScore: manager.driverScore
            }
        })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

// Driver
exports.createDriver = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { email, name, phone, vehicleId, licenseNumber, licenseTypes, licenseExpiry } = req.body
    const selectedLicenseTypes = licenseTypes || []
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email already in use")

        if (teamId && vehicleId) {
            const vehicle = await Vehicle.findOne({
                _id: vehicleId,
                teamId,
                companyId: user.companyId,
                status: mainStatus.ACTIVE,
                isDeleted: false
            })
            if (!vehicle) return error(res, 404, "Vehicle not found")

            const eligibilityError = getDriverVehicleEligibilityError({ licenseNumber, licenseTypes: selectedLicenseTypes, licenseExpiry }, vehicle)
            if (eligibilityError) return error(res, 400, eligibilityError)
        }
        // await sendRegisterEmail({ email, password })

        const password = "123456789"
        const passwordHash = await bcrypt.hash(password, 9)

        const driver = await User.create({
            email,
            name: name?.trim() || email.split('@')[0],
            phone,
            password: passwordHash,
            role: userRoles.DRIVER,
            companyId: user.companyId,
            teamId,
            licenseNumber,
            licenseTypes: selectedLicenseTypes,
            licenseExpiry
        })

        if (teamId && vehicleId) {
            await Vehicle.findOneAndUpdate(
                { _id: vehicleId, teamId, companyId: user.companyId },
                { driverId: driver._id }
            )
        }

        const populatedDriver = await User.findById(driver._id).populate("teamId", "name")
        success(res, 201, { driver: populatedDriver })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listDrivers = async (req, res) => {
    const user = req.user;
    const teamId = req.teamId;
    const { withoutTeam } = req.query;
    try {
        let filters = {
            role: { $in: [userRoles.DRIVER] },
            companyId: user.companyId,
            isDeleted: false
        };

        if (teamId)
            filters.teamId = teamId;
        else if (withoutTeam === "true")
            filters.teamId = null

        const drivers = await User.find(filters).populate("teamId", "name");
        success(res, 200, { drivers });
    } catch (err) {
        console.log(err);
        serverError(res);
    }
}

exports.setDriverToTeam = async (req, res) => {
    const user = req.user
    const team = req.team
    const driverId = req.params.id || null
    if (!driverId) return error(res, 400, "Driver Id is required")
    if (!team) return error(res, 400, "Team Id is required")
    try {
        const driver = await User.findOne({
            _id: driverId,
            companyId: user.companyId,
            role: userRoles.DRIVER,
            status: mainStatus.ACTIVE,
            isDeleted: false
        })
        if (!driver) return error(res, 404, "Driver not found")

        driver.teamId = team._id
        await driver.save()

        success(res)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.removeDriverFromTeam = async (req, res) => {
    const user = req.user
    const driverId = req.params.id
    const teamId = req.teamId
    if (!driverId) return error(res, 400, "Driver Id is required")
    try {
        const filters = { _id: driverId, companyId: user.companyId, isDeleted: false }
        if (teamId)
            filters.teamId = teamId

        const driver = await User.findOneAndUpdate(filters, { teamId: null })
        if (!driver) return error(res, 404, "Driver not found")

        await Vehicle.updateMany({ driverId, companyId: user.companyId }, { driverId: null })

        success(res)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.assignDriverToVehicle = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const driverId = req.params.id
    if (!driverId || !mongoose.isValidObjectId(driverId)) {
        return error(res, 400, "معرف السائق غير صالح أو مطلوب")
    }

    const { vehicleId } = req.body
    if (!vehicleId || !mongoose.isValidObjectId(vehicleId)) {
        return error(res, 400, "معرف المركبة غير صالح أو مطلوب")
    }

    try {
        const driverFilters = { _id: driverId, companyId: user.companyId, isDeleted: false, status: mainStatus.ACTIVE }
        const vehicleFilters = { _id: vehicleId, companyId: user.companyId, isDeleted: false, status: mainStatus.ACTIVE }
        if (teamId) {
            driverFilters.teamId = teamId
            vehicleFilters.teamId = teamId
        }

        const [driver, vehicle] = await Promise.all([
            User.findOne(driverFilters),
            Vehicle.findOne(vehicleFilters)
        ])

        if (!driver) return error(res, 404, "السائق غير موجود أو غير نشط في شركتك")
        if (!vehicle) return error(res, 404, "المركبة غير موجودة أو غير نشطة في شركتك")

        if (driver.role !== userRoles.DRIVER) {
            return error(res, 400, "المستخدم المحدد ليس سائقاً")
        }

        // قواعد مطابقة الفريق التشغيلي بمرونة وذكاء
        if (vehicle.teamId && driver.teamId) {
            if (driver.teamId.toString() !== vehicle.teamId.toString()) {
                return error(res, 400, "يجب أن ينتمي السائق والمركبة لنفس الفريق التشغيلي")
            }
        } else if (vehicle.teamId && !driver.teamId) {
            // إذا كانت المركبة ضمن فريق والسائق متاح في المخزون العام، يتم ضمه تلقائياً لفريق المركبة
            driver.teamId = vehicle.teamId
        } else if (!vehicle.teamId && driver.teamId) {
            return error(res, 400, "المركبة غير مسندة لفريق، بينما السائق منتمٍ لفريق تشغيلي. يرجى إسناد المركبة للفريق أولاً.")
        }

        // التحقق من أهلية رخصة السائق لنوع المركبة
        const eligibilityError = getDriverVehicleEligibilityError(driver, vehicle)
        if (eligibilityError) return error(res, 400, eligibilityError)

        // معاملات ذرية ACID
        let session = null
        try {
            session = await mongoose.startSession()
            session.startTransaction()
        } catch {
            session = null
        }

        try {
            const sessionOpt = session ? { session } : {}

            // فك ارتباط السائق من أي مركبة أخرى في الشركة لضمان العزل
            await Vehicle.updateMany(
                { driverId, companyId: user.companyId, _id: { $ne: vehicle._id } },
                { driverId: null },
                sessionOpt
            )

            vehicle.driverId = driverId
            await vehicle.save(sessionOpt)
            await driver.save(sessionOpt)

            if (session) await session.commitTransaction()
            success(res, 200, { msg: "تم تعيين السائق للمركبة بنجاح", vehicle })
        } catch (trxErr) {
            if (session) await session.abortTransaction()
            throw trxErr
        } finally {
            if (session) session.endSession()
        }
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.removeDriverFromVehicle = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const identifier = req.params.id
    if (!identifier || !mongoose.isValidObjectId(identifier)) {
        return error(res, 400, "المعرف غير صالح أو مطلوب")
    }

    try {
        // دعم البحث سواء مرر العميل معرف السائق أو معرف المركبة لضمان عدم الفشل
        const vehicleQuery = {
            $or: [{ driverId: identifier }, { _id: identifier }],
            companyId: user.companyId,
            isDeleted: false,
        }
        if (teamId) vehicleQuery.teamId = teamId

        const vehicle = await Vehicle.findOne(vehicleQuery)
        if (!vehicle) {
            return error(res, 404, "لم يتم العثور على مركبة مرتبطة بهذا السائق")
        }

        vehicle.driverId = null
        await vehicle.save()

        success(res, 200, { msg: "تم فك ارتباط السائق عن المركبة بنجاح" })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.deleteDriver = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const driverId = req.params.id || null
    if (!driverId) return error(res, 400, "Driver Id is required")
    try {
        let filters = {
            _id: driverId,
            companyId: user.companyId,
            isDeleted: false
        };

        if (teamId) filters.teamId = teamId;

        const driver = await User.findOne(filters);
        if (!driver) return error(res, 404, "Driver not found");

        driver.isDeleted = true;
        driver.teamId = null;
        await driver.save();
        await Vehicle.updateMany({ driverId, companyId: user.companyId }, { driverId: null });

        success(res, 200, { message: "تم حذف السائق بنجاح" });
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}