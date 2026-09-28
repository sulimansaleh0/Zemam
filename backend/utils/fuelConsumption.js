const calculateTaskFuelConsumption = ({ startOdometer, endOdometer, expectedFuelEfficiency }) => {
    if (
        !Number.isFinite(startOdometer) ||
        !Number.isFinite(endOdometer) ||
        !Number.isFinite(expectedFuelEfficiency) ||
        startOdometer < 0 ||
        endOdometer < startOdometer ||
        expectedFuelEfficiency <= 0
    ) return null

    return (endOdometer - startOdometer) / expectedFuelEfficiency
}

module.exports = { calculateTaskFuelConsumption }
