const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
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

    address: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Organization", organizationSchema);
