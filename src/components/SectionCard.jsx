import ActionButton from "./ActionButton.jsx";

export default function SectionCard({
  id,
  title,
  description,
  actionLabel,
  actionIcon,
  actionOnClick,
  children,
  className = "",
  actionVariant = "secondary",
}) {
  return (
    <section
      id={id}
      className={`surface-card w-full min-w-0 rounded-panel p-5 sm:p-6 ${className}`}
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actionLabel ? (
          <ActionButton
            icon={actionIcon}
            variant={actionVariant}
            onClick={actionOnClick}
            className="w-full sm:w-auto"
          >
            {actionLabel}
          </ActionButton>
        ) : null}
      </div>
      {children}
    </section>
  );
}
