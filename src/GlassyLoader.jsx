import React from "react";

const GlassyLoader = ({ text = "Loading..." }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full bg-white bg-opacity-20 blur-xl animate-pulse" />
        <svg className="w-16 h-16 animate-spin" viewBox="0 0 50 50">
          <circle
            className="opacity-30"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#fff"
            strokeWidth="6"
          />
          <circle
            className=""
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="6"
            strokeDasharray="90 150"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="mt-4 text-white text-lg font-semibold drop-shadow-glass animate-pulse">{text}</span>
    </div>
  </div>
);

export default GlassyLoader;
