const Maintenance = require("../models/maintenance.model")
const { success, error, serverError } = require("../utils/responses")

exports.createMaintenanceRecord = async (req, res) => {
    const user = req.user
    const { description, cost, images } = req.body
    try {
        await Maintenance.create({
            description,
            cost,
            images,
            companyId: user.companyId,
            teamId: user.teamId,
            reportedBy: user._id
        })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listMaintenanceRecords = async (req, res) => {
    const user = req.user
    const { status } = req.query || null
    try {
        let filters = { teamId: user.teamId, companyId: user.companyId }
        if (status)
            filters.status = status

        const records = await Maintenance.find(filters)
        success(res, 200, { records })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.verifyMaintenanceRecord = async (req, res) => {
    const user = req.user
    const { status } = req.body
    const recordId = req.params.id || null
    if (!recordId) return error(res, 400, "Record Id is required")
    try {
        const maintenanceRecord = await Maintenance.findOneAndUpdate({
            _id: recordId,
            teamId: user.teamId,
            companyId: user.companyId
        }, {
            status,
        })

        if (!maintenanceRecord) return error(res, 400, "Maintenance Record Not Found")

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}