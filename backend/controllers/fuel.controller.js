const Fuel = require("../models/fuel.model")
const { success, error, serverError } = require("../utils/responses")

exports.createFuelRecord = async (req, res) => {
    const { cost, qty, images } = req.body;
    const user = req.user
    try {
        const recordImage = images.length > 0 ? images[0] : null
        const record = await Fuel.create({
            cost,
            qty,
            image: recordImage,
            companyId: user.companyId,
            teamId: user.teamId,
            driverId: user._id
        })
        success(res, 201, { record })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listFuelRecords = async (req, res) => {
    const user = req.user
    const { status } = req.query || null
    try {
        let filters = { teamId: user.teamId, companyId: user.companyId }
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
    const user = req.user
    const { status } = req.body
    const recordId = req.params.id || null
    if (!recordId) return error(res, 400, "Record Id is required")
    try {
        const fuelRecord = await Fuel.findOneAndUpdate({
            _id: recordId,
            companyId: user.companyId,
            teamId: user.teamId
        }, {
            status
        })

        if (!fuelRecord) return error(res, 400, "Fuel Record Not Found")

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}
