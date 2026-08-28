const User = require("../models/user.model")
const Team = require("../models/team.model")
const { userRoles } = require("../data/roles")
const bcrypt = require("bcrypt")
const { success, error, serverError } = require("../utils/responses")
const Vehicle = require("../models/vehicle.model")

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

exports.createFleetManager = async (req, res) => {
    const user = req.user
    const teamId = req.teamId || null
    const { email } = req.body
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email is already in use")

        // const password = crypto.randomBytes(6).toString("base64url").slice(0, 8)
        const password = "123456789"
        const passwordHash = await bcrypt.hash(password, 9)
        await User.create({
            email,
            password: passwordHash,
            companyId: user.companyId,
            teamId,
            role: userRoles.FLEET_MANAGER
        })

        if (teamId)
            await Team.findByIdAndUpdate(teamId, { managerId: user._id })

        success(res, 201)
        // sendRegisterEmail({ email, password })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listFleetManagers = async (req, res) => {
    const user = req.user;
    const { status } = req.query || null
    try {
        let filters = {
            role: { $in: [userRoles.FLEET_MANAGER] },
            companyId: user.companyId,
            isDeleted: false
        }
        if (status)
            filters.status = status

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

exports.disableFleetManager = async (req, res) => {
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

exports.createDriver = async (req, res) => {
    const user = req.user
    const teamId = req.teamId || null
    const { email, vehicleId } = req.body
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email already in use")

        const password = "123456789"
        const passwordHash = await bcrypt.hash(password, 9)
        await User.create({
            email,
            password: passwordHash,
            roles: userRoles.DRIVER,
            companyId: user.companyId,
            teamId
        })

        if (teamId && vehicleId) {
            const vehicle = await Vehicle.findOneAndUpdate(
                { _id: vehicleId, teamId, companyId: user.companyId },
                { driverId: user._id }
            )
            if (!vehicle) return error(res, 404, "Vehicle not found")
        }

        success(res, 201)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listDrivers = async (req, res) => {
    const user = req.user;
    const { teamId } = req.query || null
    try {
        let filters = {
            roles: { $in: [userRoles.DRIVER] },
            companyId: user.companyId
        }

        if (user.teamId)
            filters.teamId = user.teamId
        else if (teamId) {
            filters.teamId = teamId
        }

        const drivers = await User.find(filters)
        success(res, 200, { drivers })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.changeDriverStatus = async (req, res) => {
    const user = req.user
    const driverId = req.params.id || null
    if (!driverId) return error(res, 400, "Driver Id is required")
    const { status } = req.body
    if (!status) return error(res, 400, "status is required")
    try {
        const driver = await User.findOneAndUpdate({
            _id: driverId,
            teamId: user.teamId,
            companyId: user.companyId
        }, {
            status
        })
        if (!driver) return error(res, 404, "Driver not found")
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.deleteDriver = async (req, res) => {
    const user = req.user
    const driverId = req.params.id || null
    if (!driverId) return error(res, 400, "Driver Id is required")
    try {
        const driver = await User.findOneAndUpdate({
            _id: driverId,
            companyId: user.companyId,
            teamId: user.teamId
        }, {
            isDeleted: true
        })
        if (!driver) return error(res, 404, "Driver not found")
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}