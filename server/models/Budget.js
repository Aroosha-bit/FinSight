import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalBudget: {
      type: Number,
      required: true,
    },

    categoryBudgets: [
      {
        category: String,
        limit: Number,
      },
    ],
    month: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Budget", budgetSchema);
