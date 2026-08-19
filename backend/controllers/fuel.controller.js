const Fuel = require("../models/fuel.model")
const { success, error, serverError } = require("../utils/responses")
const { expenseRecordStatus } = require("../data/status")

exports.createFuelRecord = async (req, res) => {
    const { cost, qty, images } = req.body;
    const company = req.company || null
    const user = req.user || null
    try {
        if (!user || !company) return error(res, 401, "you cant create this fuel record")

        const recordImage = images.length > 0 ? images[0] : null

        const newRecord = await Fuel.create({
            cost,
            qty,
            image: recordImage,
            companyId: company._id,
            driverId: user._id
        })
        success(res, 201)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

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
