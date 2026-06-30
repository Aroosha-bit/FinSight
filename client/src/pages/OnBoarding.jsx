import React from "react";
import logo from "../assets/logo.svg";
import { Link } from "react-router-dom";
export const OnBoarding = () => {
  return (
    <div className="pt-40 container mx-auto max-w-6xl flex flex-col items-center gap-[18px] justify-center">
      <img src={logo} alt="" className="w-[224px] h-[224px]" />
      <div className="text-[#111827] text-[36px] font-[600] text-center">
        Start Tracking Smarter. Take control of your money with AI-powered
        insights.
      </div>
      <div className="font-400 text-[#6B7280] text-[24px] text-center">
        Track expenses, set budgets, and get real-time financial advice — all in
        one place.
      </div>
      <div className="flex gap-[10px]">
        <Link
          to="/register"
          className="text-white cursor-pointer font-[600] text-[20px] rounded-full bg-blue-600 hover:bg-blue-700 px-[16px] py-[6px] "
        >
          SIGN UP
        </Link>
        <Link
          to="/login"
          className="text-[#2563EB] font-[600] cursor-pointer text-[20px] rounded-full border border-[#2563EB] px-[16px] py-[6px]"
        >
          LOG IN
        </Link>
      </div>
    </div>
  );
};
