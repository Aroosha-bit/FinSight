import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Transport",
        "Shopping",
        "Bills",
        "Healthcare",
        "Education",
        "Entertainment",
        "Travel",
        "Other",
      ],
    },

    date: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
    },
   
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Expense", expenseSchema);
