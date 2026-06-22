export default function ActionButton({
  children,
  icon: Icon,
  variant = "secondary",
  className = "",
  ...buttonProps
}) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "ghost"
        ? "btn-ghost"
        : "btn-secondary";

  return (
    <button type="button" className={`${variantClass} ${className}`} {...buttonProps}>
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
    </button>
  );
}
