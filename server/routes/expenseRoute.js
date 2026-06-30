import express from "express";
import Expense from "../models/Expense.js";
import ensureAuthenticated from "../middleware/authMiddleware.js";
const router = express.Router();
// http://localhost:5000/api/expense/create-expense
router.post("/create-expense", ensureAuthenticated, async (req, res) => {
  try {
    const { amount, category, date, notes } = req.body;
    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category,
      date,
      notes,
    });

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// http://localhost:5000/api/expense/allExpense
router.get("/allExpense", ensureAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [
        { userId: req.user._id },
        { userId: null },
        { userId: { $exists: false } },
      ],
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// http://localhost:5000/api/expense/:id
// http://localhost:5000/api/expense/getExpense/6a33bb51c6cc26fef262a318
router.get("/getExpense/:id", ensureAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.findById(req.params.id);
    if (!expenses)
      return res.status(404).json({ message: "Expense not found" });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// http://localhost:5000/api/expense/updateExpense/6a33bb51c6cc26fef262a318
router.put("/updateExpense/:id", ensureAuthenticated, async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        amount: req.body.amount,
        category: req.body.category,
        date: req.body.date,
        notes: req.body.notes,
        title: req.body.title,
        paymentMethod: req.body.paymentMethod,
      },
      { new: true },
    );
    if (!updatedExpense)
      return res.status(404).json({ message: "Expense not Found to update" });
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// http://localhost:5000/api/expense/deleteExpense/6a33bb51c6cc26fef262a318
router.delete("/deleteExpense/:id", ensureAuthenticated, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense Not Found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
