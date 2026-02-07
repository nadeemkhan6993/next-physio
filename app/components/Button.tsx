export type ButtonProps = Readonly<{
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}>;

export default function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";

  const variantStyles= {
    primary:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    secondary:
      "bg-zinc-700 text-white hover:bg-zinc-800 focus:ring-zinc-600",
    danger:
      "bg-red-700 text-white hover:bg-red-800 focus:ring-red-600",
    outline:
      "border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`
        ${baseStyles} ${variantStyles[variant]} ${
        disabled ? disabledStyles : ""
        } ${widthStyles} ${className}`}
    >
      {children}
    </button>
  );
}
