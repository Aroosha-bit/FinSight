// pages/Dashboard.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import ExpenseList from "../components/ExpenseList";

const DEFAULT_CATEGORY_LIMITS = {
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

const getCurrencySymbol = (currencyStr) => {
  if (currencyStr?.includes("Rs")) return "Rs. ";
  if (currencyStr?.includes("$")) return "$";
  if (currencyStr?.includes("€")) return "€";
  if (currencyStr?.includes("₹")) return "₹";
  return "Rs. ";
};

function StatCard({
  label,
  value,
  sub,
  subColor = "text-gray-500",
  icon,
  barPct,
  barColor,
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-blue-600">{value}</div>
      {barPct !== undefined && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
          <div
            className={`h-1.5 rounded-full ${barColor || "bg-yellow-400"}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
      )}
      <span className={`text-xs ${subColor}`}>{sub}</span>
    </div>
  );
}

export default function Dashboard() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("Rs. ");
  const [totalBudget, setTotalBudget] = useState(50000);
  const [categoryBudgetsList, setCategoryBudgetsList] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [spendingChangeSub, setSpendingChangeSub] = useState("No spending last month");
  const [spendingChangeColor, setSpendingChangeColor] = useState("text-gray-400");
  const [savingsRateText, setSavingsRateText] = useState("0 / 20,000");
  const [savingsRatePct, setSavingsRatePct] = useState(0);
  const [categoryStatus, setCategoryStatus] = useState([]);
  const [spendingTrend, setSpendingTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [adviceCards, setAdviceCards] = useState([]);

  const computeMetrics = (allExpenses, currentTotalBudget, activeCategoryBudgets, symbol) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Current Month Expenses
    const currentMonthExpenses = allExpenses.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const currentMonthSpend = currentMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    setMonthlySpending(currentMonthSpend);

    // 2. Previous Month Expenses & comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthExpenses = allExpenses.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === prevMonth && txDate.getFullYear() === prevMonthYear;
    });
    const prevMonthSpend = prevMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);

    if (prevMonthSpend > 0) {
      const diffPercent = ((currentMonthSpend - prevMonthSpend) / prevMonthSpend) * 100;
      const formattedPercent = Math.abs(diffPercent).toFixed(0);
      if (diffPercent > 0) {
        setSpendingChangeSub(`↑ +${formattedPercent}% vs last month`);
        setSpendingChangeColor("text-red-500");
      } else if (diffPercent < 0) {
        setSpendingChangeSub(`↓ -${formattedPercent}% vs last month`);
        setSpendingChangeColor("text-green-500");
      } else {
        setSpendingChangeSub("0% change vs last month");
        setSpendingChangeColor("text-gray-400");
      }
    } else {
      setSpendingChangeSub("No spending last month");
      setSpendingChangeColor("text-gray-400");
    }

    // 3. Savings Rate
    const savingsGoal = Math.round(currentTotalBudget * 0.4) || 20000;
    const savings = Math.max(0, currentTotalBudget - currentMonthSpend);
    const savingsPct = Math.round((savings / savingsGoal) * 100);
    setSavingsRateText(`${symbol}${savings.toLocaleString()} / ${symbol}${savingsGoal.toLocaleString()}`);
    setSavingsRatePct(Math.min(100, isNaN(savingsPct) ? 0 : savingsPct));

    // 4. Category Budget Statuses
    const catLimitsMap = { ...DEFAULT_CATEGORY_LIMITS };
    activeCategoryBudgets.forEach((cb) => {
      if (cb.category && cb.limit) {
        catLimitsMap[cb.category] = cb.limit;
      }
    });

    const categorySpendMap = {};
    currentMonthExpenses.forEach((tx) => {
      const cat = tx.category || "Other";
      categorySpendMap[cat] = (categorySpendMap[cat] || 0) + tx.amount;
    });

    const computedCategoryStatuses = Object.keys(catLimitsMap).map((cat) => {
      const spent = categorySpendMap[cat] || 0;
      const limit = catLimitsMap[cat];
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      let status = "ok";
      if (pct >= 100) status = "over";
      else if (pct >= 80) status = "warning";

      return { name: cat, spent, limit, pct, status };
    });

    const activeCategoryStatuses = computedCategoryStatuses.filter(
      (c) => c.spent > 0 || activeCategoryBudgets.some((ab) => ab.category === c.name)
    );

    const finalCategoryStatuses = activeCategoryStatuses.length > 0 ? activeCategoryStatuses : 
      computedCategoryStatuses.slice(0, 4);

    setCategoryStatus(finalCategoryStatuses);

    // 5. Historical trend for past 6 months
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIndex = d.getMonth();
      const year = d.getFullYear();
      const mLabel = months[mIndex];

      const monthlySum = allExpenses
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === mIndex && txDate.getFullYear() === year;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      trend.push({ month: `${mLabel} ${year.toString().slice(-2)}`, amount: monthlySum });
    }
    setSpendingTrend(trend);

    // 6. Category Breakdown for Pie Chart
    const breakdownColors = ["#3B82F6", "#1D4ED8", "#60A5FA", "#93C5FD", "#34D399", "#FBBF24", "#F87171", "#A78BFA", "#BFDBFE"];
    const activeCategoriesWithSpend = Object.keys(categorySpendMap).map((cat, idx) => ({
      name: cat,
      value: categorySpendMap[cat],
      color: breakdownColors[idx % breakdownColors.length],
    }));
    
    setCategoryBreakdown(
      activeCategoriesWithSpend.length > 0 ? activeCategoriesWithSpend : [{ name: "No spending yet", value: 1, color: "#E5E7EB" }]
    );

    // 7. Dynamic AI Financial Advice
    const generatedAdvices = [];
    const overBudgetCats = finalCategoryStatuses.filter((c) => c.status === "over");
    if (overBudgetCats.length > 0) {
      generatedAdvices.push({
        icon: "✂️",
        text: `Cut spending! You've spent ${symbol}${overBudgetCats[0].spent.toLocaleString()} on ${overBudgetCats[0].name}, exceeding its limit.`,
      });
    } else {
      generatedAdvices.push({
        icon: "✂️",
        text: "Excellent work keeping your categories under budget! Maintain this discipline to boost your savings rate.",
      });
    }

    const transportSpend = categorySpendMap["Transport"] || 0;
    const foodSpend = (categorySpendMap["Food"] || 0) + (categorySpendMap["Dining"] || 0);

    if (transportSpend > (catLimitsMap["Transport"] || 5000) * 0.8) {
      generatedAdvices.push({
        icon: "🚌",
        text: `Your transport cost is ${symbol}${transportSpend.toLocaleString()}. Consider public transit or ridesharing to cut costs.`,
      });
    } else if (foodSpend > (catLimitsMap["Food"] || 10000) * 0.8) {
      generatedAdvices.push({
        icon: "🍳",
        text: `You've spent ${symbol}${foodSpend.toLocaleString()} on food. Cooking at home more often can yield substantial savings.`,
      });
    } else {
      generatedAdvices.push({
        icon: "🚌",
        text: "Your transportation and food categories look healthy and well within limits. Keep up the good work!",
      });
    }

    const underBudgetCnt = finalCategoryStatuses.filter((c) => c.status === "ok").length;
    if (underBudgetCnt >= finalCategoryStatuses.length * 0.6) {
      generatedAdvices.push({
        icon: "🎯",
        text: "You are on track to achieve your savings goal early this month. Great financial progress!",
      });
    } else {
      generatedAdvices.push({
        icon: "🎯",
        text: "Try deferring large, non-essential purchases to the next month to secure your savings goal.",
      });
    }
    setAdviceCards(generatedAdvices);
  };

  const fetchAdvice = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/auth/advice", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.advices)) {
        setAdviceCards(data.advices);
      }
    } catch (err) {
      console.error("Failed to fetch AI advice:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 1. Fetch Profile for currency settings
      const profileRes = await fetch("http://localhost:5000/api/auth/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      let activeCurrency = "USD ($)";
      if (profileData.success && profileData.user) {
        activeCurrency = profileData.user.currency || "USD ($)";
        setLoggedInUser(profileData.user.name || "");
      } else {
        const storedUser = localStorage.getItem("loggedInUser");
        if (storedUser) setLoggedInUser(storedUser);
        const storedCurrency = localStorage.getItem("loggedInCurrency");
        if (storedCurrency) activeCurrency = storedCurrency;
      }
      const symbol = getCurrencySymbol(activeCurrency);
      setCurrencySymbol(symbol);

      // 2. Fetch Budget from backend
      const budgetRes = await fetch("http://localhost:5000/api/budget/allBudgets", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const budgetList = await budgetRes.json();
      let activeTotalBudget = 50000;
      let activeCategoryBudgets = [];
      if (Array.isArray(budgetList) && budgetList.length > 0) {
        const latestBudget = budgetList[budgetList.length - 1];
        activeTotalBudget = latestBudget.totalBudget || 50000;
        activeCategoryBudgets = latestBudget.categoryBudgets || [];
      }
      setTotalBudget(activeTotalBudget);
      setCategoryBudgetsList(activeCategoryBudgets);

      // 3. Fetch Expenses
      const expensesRes = await fetch("http://localhost:5000/api/expense/allExpense", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const expensesData = await expensesRes.json();
      if (Array.isArray(expensesData)) {
        setExpenses(expensesData);
        computeMetrics(expensesData, activeTotalBudget, activeCategoryBudgets, symbol);
      }

      // 4. Fetch real-time Gemini advice from backend
      fetchAdvice();
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExpenseChange = (updatedExpenses) => {
    setExpenses(updatedExpenses);
    computeMetrics(updatedExpenses, totalBudget, categoryBudgetsList, currencySymbol);
    fetchAdvice();
  };

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Welcome {loggedInUser}
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Monthly Spending"
            value={`${currencySymbol}${monthlySpending.toLocaleString()}`}
            sub={spendingChangeSub}
            subColor={spendingChangeColor}
            icon="📊"
          />
          <StatCard
            label="Budget Remaining"
            value={`${currencySymbol}${Math.max(0, totalBudget - monthlySpending).toLocaleString()} left of ${currencySymbol}${totalBudget.toLocaleString()}`}
            sub={`${totalBudget > 0 ? Math.round((Math.max(0, totalBudget - monthlySpending) / totalBudget) * 100) : 0}% remaining`}
            subColor="text-gray-400"
            icon="💰"
            barPct={totalBudget > 0 ? Math.round((Math.max(0, totalBudget - monthlySpending) / totalBudget) * 100) : 0}
            barColor="bg-yellow-400"
          />
          <StatCard
            label="Savings Rate"
            value={savingsRateText}
            sub={`On track – ${savingsRatePct}% reached`}
            subColor="text-gray-400"
            icon="🐷"
            barPct={savingsRatePct}
            barColor="bg-blue-500"
          />
        </div>

        {/* Budget summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm text-gray-500 font-medium">
                Budget Summary
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                📋
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {categoryStatus.filter((c) => c.status === "ok").length} of {categoryStatus.length} categories under budget
            </p>
            {categoryStatus.filter((c) => c.status === "warning").length > 0 && (
              <p className="text-xs text-yellow-500 mt-0.5">
                ⚠ {categoryStatus.filter((c) => c.status === "warning").length} categories near limit
              </p>
            )}
            {categoryStatus.filter((c) => c.status === "over").length > 0 && (
              <p className="text-xs text-red-500 mt-0.5">
                ✕ {categoryStatus.filter((c) => c.status === "over").length} categories over budget
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm text-gray-500 font-medium">
                Monthly Budget
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                📅
              </div>
            </div>
            <div className="text-blue-600 font-bold text-base">
              {currencySymbol}{monthlySpending.toLocaleString()} of {currencySymbol}{totalBudget.toLocaleString()} used
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 mb-1">
              <div
                className="h-1.5 rounded-full bg-yellow-400"
                style={{ width: `${Math.min(100, totalBudget > 0 ? Math.round((monthlySpending / totalBudget) * 100) : 0)}%` }}
              />
            </div>
            <p className="text-xs text-yellow-500">{totalBudget > 0 ? Math.round((monthlySpending / totalBudget) * 100) : 0}% spent</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
              {categoryStatus.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span>{c.name}</span>
                    <span
                      className={
                        c.status === "over" ? "text-red-500 font-semibold" : ""
                      }
                    >
                      {c.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full">
                    <div
                      className={`h-1 rounded-full ${c.status === "over" ? "bg-red-500" : c.status === "warning" ? "bg-yellow-400" : "bg-blue-500"}`}
                      style={{ width: `${Math.min(100, c.pct)}%` }}
                    />
                  </div>
                  {c.status === "over" && (
                    <p className="text-xs text-red-500 mt-0.5">✕ Over budget</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">
              Spending Trend
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={spendingTrend}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => [`${currencySymbol}${v.toLocaleString()}`, "Spending"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">
              Category Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${currencySymbol}${v.toLocaleString()}`, ""]} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span className="text-xs text-gray-600">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Advice */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">
            Gemini's Financial Advice
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {adviceCards.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                    {card.icon}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="text-blue-500 text-sm">✨</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-snug">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <ExpenseList onExpenseChange={handleExpenseChange} />
      </main>
    </>
  );
}
