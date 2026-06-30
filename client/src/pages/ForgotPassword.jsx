import React, { useState } from "react";
import { Link } from "react-router-dom";
import logIn from "../assets/logIn.svg";
import logo from "../assets/logo.svg";
import { handleError, handleSuccess } from "../utils";
import { ToastContainer } from "react-toastify";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      return handleError("Email is required");
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      const { success, message } = result;

      if (success) {
        handleSuccess(message);
        setEmail("");
      } else {
        handleError(message);
      }
    } catch (error) {
      handleError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src={logIn}
            alt="Finance Illustration"
            className="max-w-full h-auto"
          />
        </div>

        <div className="w-full max-w-md">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="FinSight"
              className="w-20 h-20 object-contain"
            />
          </div>

          <h1 className="text-center text-5xl font-medium text-gray-900 mb-10">
            Forgot Password
          </h1>

          <form
            onSubmit={handleForgotPassword}
            className="flex flex-col space-y-5"
          >
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="abc@gmail.com"
                className="w-full border border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col items-center justify-center gap-[10px]">
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Submit"}
              </button>

              <Link
                to="/logIn"
                className="text-blue-600 hover:underline"
              >
                Back
              </Link>

              <p className="text-center text-sm text-gray-500">
                🔒 Your data is encrypted and never shared without your
                consent.
              </p>
            </div>
          </form>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;