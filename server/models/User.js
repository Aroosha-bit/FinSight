import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    default: "USD ($)",
  },
  resetToken: String,
  resetTokenExpiry: { type: Date },
});

export default mongoose.model("User", userSchema);
