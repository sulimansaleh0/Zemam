const FUEL_WARNING_TOLERANCE = 0.8

const calculateFuelMetrics = ({ totalFuel, currentOdometer, previousOdometer }) => {
    const distanceSinceLastFull = currentOdometer - previousOdometer

    if (distanceSinceLastFull <= 0) return null

    return {
        distanceSinceLastFull,
        fuelSinceLastFull: totalFuel,
        fuelEfficiency: distanceSinceLastFull / totalFuel
    }
}

const getFuelIssue = ({ fuelEfficiency, expectedFuelEfficiency }) => {
    if (!expectedFuelEfficiency || fuelEfficiency >= expectedFuelEfficiency * FUEL_WARNING_TOLERANCE) {
        return {
            fuelIssue: false,
            fuelIssueType: null,
            fuelIssueMessage: null
        }
    }

    return {
        fuelIssue: true,
        fuelIssueType: "high_consumption",
        fuelIssueMessage: "Unusually high fuel consumption detected. Please inspect this vehicle for a possible fuel leak."
    }
}

module.exports = {
    calculateFuelMetrics,
    getFuelIssue
}