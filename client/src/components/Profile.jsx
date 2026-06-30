import { useEffect, useState } from "react";
import {
  Home,
  PlusCircle,
  List,
  BarChart2,
  Bell,
  User,
  LogOut,
  X,
  Layers,
  Banknote,
  Mail,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleSuccess, handleError } from "../utils";

export default function Profile() {
  const [categoryBudgets, setCategoryBudgets] = useState([
    { id: 1, category: "Groceries", limit: 2500 },
    { id: 2, category: "Dining", limit: 10000 },
    { id: 3, category: "Transport", limit: 5000 },
    { id: 4, category: "Rent", limit: 8000 },
  ]);

  const [categories, setCategories] = useState([
    "Food",
    "Transport",
    "Groceries",
    "Bills",
    "Savings",
    "Entertainment",
  ]);
  const [newCategory, setNewCategory] = useState("");

  const [toggles, setToggles] = useState({
    budgetAlerts: false,
    aiInsights: false,
    reminders: false,
  });

  const [aiFrequency, setAiFrequency] = useState("daily");

  const removeCategoryBudget = (id) => {
    setCategoryBudgets((prev) => prev.filter((c) => c.id !== id));
  };

  const removeCategory = (name) => {
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setNewCategory("");
    }
  };

  const toggle = (key) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  const [loggedInUser, setLoggedInUser] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("USD ($)");
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success && result.user) {
        setName(result.user.name || "");
        setEmail(result.user.email || "");
        setCurrency(result.user.currency || "USD ($)");
        localStorage.setItem("loggedInUser", result.user.name);
        localStorage.setItem("loggedInEmail", result.user.email);
        localStorage.setItem("loggedInCurrency", result.user.currency || "USD ($)");
        setLoggedInUser(result.user.name);
        setLoggedInEmail(result.user.email);
      } else {
        handleError(result.message || "Failed to fetch profile");
      }
    } catch (err) {
      handleError("An error occurred while fetching profile details.");
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    const emailVal = localStorage.getItem("loggedInEmail");
    if (user) setLoggedInUser(user);
    if (emailVal) setLoggedInEmail(emailVal);
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      handleError("Name and Email are required.");
      return;
    }
    if (password && password.length < 8) {
      handleError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          currency,
        }),
      });

      const result = await response.json();
      if (result.success) {
        handleSuccess(result.message || "Profile updated successfully!");
        localStorage.setItem("token", result.jwtToken);
        localStorage.setItem("loggedInUser", result.name);
        localStorage.setItem("loggedInEmail", result.email);
        localStorage.setItem("loggedInCurrency", result.currency || "USD ($)");
        setLoggedInUser(result.name);
        setLoggedInEmail(result.email);
        setPassword("");
      } else {
        handleError(result.message || "Failed to update profile.");
      }
    } catch (err) {
      handleError("An error occurred during update.");
    }
  };

  const handleLogOut = (e) => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInEmail");
    handleSuccess("User Logged Out");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Profile</h1>

        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-4">
            <span className=" bg-slate-700 hover:bg-slate-800 text-white text-[20px] font-medium px-4 py-2 rounded-full transition-colors">
              {loggedInUser ? loggedInUser.charAt(0).toUpperCase() : ""}
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {loggedInUser}
              </p>
              <p className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                <Mail className="w-4 h-4" />
                {loggedInEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogOut}
            className="flex cursor-pointer items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </div>

        {/* Personal Details */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Personal Details
          </h2>
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Name
              </label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 bg-white">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  className="w-full outline-none text-slate-700 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 bg-white">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="w-full outline-none text-slate-700 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 bg-white">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter Your Password"
                  className="w-full outline-none text-slate-700 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Currency
              </label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 bg-white">
                <Banknote className="w-4 h-4 text-slate-400" />
                <select
                  className="w-full outline-none text-slate-500 text-sm bg-transparent"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="Select Currency">Select Currency</option>
                  <option value="PKR (Rs)">PKR (Rs)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end col-span-1 md:col-span-2 mt-5">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white text-sm font-semibold px-8 py-2.5 rounded-lg transition-colors">
                Update
              </button>
            </div>
          </form>
        </section>

        {/* Budget Settings */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Budget Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1.5">
                Category Budget
              </p>
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                <div className="grid grid-cols-2 bg-slate-100 text-blue-600 text-sm font-semibold px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    CATEGORY
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    LIMIT
                  </div>
                </div>
                {categoryBudgets.map((c, i) => (
                  <div
                    key={c.id}
                    className={`grid grid-cols-2 px-4 py-3.5 text-slate-600 text-sm ${
                      i !== categoryBudgets.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <span>{c.category}</span>
                    <span>{c.limit.toLocaleString("en-IN")} /-</span>
                  </div>
                ))}
                <button className="flex items-center gap-2 text-slate-500 text-sm px-4 py-3.5 hover:bg-slate-50 transition-colors w-full text-left border-t border-slate-100">
                  <PlusCircle className="w-4 h-4" />
                  Add New Category Budget
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Monthly Budget
              </label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 bg-white">
                <span className="text-slate-400 text-sm">Rs</span>
                <input
                  type="text"
                  defaultValue="50,000"
                  className="w-full outline-none text-slate-700 text-sm"
                />
              </div>
              <div className="flex-1" />
              <div className="flex justify-end mt-5">
                <button className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-sm font-semibold px-8 py-2.5 rounded-lg transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Management */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Category Management
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {categories.map((cat) => (
              <span
                key={cat}
                className="flex items-center gap-2 bg-slate-100 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg"
              >
                {cat}
                <button
                  onClick={() => removeCategory(cat)}
                  aria-label={`Remove ${cat}`}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-3 max-w-md">
            <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 bg-white flex-1">
              <PlusCircle className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Add New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                className="w-full outline-none text-slate-600 text-sm placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={addCategory}
              className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 mb-5">
            Notifications Settings
          </h2>

          <div className="flex items-start justify-between py-4 border-b border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Budget Alerts</p>
              <p className="text-sm text-slate-500 mt-0.5">
                when you've reached 80% of monthly/category budget
              </p>
            </div>
            <ToggleSwitch
              checked={toggles.budgetAlerts}
              onChange={() => toggle("budgetAlerts")}
            />
          </div>

          <div className="flex items-start justify-between py-4 border-b border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">AI Insights</p>
              <p className="text-sm text-slate-500 mt-0.5">daily/weekly tips</p>
              <div className="flex flex-col gap-2 mt-2.5">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="aiFrequency"
                    checked={aiFrequency === "daily"}
                    onChange={() => setAiFrequency("daily")}
                    className="w-4 h-4 accent-blue-600"
                  />
                  Daily
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="aiFrequency"
                    checked={aiFrequency === "weekly"}
                    onChange={() => setAiFrequency("weekly")}
                    className="w-4 h-4 accent-blue-600"
                  />
                  Weekly
                </label>
              </div>
            </div>
            <ToggleSwitch
              checked={toggles.aiInsights}
              onChange={() => toggle("aiInsights")}
            />
          </div>

          <div className="flex items-start justify-between py-4">
            <div>
              <p className="font-semibold text-slate-900">Reminders</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Get daily expense entry reminder
              </p>
            </div>
            <ToggleSwitch
              checked={toggles.reminders}
              onChange={() => toggle("reminders")}
            />
          </div>
        </section>
      </main>

   
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={`relative w-11 h-6 cursor-pointer rounded-full transition-colors shrink-0 ${
        checked ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
