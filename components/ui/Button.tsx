"use client";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
};

export default function Button({
  label,
  onClick,
  variant = "primary",
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center rounded-l px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out";

  const variants = {
    primary:
      "bg-white text-black hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,255,255,0.25)] active:translate-y-0 active:scale-95",

    outline:
      "border border-white text-white hover:bg-white hover:text-black hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95",

    ghost:
      "text-white hover:opacity-80 hover:-translate-y-0.5 active:scale-95",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]}`}
    >
      {label}
    </button>
  );
}
