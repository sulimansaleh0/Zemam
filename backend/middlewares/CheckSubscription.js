const { subscriptionStatus, plans } = require("../data/plans")
const Company = require("../models/company.model")
const { error, serverError } = require("../utils/responses")

module.exports = (plan = plans.TRIAL) =>
    async (req, res, next) => {
        try {
            const user = req.user
            if (!user) return error(res, 401, "Unauthorized")
            const company = await Company.findById(user.companyId)
                .select("plan subscriptionStatus subscriptionEndsAt")
            if (!company) return error(res, 404, "Company not found")

            const now = new Date()

            if (
                company.subscriptionStatus === subscriptionStatus.ACTIVE &&
                company.subscriptionEndsAt <= now
            ) {
                company.subscriptionStatus = subscriptionStatus.EXPIRED
                company.plan = plans.FREE
                await company.save()
                return error(res, 402, "Your trial has ended. Choose a plan to continue.")
            }

            const hasAccess =
                company.subscriptionStatus === subscriptionStatus.ACTIVE

            if (!hasAccess) {
                return error(res, 402, "Your subscription has expired. Choose a plan to continue.")
            }

            const planHierarchy = {
                [plans.FREE]: 0,
                [plans.TRIAL]: 1,
                [plans.MONTHLY]: 2,
                [plans.ANNUAL]: 3
            }

            const currentPlanRank = planHierarchy[company.plan] ?? 0
            const requiredPlanRank = planHierarchy[plan] ?? 1

            if (currentPlanRank < requiredPlanRank) {
                return error(res, 403, "Upgrade your plan to use this feature.")
            }

            next()
        } catch (err) {
            console.log(err)
            return serverError(res)
        }
    }