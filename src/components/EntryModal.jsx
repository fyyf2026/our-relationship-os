import ActionButton from "./ActionButton.jsx";

export function ModalField({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-muted">{label}</span>
      {children}
    </label>
  );
}

export function ModalInput({ value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      data-lpignore="true"
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary/55 focus:bg-white focus:ring-4 focus:ring-primary/10"
    />
  );
}

export function ModalTextArea({ value, onChange, placeholder = "", rows = 4 }) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      autoComplete="off"
      data-lpignore="true"
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-muted/70 focus:border-primary/55 focus:bg-white focus:ring-4 focus:ring-primary/10"
    />
  );
}

export function ModalSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary/55 focus:bg-white focus:ring-4 focus:ring-primary/10"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function EntryModal({
  title,
  description,
  children,
  onCancel,
  onSubmit,
  submitLabel = "Save",
}) {
  return (
    <div className="identity-modal-backdrop">
      <div className="identity-modal">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          ) : null}
        </div>

        <div className="grid gap-4">{children}</div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ActionButton onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={onSubmit}
            className="w-full sm:w-auto"
          >
            {submitLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
