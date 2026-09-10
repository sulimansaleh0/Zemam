const { vehicleTypes } = require("../data/vehicleTypes")

const vehicleTypeLabels = {
    [vehicleTypes.NORMAL]: "normal vehicles",
    [vehicleTypes.VAN]: "vans",
    [vehicleTypes.TRUCK]: "trucks"
}

exports.getDriverVehicleEligibilityError = (driver, vehicle) => {
    const licenseTypes = Array.isArray(driver.licenseTypes)
        ? driver.licenseTypes
        : []

    if (!driver.licenseNumber || licenseTypes.length === 0 || !driver.licenseExpiry) {
        return "Driver license information is required"
    }

    if (new Date(driver.licenseExpiry) <= new Date()) {
        return "Driver license has expired"
    }

    const vehicleType = vehicle.vehicleType || vehicleTypes.NORMAL
    if (!licenseTypes.includes(vehicleType)) {
        return `Driver license does not allow driving ${vehicleTypeLabels[vehicleType] || "this vehicle type"}`
    }

    return null
}
