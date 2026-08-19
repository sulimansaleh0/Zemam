const Maintenance = require("../models/maintenance.model")
const { success, error, serverError } = require("../utils/responses")

exports.createMaintenanceRecord = async (req, res) => {
    const { description, cost, images } = req.body
    const user = req.user || null
    const company = req.company || null
    try {
        await Maintenance.create({
            description,
            cost,
            images,
            companyId: company._id,
            reportedBy: user._id
        })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listMaintenanceRecords = async (req, res) => {
    const company = req.company
    const { status } = req.query || null
    try {
        let filters = { companyId: company._id }
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
    const company = req.company
    const { recordId, status } = req.body
    try {
        const maintenanceRecord = await Maintenance.findOneAndUpdate({
            _id: recordId,
            companyId: company._id
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