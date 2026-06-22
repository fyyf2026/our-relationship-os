import { Brain, Eye } from "lucide-react";
import { useDashboardData } from "../data/dataStore.js";
import ActionButton from "./ActionButton.jsx";
import SectionCard from "./SectionCard.jsx";

const clampScore = (value) => Math.min(100, Math.max(0, Number(value) || 0));

export default function AIRelationshipCoach() {
  const { dashboardData } = useDashboardData();
  const coachMetrics = [
    {
      label: "Communication",
      value: clampScore(dashboardData.aiCoach.metrics.communication),
    },
    {
      label: "Quality Time",
      value: clampScore(dashboardData.aiCoach.metrics.qualityTime),
    },
    {
      label: "Conflict Recovery",
      value: clampScore(dashboardData.aiCoach.metrics.conflictRecovery),
    },
    {
      label: "Emotional Support",
      value: clampScore(dashboardData.aiCoach.metrics.emotionalSupport),
    },
  ];

  return (
    <SectionCard
      id="settings"
      title="AI Relationship Coach"
      actionLabel="View Weekly Report"
      actionIcon={Eye}
      actionVariant="primary"
      className="bg-gradient-to-br from-white/88 via-[#EAF8F5]/84 to-[#EEF7FB]/82"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF8F5] text-primary">
        <Brain className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-ink">This week&apos;s insight:</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        {dashboardData.aiCoach.weeklyInsight}
      </p>

      <div className="mt-6 grid gap-4">
        {coachMetrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="progress-track h-2">
              <div
                className="progress-fill"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
