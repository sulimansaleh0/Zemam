const User = require("../models/user.model")
const Team = require("../models/team.model")
const Vehicle = require("../models/vehicle.model")
const { userRoles } = require("../data/roles")
const bcrypt = require("bcrypt")
const { success, error, serverError } = require("../utils/responses")

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
    const { name, email, password } = req.body;
    try {
        let newPassword
        if (password) {
            newPassword = await bcrypt.hash(password, 9)
        }
        await User.findByIdAndUpdate(user._id, {
            name,
            email,
            password: newPassword
        })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.changeUserStatus = async (req, res) => {
    const { _id, companyId, role } = req.user
    const teamId = req.teamId
    const userId = req.params.id || null
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
    const teamId = req.teamId
    const { email } = req.body
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email is already in use")

        // const password = crypto.randomBytes(6).toString("base64url").slice(0, 8)
        const password = "123456789"
        const passwordHash = await bcrypt.hash(password, 9)
        const fleetManager = await User.create({
            email,
            password: passwordHash,
            companyId: user.companyId,
            teamId,
            role: userRoles.FLEET_MANAGER
        })

        if (teamId)
            await Team.findByIdAndUpdate(teamId, { managerId: user._id })

        success(res, 201, { fleetManager })
        // sendRegisterEmail({ email, password })
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

        const fleetManagers = await User.find(filters)
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
            isDeleted: true
        })
        if (!manager) return error(res, 404, "Manager not found")
        // if had a team
        if (manager.teamId)
            await Team.findByIdAndUpdate(manager.teamId, {
                managerId: null
            })
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
    const { teamId } = req.body
    try {
        const team = await Team.findOne({ _id: teamId, companyId: user.companyId, isDeleted: false })
        if (!team) return error(res, 404, "Team not found")
        if (team.managerId) return error(res, 400, "Team already has a manager")

        const manager = await User.findOne({ _id: managerId, companyId: user.companyId, isDeleted: false })
        if (!manager) return error(res, 404, "Manager not found")
        if (manager.teamId) return error(res, 400, "Manager already in a team")

        await Promise.all([
            User.findByIdAndUpdate(managerId, { teamId: team._id }),
            Team.findByIdAndUpdate(team._id, { managerId })
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
    if (!managerId) return error(res, 400, "Manager Is is required")
    try {
        const manager = await User.findOne({ _id: managerId, companyId: user.companyId })
        if (!manager) return error(res, 404, "Manager not found")
        if (!manager.teamId) return error(res, 400, "Manager has no team")

        await Team.findByIdAndUpdate(manager.teamId, { managerId: null })

        manager.teamId = null
        await manager.save()
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

// Driver
exports.createDriver = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { email, vehicleId } = req.body
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email already in use")

        if (teamId && vehicleId) {
            const vehicle = await Vehicle.findOne({ _id: vehicleId, teamId, companyId: user.companyId })
            if (!vehicle) return error(res, 404, "Vehicle not found")
        }

        const password = "123456789"
        const passwordHash = await bcrypt.hash(password, 9)

        const driver = await User.create({
            email,
            password: passwordHash,
            role: userRoles.DRIVER,
            companyId: user.companyId,
            teamId
        })

        if (teamId && vehicleId) {
            await Vehicle.findOneAndUpdate(
                { _id: vehicleId, teamId, companyId: user.companyId },
                { driverId: driver._id }
            )
        }

        success(res, 201, { driver })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listDrivers = async (req, res) => {
    const user = req.user;
    const teamId = req.teamId
    const { withoutTeam } = req.query
    try {
        let filters = {
            role: { $in: [userRoles.DRIVER] },
            companyId: user.companyId,
            isDeleted: false
        }

        if (teamId)
            filters.teamId = teamId
        else if (withoutTeam === "true" && !user.teamId)
            filters.teamId = null

        const drivers = await User.find(filters)
        success(res, 200, { drivers })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.setDriverToTeam = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const driverId = req.params.id
    if (!driverId) return error(res, 400, "Driver Id is required")
    try {
        const [team, driver] = await Promise.all([
            Team.findOne({ _id: teamId, companyId: user.companyId, isDeleted: false }),
            User.findOne({ _id: driverId, companyId: user.companyId, isDeleted: false })
        ])
        if (!driver) return error(res, 404, "Driver not found")
        if (!team) return error(res, 404, "Team not found")

        if (driver.teamId) return error(res, 400, "Driver already in a team")

        driver.teamId = teamId
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

        const driver = await User.findOne(filters)

        if (!driver) return error(res, 404, "Driver not found")
        if (!driver.teamId) return error(res, 400, "Driver dont have a team")

        await Vehicle.findOneAndUpdate({ driverId, companyId: user.companyId }, { driverId: null })

        driver.teamId = null
        await driver.save()
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
    if (!driverId) return error(res, 400, "Driver Id is required")

    const { vehicleId } = req.body
    if (!vehicleId) return error(res, 400, "Vehicle Id is required")

    try {
        const driverFilters = { _id: driverId, companyId: user.companyId, isDeleted: false }
        const vehicleFilters = { _id: vehicleId, companyId: user.companyId, isDeleted: false }
        if (teamId) {
            driverFilters.teamId = teamId
            vehicleFilters.teamId = teamId
        }
        const [driver, vehicle] = await Promise.all([
            User.findOne(driverFilters),
            Vehicle.findOne(vehicleFilters)
        ])
        
        if (!driver) return error(res, 404, "Driver not found")
        if (!vehicle) return error(res, 404, "vehicle not found")

        if (!driver.teamId) return error(res, 400, "Driver should have a team")
        if (!vehicle.teamId) return error(res, 400, "Vehicle should have a team")

        if (driver.teamId.toString() !== vehicle.teamId.toString())
            return error(res, 400, "Driver and Vehicle must be in the same team")

        if (vehicle.driverId)
            return error(res, 400, "Vehicle already has a driver")

        if (driver.role !== userRoles.DRIVER)
            return error(res, 400, "User is not a driver")

        if (driver.status !== mainStatus.ACTIVE)
            return error(res, 400, "Driver is not active")

        const hasVehicle = await Vehicle.findOne({ driverId, companyId: user.companyId })
        if (hasVehicle) return error(res, 400, "Driver already has a car")

        vehicle.driverId = driverId
        await vehicle.save()
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.removeDriverFromVehicle = async (req, res) => {
    const { companyId } = req.user
    const driverId = req.params.id
    if (!driverId) return error(res, 400, "Driver Id is required")
    try {
        const driver = await User.findOne({ _id: driverId, companyId })
        if (!driver) return error(res, 404, "Driver not found")

        await Vehicle.findOneAndUpdate({ driverId }, { driverId: null })
        success(res)
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
        const driver = await User.findOneAndUpdate({
            _id: driverId,
            companyId: user.companyId,
            teamId
        }, {
            isDeleted: true,
            teamId: null
        })
        if (!driver) return error(res, 404, "Driver not found")

        await Vehicle.findOneAndUpdate({ driverId }, { driverId: null })

        success(res)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}