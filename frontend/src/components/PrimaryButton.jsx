import React from "react";

export default function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] transition hover:bg-[#2563eb] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
