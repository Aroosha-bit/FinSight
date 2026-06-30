import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupIllustration from "../assets/logIn.svg";
import logo from "../assets/logo.svg";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
const Register = () => {
  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    const copyRegisterInfo = { ...registerInfo };
    copyRegisterInfo[name] = value;
    setRegisterInfo(copyRegisterInfo);
  };
  console.log("RegisterInfo", registerInfo);
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password } = registerInfo;
    if (!name || !email || !password) {
      return handleError("All fields are required.");
    }
    try {
      const url = "http://localhost:5000/api/auth/register";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerInfo),
      });
      const result = await response.json();
      const { success, message, error } = result;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (error) {
        const details = error?.details[0].message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
      console.log(result);
    } catch (error) {
      handleError(error);
    }
  };
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src={signupIllustration}
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
            Join FinSight Today
          </h1>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Name</label>
              <input
                onChange={handleChange}
                type="text"
                name="name"
                value={registerInfo.name}
                placeholder="Jon Snow"
                className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email Address
              </label>
              <input
                onChange={handleChange}
                type="email"
                name="email"
                value={registerInfo.email}
                placeholder="abc@gmail.com"
                className="w-full border border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={registerInfo.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full cursor-pointre bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              CREATE ACCOUNT
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>

            {/* Footer Text */}
            <p className="text-center text-sm text-gray-500">
              🔒 Your data is encrypted and never shared without your consent.
            </p>
          </form>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default Register;
