import { Plus, Sparkles } from "lucide-react";
import { useDashboardData } from "../data/dataStore.js";
import SectionCard from "./SectionCard.jsx";

const toneStyles = {
  sage: "bg-[#EDF5FF] text-[#2F4F6F]",
  clay: "bg-[#F5E3E7] text-[#8E6D78]",
  accent: "bg-primary/10 text-primary",
};

export default function FutureVision() {
  const { dashboardData } = useDashboardData();

  return (
    <SectionCard
      id="future"
      title="Future Vision"
      description="Dreams, plans, and little promises for the life we are building."
      actionLabel="Add Dream"
      actionIcon={Plus}
      className="scroll-mt-28"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {dashboardData.futureVision.map((group) => {
          const total = Math.max(Number(group.total) || group.items.length || 1, 1);
          const completed = Math.min(Number(group.completed) || 0, total);
          const progress = Math.round((completed / total) * 100);

          return (
            <article key={group.id} className="surface-row rounded-card p-4">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    toneStyles[group.tone]
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-ink">{group.title}</h3>
              </div>

              <ul className="space-y-2 text-sm leading-6 text-muted">
                {group.items.map((item) => (
                  <li key={item.id} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
                  <span>
                    {completed} / {total} dreams completed
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-track h-2">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
