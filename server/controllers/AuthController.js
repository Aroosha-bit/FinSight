import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "User already exists, you can login",
        success: false,
      });
    }
    const userModel = new User({ name, email, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    res.status(201).json({ message: "signup successfull", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const errMsg = "Auth failed, email or password is wrong";
    if (!user) {
      return res.status(403).json({
        message: errMsg,
        success: false,
      });
    }
    //password send by user, user.password is stired in db
    console.log("Entered Password:", password);
    console.log("Stored Hash:", user.password);

    const isPassEqual = await bcrypt.compare(password, user.password);

    console.log("Password Match:", isPassEqual);
    if (!isPassEqual) {
      return res.status(403).json({
        message: errMsg,
        success: false,
      });
    }
    console.log("JJWT_SECRET KEY1", process.env.JWT_SECRET);

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
    console.log("JJWT_SECRET KEY2", process.env.JWT_SECRET);
    res.status(200).json({
      message: "Login successfull",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;

    user.resetTokenExpiry =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl =
      `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Password",
      `
      <h3>Password Reset</h3>

      <p>
      Click below link to reset password
      </p>

      <a href="${resetUrl}">
      Reset Password
      </a>
      `
    );

    res.status(200).json({
      success: true,
      message: "Reset link sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, password, currency } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists", success: false });
      }
      user.email = email;
    }

    user.name = name;
    user.currency = currency || "USD ($)";

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      jwtToken,
      email: user.email,
      name: user.name,
      currency: user.currency,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getGeminiAdvice = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user to get their currency
    const user = await User.findById(userId);
    const currency = user ? (user.currency || "USD ($)") : "USD ($)";

    // 2. Fetch monthly budget
    const budgetList = await Budget.find({ userId });
    let totalBudget = 50000;
    let categoryBudgets = [];
    if (budgetList && budgetList.length > 0) {
      const latestBudget = budgetList[budgetList.length - 1];
      totalBudget = latestBudget.totalBudget || 50000;
      categoryBudgets = latestBudget.categoryBudgets || [];
    }

    // 3. Fetch current month expenses
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const allExpenses = await Expense.find({ userId });
    const currentMonthExpenses = allExpenses.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const monthlySpending = currentMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);

    // Group current month spending by category
    const categorySpendMap = {};
    currentMonthExpenses.forEach((tx) => {
      const cat = tx.category || "Other";
      categorySpendMap[cat] = (categorySpendMap[cat] || 0) + tx.amount;
    });

    const categoryDataString = Object.keys(categorySpendMap)
      .map((cat) => `- ${cat}: ${categorySpendMap[cat]} ${currency}`)
      .join("\n");

    const defaultLimits = {
      "Food": 10000,
      "Transport": 5000,
      "Shopping": 8000,
      "Bills": 12000,
      "Healthcare": 5000,
      "Education": 10000,
      "Entertainment": 5000,
      "Travel": 10000,
      "Other": 5000
    };

    // Calculate budget limits for each category
    const limitsMap = { ...defaultLimits };
    categoryBudgets.forEach((cb) => {
      if (cb.category && cb.limit) {
        limitsMap[cb.category] = cb.limit;
      }
    });

    // Check if the API key exists
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are a professional financial advisor. Analyze the following budget and expense data for a user:
- Total Monthly Budget: ${totalBudget} ${currency}
- Total Current Spending: ${monthlySpending} ${currency}
- Expenses by Category:
${categoryDataString || "No expenses added yet."}

Please provide exactly three actionable, highly personalized financial advices.
For each advice, provide:
1. An emoji icon representing the advice (e.g., 🚌, ✂️, 🍳, 🛒, 🎯, 💡).
2. The advice text itself (be concise, professional, friendly, and under 15 words).

Format your response as a valid JSON array containing exactly three objects with keys "icon" and "text". Do not include any markdown backticks or extra text, just the raw JSON. Example:
[
  {"icon": "✂️", "text": "Cut back on dining to save money this month."},
  {"icon": "🚌", "text": "Your transport cost is normal. Keep it up!"},
  {"icon": "🎯", "text": "You are on track to save 20% of your budget."}
]
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const advices = JSON.parse(cleanedText);
        if (Array.isArray(advices) && advices.length === 3) {
          return res.status(200).json({ success: true, advices });
        }
      } catch (err) {
        console.error("Gemini API call failed, using fallback:", err.message);
      }
    }

    // Fallback: rule-based advice generation
    const fallbackAdvices = [];
    const computedCategoryStatuses = Object.keys(limitsMap).map((cat) => {
      const spent = categorySpendMap[cat] || 0;
      const limit = limitsMap[cat];
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      let status = "ok";
      if (pct >= 100) status = "over";
      else if (pct >= 80) status = "warning";

      return { name: cat, spent, limit, pct, status };
    });

    const overBudgetCats = computedCategoryStatuses.filter((c) => c.status === "over");
    if (overBudgetCats.length > 0) {
      fallbackAdvices.push({
        icon: "✂️",
        text: `Cut spending! You've spent ${currency.split(" ")[1] || ""}${overBudgetCats[0].spent.toLocaleString()} on ${overBudgetCats[0].name}, exceeding its limit.`,
      });
    } else {
      fallbackAdvices.push({
        icon: "✂️",
        text: "Excellent work keeping your categories under budget! Maintain this discipline to boost your savings rate.",
      });
    }

    const transportSpend = categorySpendMap["Transport"] || 0;
    const foodSpend = (categorySpendMap["Food"] || 0) + (categorySpendMap["Dining"] || 0);

    if (transportSpend > (limitsMap["Transport"] || 5000) * 0.8) {
      fallbackAdvices.push({
        icon: "🚌",
        text: `Your transport cost is ${currency.split(" ")[1] || ""}${transportSpend.toLocaleString()}. Consider public transit to cut costs.`,
      });
    } else if (foodSpend > (limitsMap["Food"] || 10000) * 0.8) {
      fallbackAdvices.push({
        icon: "🍳",
        text: `You've spent ${currency.split(" ")[1] || ""}${foodSpend.toLocaleString()} on food. Cooking at home can yield savings.`,
      });
    } else {
      fallbackAdvices.push({
        icon: "🚌",
        text: "Your transportation and food categories look healthy and well within limits. Keep up the good work!",
      });
    }

    const underBudgetCnt = computedCategoryStatuses.filter((c) => c.status === "ok").length;
    if (underBudgetCnt >= computedCategoryStatuses.length * 0.6) {
      fallbackAdvices.push({
        icon: "🎯",
        text: "You are on track to achieve your savings goal early this month. Great financial progress!",
      });
    } else {
      fallbackAdvices.push({
        icon: "🎯",
        text: "Try deferring large, non-essential purchases to the next month to secure your savings goal.",
      });
    }

    res.status(200).json({ success: true, advices: fallbackAdvices });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export { register, logIn, forgotPassword, resetPassword, getProfile, updateProfile, getGeminiAdvice };
