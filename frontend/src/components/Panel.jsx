import React from "react";

export default function Panel({
  index,
  title,
  subtitle,
  children,
  className = ""
}) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[#141414] p-7 shadow-[0_20px_40px_rgba(0,0,0,0.45)] ${className}`}
    >
      {(title || index) && (
        <div className="flex items-baseline gap-3">
          {index && (
            <span className="text-2xl font-semibold text-white/20">
              {index}
            </span>
          )}
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
        </div>
      )}
      {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
