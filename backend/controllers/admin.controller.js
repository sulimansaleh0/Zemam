const { expenseRecordStatus } = require("../data/status")
const Fuel = require("../models/fuel.model")
const Maintenance = require("../models/maintenance.model")
const { success, error, serverError } = require("../utils/responses")

exports.listFuelRecords = async (req, res) => {
    const company = req.company
    const { status } = req.query || null
    try {
        let filters = { companyId: company._id }
        if (status)
            filters.status = status

        const records = await Fuel.find(filters)
        success(res, 200, { records })
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

exports.verifyFuelRecord = async (req, res) => {
    const company = req.company
    const { recordId, status } = req.body
    try {
        const fuelRecord = await Fuel.findOneAndUpdate({
            _id: recordId,
            companyId: company._id
        }, {
            status,
        })

        if (!fuelRecord) return error(res, 400, "Fuel Record Not Found")

        success(res, 200)
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