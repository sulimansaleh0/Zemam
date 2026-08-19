const { userRoles } = require("../data/roles")
const { mainStatus } = require("../data/status")
const { error } = require("../utils/responses")

module.exports = (res, vehicle) => {
    if (!vehicle) return error(res, 400, "Vehicle not found")
    if (!(vehicle.status === mainStatus.ACTIVE)) return error(res, 400, "Vehicle is not active")
}