exports.allowedOrigins = [
    "http://localhost:3000",
    process.env.CLIENT_URL,
].filter(Boolean);

exports.maintenanceCategories = {
    FAULTS: "Faults",
    PERIODIC_MAINTENANCE: "Periodic Maintenance"
}

exports.maintenancePriority = {
    HIGH: "High",
    LOW: "low"
}

exports.fuelTypes = ["بنزين 91", "بنزين 95", "ديزل", "Diesel", "هجين", "Hybrid", "كهربائي", "EV"]