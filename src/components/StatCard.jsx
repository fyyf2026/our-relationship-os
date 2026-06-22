export default function StatCard({ label, value }) {
  return (
    <div className="surface-row rounded-card px-4 py-3">
      <p className="text-xs font-medium uppercase text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
