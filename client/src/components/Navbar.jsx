import {
  Bell,
  ChartNoAxesCombined,
  CirclePlus,
  House,
  LogOut,
  Menu,
} from "lucide-react";
import logo from "../assets/Logo.svg";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { handleSuccess } from "../utils";
import { ToastContainer } from "react-toastify";
import Notifications from "./Notifications";

export default function Navbar({ onAddExpense }) {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  // Close the panel when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleLogOut = (e) => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("User Logged Out");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const handleMarkAllRead = () => {
    // TODO: call PUT /api/notifications/markAllRead, then refresh list
    setShowNotifications(false);
  };

  const handleSettings = () => {
    setShowNotifications(false);
    navigate("/profile");
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8  flex items-center justify-center">
          <img src={logo} alt="" />
        </div>
        <span className="text-blue-600 font-bold text-lg tracking-tight">
          FinSight
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Link
          to="/"
          title="Dashboard"
          className="p-2 cursor-pointer rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors relative group"
        >
          <House />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-xs bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Dashboard
          </span>
        </Link>

        <button
          onClick={onAddExpense}
          title="Add Expense"
          className="p-2 cursor-pointer rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors relative group"
        >
          <CirclePlus />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-xs bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Add Expense
          </span>
        </button>

        <Link
          to="/expense-list"
          className="p-2 cursor-pointer rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors relative group"
          title="Menu"
        >
          <Menu />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-xs bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Menu
          </span>
        </Link>

        <button
          className="p-2 cursor-pointer rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors relative group"
          title="Analytics"
        >
          <ChartNoAxesCombined />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-xs bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Analytics
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-2 cursor-pointer rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors relative group"
          onClick={handleLogOut}
        >
          <LogOut />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-xs bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            LogOut
          </span>
        </button>
        <ToastContainer />

        {/* Notifications bell + panel */}
        <div className="relative" ref={notificationsRef}>
          <button
            className="p-2 cursor-pointer rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors relative group"
            title="Notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-xs bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Notifications
            </span>
          </button>

          {showNotifications && (
            <Notifications
              onClose={() => setShowNotifications(false)}
              onMarkAllRead={handleMarkAllRead}
              onSettings={handleSettings}
            />
          )}
        </div>

        <Link
          to="/profile"
          className="w-8 h-8 cursor-pointer uppercase rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors font-bold text-sm relative group"
        >
          {loggedInUser.charAt(0)}
        </Link>
      </div>
    </nav>
  );
}
