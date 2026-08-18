const Maintenance = require("../models/maintenance.model")
const { serverError, success } = require("../utils/responses")

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