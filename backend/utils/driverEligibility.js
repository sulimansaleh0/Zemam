const { vehicleTypes } = require("../data/vehicleTypes")

const vehicleTypeArabicLabels = {
    [vehicleTypes.NORMAL]: "سيارات الركوب الخفيفة",
    [vehicleTypes.VAN]: "حافلات الفان والنقل المتوسط",
    [vehicleTypes.TRUCK]: "شاحنات النقل الثقيل",
};

exports.getDriverVehicleEligibilityError = (driver, vehicle) => {
    const licenseTypes = Array.isArray(driver.licenseTypes)
        ? driver.licenseTypes
        : [];

    if (!driver.licenseNumber || licenseTypes.length === 0 || !driver.licenseExpiry) {
        return "بيانات رخصة قيادة السائق غير مكتملة أو غير مسجلة";
    }

    if (new Date(driver.licenseExpiry) <= new Date()) {
        return "رخصة قيادة السائق منتهية الصلاحية، يرجى تجديدها أولاً";
    }

    const vehicleType = vehicle.vehicleType || vehicleTypes.NORMAL;
    const allowedVehicleTypes = {
        [vehicleTypes.TRUCK]: Object.values(vehicleTypes),
        [vehicleTypes.VAN]: [vehicleTypes.VAN, vehicleTypes.NORMAL],
        [vehicleTypes.NORMAL]: [vehicleTypes.NORMAL],
    };
    const canDrive = licenseTypes.some((licenseType) =>
        (allowedVehicleTypes[licenseType] || []).includes(vehicleType)
    );
    if (!canDrive) {
        return `فئة رخصة قيادة السائق لا تؤهله لقيادة ${vehicleTypeArabicLabels[vehicleType] || "هذه الفئة من المركبات"}`;
    }

    return null;
};
