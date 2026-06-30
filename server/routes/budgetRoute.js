import express from "express";
import Budget from "../models/Budget.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
// http://localhost:5000/api/budget/add-budget
router.post("/add-budget", protect, async (req, res) => {
  try {
    const { totalBudget, categoryBudgets, month } = req.body;

    const budget = await Budget.create({
      userId: req.user._id,
      totalBudget,
      categoryBudgets,
      month,
    });

    res.status(201).json({
      success: true,
      budget,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// http://localhost:5000/api/budget/allBudgets
router.get("/allBudgets", protect, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// http://localhost:5000/api/budget/updateBudget/:id
router.put("/updateBudget/:id", protect, async (req, res) => {
  try {
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        totalBudget: req.body.totalBudget,
        categoryBudgets: req.body.categoryBudgets,
        month: req.body.month,
      },
      { new: true },
    );
    if (!updatedBudget)
      return res.status(404).json({ message: "Budget not found" });
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
