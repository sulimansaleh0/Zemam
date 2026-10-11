const mongoose = require("mongoose");

const inspectionItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    passed: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const dailyInspectionSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vehicle",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      default: null,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      default: null,
    },
    odometer: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PASSED", "FAILED"],
      default: "PASSED",
    },
    items: {
      type: [inspectionItemSchema],
      required: true,
      validate: [
        (v) => Array.isArray(v) && v.length > 0,
        "يجب تسجيل بنود الفحص اليومي",
      ],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
  },
  { timestamps: true }
);

// فهارس مركبة لتحسين سرعة الاستعلام
dailyInspectionSchema.index({ companyId: 1, createdAt: -1 });
dailyInspectionSchema.index({ companyId: 1, driverId: 1, createdAt: -1 });
dailyInspectionSchema.index({ companyId: 1, vehicleId: 1, createdAt: -1 });
dailyInspectionSchema.index({ taskId: 1 });

const DailyInspection = mongoose.model("dailyInspection", dailyInspectionSchema);
module.exports = DailyInspection;
