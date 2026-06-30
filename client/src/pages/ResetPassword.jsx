import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import logIn from "../assets/logIn.svg";
import logo from "../assets/logo.svg";
import { ToastContainer } from "react-toastify";
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return handleError("All fields are required");
    }

    if (password.length < 8) {
      return handleError("Password must be at least 8 characters");
    }

    if (password !== confirmPassword) {
      return handleError("Passwords do not match");
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        handleSuccess(result.message || "Password reset successful");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        handleError(result.message || "Something went wrong");
      }
    } catch (error) {
      handleError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src={logIn}
            alt="Finance Illustration"
            className="max-w-full h-auto"
          />
        </div>
        <div className="w-full max-w-md bg-white">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="FinSight"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-semibold text-center mb-6">
            Reset Password
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col items-center justify-center gap-[10px]">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Back
              </Link>

              <p className="text-center text-sm text-gray-500">
                🔒 Your data is encrypted and never shared without your consent.
              </p>
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
