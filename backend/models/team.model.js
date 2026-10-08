const mongoose = require("mongoose");
const { mainStatus } = require("../data/status");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
      index: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      enum: [mainStatus.ACTIVE, mainStatus.INACTIVE],
      default: mainStatus.ACTIVE,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ==========================================
// Indexes for Multi-Tenancy & High Performance
// ==========================================
// 1. Fast listing & filtering by company, deletion status, and active status
teamSchema.index({ companyId: 1, isDeleted: 1, status: 1 });

// 2. Fast lookup for manager assignment check
teamSchema.index({ companyId: 1, managerId: 1 });

// 3. Unique team name per company (only for active, non-deleted teams)
teamSchema.index(
  { name: 1, companyId: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

const Team = mongoose.model("team", teamSchema);
module.exports = Team;