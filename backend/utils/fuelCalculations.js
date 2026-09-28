const FUEL_WARNING_TOLERANCE = 0.8
const HIGH_CONSUMPTION_MESSAGE = "Fuel consumption is significantly higher than the expected efficiency. Please inspect the vehicle."

const calculateFuelMetrics = ({ totalFuel, currentOdometer, previousOdometer }) => {
    const distanceSinceLastFull = currentOdometer - previousOdometer

    if (
        !Number.isFinite(totalFuel) ||
        totalFuel <= 0 ||
        !Number.isFinite(currentOdometer) ||
        !Number.isFinite(previousOdometer) ||
        distanceSinceLastFull < 0
    ) return null

    return {
        distanceSinceLastFull,
        fuelSinceLastFull: totalFuel,
        fuelEfficiency: distanceSinceLastFull / totalFuel
    }
}

const getFuelIssue = ({ fuelEfficiency, expectedFuelEfficiency }) => {
    if (
        !Number.isFinite(fuelEfficiency) ||
        !Number.isFinite(expectedFuelEfficiency) ||
        expectedFuelEfficiency <= 0 ||
        fuelEfficiency >= expectedFuelEfficiency * FUEL_WARNING_TOLERANCE
    ) {
        return {
            fuelIssue: false,
            fuelIssueType: null,
            fuelIssueMessage: null
        }
    }

    return {
        fuelIssue: true,
        fuelIssueType: "high_consumption",
        fuelIssueMessage: HIGH_CONSUMPTION_MESSAGE
    }
}

const calculateApprovedFuelMetrics = (records, expectedFuelEfficiency) => {
    const approvedRecords = records
        .map((record, index) => ({ record, index }))
        .filter(({ record }) => record.status === "approved")
        .sort((a, b) => {
            const aTime = new Date(a.record.createdAt).getTime()
            const bTime = new Date(b.record.createdAt).getTime()
            if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
                return aTime - bTime
            }
            if (Number.isFinite(aTime) !== Number.isFinite(bTime)) {
                return Number.isFinite(aTime) ? -1 : 1
            }

            const idDifference = String(a.record._id).localeCompare(String(b.record._id))
            return idDifference || a.index - b.index
        })

    let previousFullTankOdometer = null
    let previousOdometer = null
    let fuelSinceLastFull = 0

    return approvedRecords.map(({ record }) => {
        const result = {
            _id: record._id,
            distanceSinceLastFull: null,
            fuelSinceLastFull: null,
            fuelEfficiency: null,
            fuelIssue: false,
            fuelIssueType: null,
            fuelIssueMessage: null
        }

        if (!Number.isFinite(record.odometer) || record.odometer < 0) {
            return result
        }

        if (previousOdometer !== null && record.odometer < previousOdometer) return result

        previousOdometer = record.odometer

        if (!Number.isFinite(record.qty) || record.qty <= 0) return result

        if (previousFullTankOdometer !== null) {
            fuelSinceLastFull += record.qty
        }

        if (record.isFullTank) {
            if (previousFullTankOdometer !== null) {
                const metrics = calculateFuelMetrics({
                    totalFuel: fuelSinceLastFull,
                    currentOdometer: record.odometer,
                    previousOdometer: previousFullTankOdometer
                })

                if (metrics) {
                    Object.assign(result, metrics, getFuelIssue({
                        fuelEfficiency: metrics.fuelEfficiency,
                        expectedFuelEfficiency
                    }))
                }
            }

            previousFullTankOdometer = record.odometer
            fuelSinceLastFull = 0
        }

        return result
    })
}

module.exports = {
    calculateFuelMetrics,
    getFuelIssue,
    calculateApprovedFuelMetrics
}