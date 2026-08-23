const { success, serverError } = require("../utils/responses")
const getStatics = require("../utils/getStatics")

exports.companyStatics = async (req, res) => {
    const { companyId } = req.user
    try {
        const statics = await getStatics({ companyId })
        success(res, 200, statics)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

