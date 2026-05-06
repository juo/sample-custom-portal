import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "muted";

const BASE =
  "rounded-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all duration-[400ms] ease-in-out";

const VARIANTS: Record<Variant, string> = {
  primary:
    "cursor-pointer border border-[#C7C7C7] bg-white text-black hover:bg-black hover:text-white",
  muted: "cursor-not-allowed bg-gray-100 text-gray-400",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button type="button" {...props} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </button>
  );
}
