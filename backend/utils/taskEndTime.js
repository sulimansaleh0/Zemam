const TASK_DURATION_MS = 2 * 60 * 60 * 1000

exports.getExpectedEndTime = (startTime, expectedEndTime) => {
    const start = new Date(startTime)
    const end = expectedEndTime ? new Date(expectedEndTime) : new Date(start.getTime() + TASK_DURATION_MS)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    if (end.getTime() < start.getTime() + TASK_DURATION_MS) return null
    return end
}
