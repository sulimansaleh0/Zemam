const { userRoles } = require("../data/roles")
const { mainStatus } = require("../data/status")
const { error } = require("../utils/responses")

module.exports = (res, driver) => {
    if (!driver) return error(res, 400, "driver not found")
    if (!driver.roles.includes(userRoles.DRIVER)) return error(res, 400, "user should be a driver")
    if (!(driver.status === mainStatus.ACTIVE)) return error(res, 400, "Driver is not active")
}