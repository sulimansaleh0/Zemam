const Alert = require("../models/alert.model")
const { userRoles } = require("../data/roles")
const { success, error, serverError } = require("../utils/responses")

exports.listAlerts = async (req, res) => {
    try {
        const filters = { companyId: req.user.companyId }
        if (req.user.role === userRoles.FLEET_MANAGER) filters.teamId = req.user.teamId
        else if (req.teamId) filters.teamId = req.teamId
        if (req.query.unread === "true") filters.isRead = false
        const alerts = await Alert.find(filters).sort({ createdAt: -1 }).limit(100)
        success(res, 200, { alerts })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.markAlertRead = async (req, res) => {
    try {
        const filters = { _id: req.params.id, companyId: req.user.companyId }
        if (req.user.role === userRoles.FLEET_MANAGER) filters.teamId = req.user.teamId
        const alert = await Alert.findOneAndUpdate(filters, { isRead: true }, { new: true })
        if (!alert) return error(res, 404, "Alert not found")
        success(res, 200, { alert })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}
