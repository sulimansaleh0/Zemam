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
    const allowedVehicleTypes = {
        [vehicleTypes.TRUCK]: Object.values(vehicleTypes),
        [vehicleTypes.VAN]: [vehicleTypes.VAN, vehicleTypes.NORMAL],
        [vehicleTypes.NORMAL]: [vehicleTypes.NORMAL]
    }
    const canDrive = licenseTypes.some((licenseType) =>
        (allowedVehicleTypes[licenseType] || []).includes(vehicleType)
    )
    if (!canDrive) {
        return `Driver license does not allow driving ${vehicleTypeLabels[vehicleType] || "this vehicle type"}`
    }

    return null
}
