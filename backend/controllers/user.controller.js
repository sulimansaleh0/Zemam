const User = require("../models/user.model")
const Team = require("../models/team.model")
const { sendRegisterEmail } = require("../services/email")
const { userRoles } = require("../data/roles")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const { success, error, serverError } = require("../utils/responses")
const { mainStatus } = require("../data/status")

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
        let newPassword = password
        if (newPassword) {
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
    const { email, teamId } = req.body
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email is already in use")

        const team = await Team.findOne({ _id: teamId, companyId: user.companyId })
        if (!team) return error(res, 404, "team not found")

        // const password = crypto.randomBytes(6).toString("base64url").slice(0, 8)
        const password = "123456789"
        const passwordHash = await bcrypt.hash(password, 9)
        await User.create({
            email,
            password: passwordHash,
            companyId: user.companyId,
            teamId,
            roles: [userRoles.FLEET_MANAGER]
        })
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
            roles: { $in: [userRoles.FLEET_MANAGER] },
            companyId: user.companyId
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
            statu: mainStatus.INACTIVE
        })
        if (!manager) return error(res, 404, "Manager not found")
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.createDriver = async (req, res) => {
    const user = req.user
    const { email } = req.body
    try {
        const [team, isFound] = await Promise.all([
            Team.findOne({ _id: user.teamId, companyId: user.companyId }),
            User.findOne({ email })
        ])
        console.log(team)
        if (isFound) return error(res, 400, "Email already in use")
        if (!team) return error(res, 404, "Team not found")

        const password = "123456789"
        const passwordHash = await bcrypt.hash(password, 9)
        await User.create({
            email,
            password: passwordHash,
            roles: [userRoles.DRIVER],
            companyId: user.companyId,
            teamId: user.teamId
        })
        success(res, 201)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listDrivers = async (req, res) => {
    const user = req.user;
    const { status } = req.query
    try {
        let filters = {
            roles: { $in: [userRoles.DRIVER] },
            teamId: user.teamId,
            companyId: user.companyId
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
    const driverId = req.query.id || null
    if (!driverId) return error(res, 400, "Driver Id is required")
    const { status } = req.body
    if (!status) return error(res, 400, "status is required")
    try {
        const driver = await User.findOneAndUpdate({
            _id: driverId,
            teamId: usesr.teamId,
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