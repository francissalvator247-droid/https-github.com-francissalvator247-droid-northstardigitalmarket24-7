import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function NorthstarEmblem({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="facet-top"
          x1="50"
          y1="4"
          x2="50"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient
          id="facet-right"
          x1="90"
          y1="27"
          x2="50"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient
          id="facet-bottom"
          x1="50"
          y1="96"
          x2="50"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Center dark core */}
      <polygon points="50,28 70,39 70,61 50,72 30,61 30,39" fill="#081028" />

      {/* 6 Faceted outer crystal wings */}
      <polygon points="50,4 50,28 30,39 10,27" fill="#38bdf8" />
      <polygon points="50,4 90,27 70,39 50,28" fill="#60a5fa" />
      <polygon points="90,27 90,73 70,61 70,39" fill="#3b82f6" />
      <polygon points="90,73 50,96 50,72 70,61" fill="#1d4ed8" />
      <polygon points="50,96 10,73 30,61 50,72" fill="#2563eb" />
      <polygon points="10,73 10,27 30,39 30,61" fill="#0284c7" />

      {/* Internal faceted crystal lines */}
      <line x1="50" y1="4" x2="50" y2="28" stroke="#bae6fd" strokeWidth="1.5" strokeOpacity="0.8" />
      <line
        x1="90"
        y1="27"
        x2="70"
        y2="39"
        stroke="#bfdbfe"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <line
        x1="90"
        y1="73"
        x2="70"
        y2="61"
        stroke="#93c5fd"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <line
        x1="50"
        y1="96"
        x2="50"
        y2="72"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <line
        x1="10"
        y1="73"
        x2="30"
        y2="61"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <line
        x1="10"
        y1="27"
        x2="30"
        y2="39"
        stroke="#7dd3fc"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />

      {/* Center inner star spark */}
      <polygon
        points="50,38 58,44 58,56 50,62 42,56 42,44"
        fill="#040b19"
        stroke="#38bdf8"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function Logo({
  size = 40,
  withText = true,
  animated = false,
  className = "",
}: {
  size?: number;
  withText?: boolean;
  animated?: boolean;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link to="/" className={`inline-flex items-center gap-2 group select-none ${className}`}>
      <div
        className={`relative flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] ${
          animated ? "animate-float" : ""
        }`}
        style={{
          height: size,
          width: withText ? Math.round(size * 2.8) : size,
        }}
      >
        {!imgFailed ? (
          <img
            src={withText ? "/northstar-brand.png" : "/emblem.png"}
            alt="Northstar Digital Markets logo"
            className="h-full w-full object-contain object-left"
            loading="eager"
            onError={() => setImgFailed(true)}
          />
        ) : withText ? (
          <div className="flex items-center gap-2.5 h-full">
            <NorthstarEmblem size={size * 0.85} />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-extrabold tracking-wider text-white text-base">NORTHSTAR</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-[1.5px] w-3 bg-blue-500 inline-block" />
                <span className="text-[9px] font-semibold tracking-widest text-slate-300 uppercase">
                  DIGITAL MARKETS
                </span>
                <span className="h-[1.5px] w-3 bg-blue-500 inline-block" />
              </div>
            </div>
          </div>
        ) : (
          <NorthstarEmblem size={size} />
        )}
      </div>
      <span className="sr-only">Northstar Digital Markets</span>
    </Link>
  );
}
