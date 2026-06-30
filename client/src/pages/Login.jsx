import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logIn from "../assets/logIn.svg";
import logo from "../assets/logo.svg";
import { handleError, handleSuccess } from "../utils";

const LogIn = () => {
  const [loginInfo, setLogInInfo] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    const copyLogInInfo = { ...loginInfo };
    copyLogInInfo[name] = value;
    setLogInInfo(copyLogInInfo);
  };
  console.log("RegisterInfo", loginInfo);

  const handleLogIn = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("All fields are required.");
    }
    try {
      const url = "http://localhost:5000/api/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });
      const result = await response.json();
      const { success, message, jwtToken, name, error, email } = result;
      if (success) {
        handleSuccess(message);
        localStorage.setItem('token' , jwtToken)
        localStorage.setItem('loggedInUser' , name)
        localStorage.setItem('loggedInEmail' , email)
        setTimeout(() => {
          navigate("/dashboard");
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

          {/* Heading */}
          <h1 className="text-center text-5xl font-medium text-gray-900 mb-10">
            Welcome back to FinSight
          </h1>

          <form onSubmit={handleLogIn} className="flex flex-col space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={loginInfo.email}
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
                onChange={handleChange}
                value={loginInfo.password}
                placeholder="••••••••"
                className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Link
              to="/forgot-password"
              className="text-[#111827] cursor-pointer hover:text-blue-500 text-[12px] item-end "
            >
              Forgot Password
            </Link>

            <button
              type="submit"
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              LOGIN
            </button>

            <p className="text-center text-gray-600 text-sm">
              New to FinSight?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                SignUp
              </Link>
            </p>

            <p className="text-center text-sm text-gray-500">
              🔒 Your data is encrypted and never shared without your consent.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
