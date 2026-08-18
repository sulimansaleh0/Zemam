const Fuel = require("../models/fuel.model")
const { success, error, serverError } = require("../utils/responses")

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

