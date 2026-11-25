import { ButtonHTMLAttributes } from "react";
import { useLoading } from "../context/LoadingContext";
import { cn } from "../lib/api";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

// Button that disables itself while a global `withLoading` action is running.
const LoadingButton = ({ variant = "primary", disabled, className, ...rest }: Props) => {
  const { isLoading } = useLoading();
  return <button {...rest} disabled={disabled || isLoading} className={cn("btn", `btn-${variant}`, className)} />;
};

export default LoadingButton;
