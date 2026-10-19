const mongoose = require("mongoose");
const organization = require("./organization");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["citizen", "organization", "admin"],
    default: "citizen",
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  organizationRole: {
    type: String,
    enum: ["employee", "manager", "admin"],
    default: "employee",
  },
});

module.exports = mongoose.model("User", userSchema);
