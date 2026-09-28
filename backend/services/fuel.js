const Fuel = require("../models/fuel.model")
const Task = require("../models/task.model")
const Vehicle = require("../models/vehicle.model")
const mongoose = require("mongoose")
const { taskStatus, expenseRecordStatus } = require("../data/status")

const configuredEfficiencyTolerance = Number(process.env.FUEL_EFFICIENCY_TOLERANCE_PERCENT)
const fuelEfficiencyTolerancePercent =
    Number.isFinite(configuredEfficiencyTolerance) && configuredEfficiencyTolerance >= 0
        ? configuredEfficiencyTolerance
        : 20

const getFuelRecordsBetweenFullRefills = async ({ vehicleId, companyId, previousFull, currentFull, session }) => {
    const records = await Fuel.aggregate([
        {
            $match: {
                vehicleId,
                companyId,
                status: expenseRecordStatus.APPROVED,
                $and: [
                    {
                        $or: [
                            { createdAt: { $gt: previousFull.createdAt } },
                            { createdAt: previousFull.createdAt, _id: { $gt: previousFull._id } }
                        ]
                    },
                    {
                        $or: [
                            { createdAt: { $lt: currentFull.createdAt } },
                            { createdAt: currentFull.createdAt, _id: { $lte: currentFull._id } }
                        ]
                    }
                ]
            }
        },
        { $group: { _id: null, totalFuel: { $sum: "$qty" } } }
    ]).session(session)

    return records[0]?.totalFuel || 0
}

const buildFuelIssue = ({ distance, actualEfficiency, expectedEfficiency }) => {
    if (distance < 0) {
        return {
            fuelIssue: true,
            fuelIssueType: "efficiency_deviation",
            fuelIssueMessage: "The odometer reading is lower than the previous full refill; fuel efficiency could not be calculated."
        }
    }

    const hasEfficiencyIssue = actualEfficiency !== null &&
        Number.isFinite(expectedEfficiency) &&
        expectedEfficiency > 0 &&
        Math.abs(actualEfficiency - expectedEfficiency) / expectedEfficiency * 100 >
        fuelEfficiencyTolerancePercent

    if (!hasEfficiencyIssue) {
        return {
            fuelIssue: false,
            fuelIssueType: null,
            fuelIssueMessage: null
        }
    }

    const isHighConsumption = actualEfficiency < expectedEfficiency
    return {
        fuelIssue: true,
        fuelIssueType: isHighConsumption ? "high_consumption" : "efficiency_deviation",
        fuelIssueMessage: `Actual efficiency (${actualEfficiency.toFixed(2)} km/L) differs from expected efficiency (${expectedEfficiency.toFixed(2)} km/L) by more than the ${fuelEfficiencyTolerancePercent}% tolerance.`
    }
}

exports.getFuelStats = async ({ companyId, teamId, vehicleId }) => {
    const fuelMatch = { companyId }
    if (teamId) fuelMatch.teamId = teamId
    if (vehicleId) fuelMatch.vehicleId = vehicleId

    const taskMatch = { companyId, status: taskStatus.FINISHED }
    if (teamId) taskMatch.teamId = teamId
    if (vehicleId) taskMatch.vehicleId = vehicleId

    const vehicleMatch = { companyId, isDeleted: false }
    if (teamId) vehicleMatch.teamId = teamId
    if (vehicleId) vehicleMatch._id = vehicleId

    const [[fuelSummary], [taskSummary], [balanceSummary]] = await Promise.all([
        Fuel.aggregate([
            { $match: fuelMatch },
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    totalCost: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$cost", 0] } },
                    totalQty: { $sum: "$qty" },
                    pending: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.PENDING] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, 1, 0] } },
                    declined: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.DECLINED] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRecords: 1,
                    totalCost: 1,
                    totalQty: 1,
                    pending: 1,
                    approved: 1,
                    declined: 1
                }
            }
        ]),
        Task.aggregate([
            { $match: taskMatch },
            {
                $group: {
                    _id: null,
                    distance: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$fuelConsumptionAppliedAt", null] },
                                        { $ne: ["$startOdometer", null] },
                                        { $ne: ["$endOdometer", null] },
                                        { $gte: ["$endOdometer", "$startOdometer"] }
                                    ]
                                },
                                { $subtract: ["$endOdometer", "$startOdometer"] },
                                0
                            ]
                        }
                    },
                    fuelConsumed: {
                        $sum: {
                            $cond: [
                                { $ne: ["$fuelConsumptionAppliedAt", null] },
                                { $ifNull: ["$fuelConsumedLitres", 0] },
                                0
                            ]
                        }
                    }
                }
            }
        ]),
        Vehicle.aggregate([
            { $match: vehicleMatch },
            {
                $group: {
                    _id: null,
                    fuelBalanceLitres: { $sum: { $ifNull: ["$fuelBalanceLitres", 0] } }
                }
            }
        ])
    ])

    return {
        ...(fuelSummary || {
            totalRecords: 0,
            totalCost: 0,
            totalQty: 0,
            pending: 0,
            approved: 0,
            declined: 0
        }),
        fuelBalanceLitres: balanceSummary?.fuelBalanceLitres || 0,
        averageEfficiency: taskSummary?.fuelConsumed
            ? taskSummary.distance / taskSummary.fuelConsumed
            : 0
    }
}

exports.applyFuelVerification = async ({ filters, fuelRecord, vehicle, status, user }) => {
    const session = await mongoose.startSession()
    let recordWasUpdated = false

    try {
        await session.withTransaction(async () => {
            recordWasUpdated = false
            const fullTankCycle = status === expenseRecordStatus.APPROVED && fuelRecord.isFullTank
                ? await calculateFullTankCycle({
                    fuelRecord,
                    vehicle,
                    companyId: user.companyId,
                    session
                })
                : null

            const result = await Fuel.updateOne(
                { ...filters, status: expenseRecordStatus.PENDING },
                {
                    $set: {
                        status,
                        verifiedBy: user._id,
                        verifiedAt: new Date(),
                        ...(fullTankCycle || {})
                    }
                },
                { runValidators: true, session }
            )

            if (!result.modifiedCount) return
            recordWasUpdated = true

            if (status === expenseRecordStatus.APPROVED) {
                const balanceUpdate = await Vehicle.updateOne(
                    { _id: fuelRecord.vehicleId, companyId: user.companyId, isDeleted: false },
                    { $inc: { fuelBalanceLitres: fuelRecord.qty } },
                    { session }
                )
                if (!balanceUpdate.matchedCount) {
                    throw new Error("Vehicle not found while adding approved fuel balance")
                }
            }
        })
    } finally {
        await session.endSession()
    }

    return recordWasUpdated
}

async function calculateFullTankCycle({ fuelRecord, vehicle, companyId, session }) {
    const previousFull = await Fuel.findOne({
        vehicleId: fuelRecord.vehicleId,
        companyId,
        status: expenseRecordStatus.APPROVED,
        isFullTank: true,
        $or: [
            { createdAt: { $lt: fuelRecord.createdAt } },
            { createdAt: fuelRecord.createdAt, _id: { $lt: fuelRecord._id } }
        ]
    })
        .sort({ createdAt: -1, _id: -1 })
        .session(session)

    if (!previousFull) return null

    const distanceSinceLastFull = fuelRecord.odometer - previousFull.odometer
    const fuelSinceLastFull = await getFuelRecordsBetweenFullRefills({
        vehicleId: fuelRecord.vehicleId,
        companyId,
        previousFull,
        currentFull: fuelRecord,
        session
    }) + fuelRecord.qty
    const fuelEfficiency = fuelSinceLastFull > 0 && distanceSinceLastFull >= 0
        ? distanceSinceLastFull / fuelSinceLastFull
        : null

    return {
        distanceSinceLastFull: distanceSinceLastFull >= 0 ? distanceSinceLastFull : null,
        fuelSinceLastFull,
        fuelEfficiency,
        ...buildFuelIssue({
            distance: distanceSinceLastFull,
            actualEfficiency: fuelEfficiency,
            expectedEfficiency: vehicle.expectedFuelEfficiency
        })
    }
}

exports.calculateFullTankCycle = calculateFullTankCycle