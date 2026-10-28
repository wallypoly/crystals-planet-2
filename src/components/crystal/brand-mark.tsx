"use client";

import { useId } from "react";

export function BrandMark({ className = "" }: { className?: string }) {
  const id = useId().replace(/[:]/g, "");
  const maskId = `moon-mask-${id}`;
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <mask id={maskId}>
          <rect width="48" height="48" fill="white" />
          <circle cx="31.5" cy="19" r="10.5" fill="black" />
        </mask>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* crescent moon */}
      <circle cx="23" cy="25" r="12" fill="currentColor" mask={`url(#${maskId})`} />
      {/* leaf sprig */}
      <path
        d="M27.5 31.5c.7-4.2 2.7-7 5.8-8.6-.4 3.9-2.3 6.7-5.8 8.6Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* sparkles */}
      <path
        d="M35 30.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="15.5" cy="15" r="0.9" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function BrandLockup() {
  return (
    <span className="flex flex-col items-center leading-none select-none">
      <span
        className="atlas-brand-name text-[1.4rem] tracking-[0.22em] uppercase font-semibold"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        UNIQorn
      </span>
      <span className="atlas-brand-sub mt-[4px] text-[0.44rem] tracking-[0.42em] uppercase text-[#1e3a5f]">
        SOUL WELLNESS
      </span>
    </span>
  );
}
