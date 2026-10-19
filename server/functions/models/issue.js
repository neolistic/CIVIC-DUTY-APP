const mongoose = require("mongoose");
const User = require("./user");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "roads",
        "streetlights",
        "garbage",
        "water",
        "drainage",
        "traffic",
        "public_spaces",
        "parks",
        "public_property",
        "other",
      ],
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: [
        "reported",
        "under_review",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
        "rejected",
        "duplicate",
      ],
      default: "reported",
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    history: [
      {
        action: {
          type: String,
          required: true,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

issueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Issue", issueSchema);
