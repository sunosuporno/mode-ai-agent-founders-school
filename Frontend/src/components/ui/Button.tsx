interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        ${
          variant === "primary"
            ? "bg-[#FFD700] text-black hover:bg-[#FFE55C]"
            : "text-gray-400 hover:text-white"
        } 
        transition-colors font-medium rounded-full ${className}
      `}
    >
      {children}
    </button>
  );
}
