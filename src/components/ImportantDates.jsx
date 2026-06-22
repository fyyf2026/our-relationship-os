import { CalendarDays, Eye, Plus } from "lucide-react";
import { useDashboardData } from "../data/dataStore.js";
import { getDaysUntil } from "../utils/dateUtils.js";
import ActionButton from "./ActionButton.jsx";
import SectionCard from "./SectionCard.jsx";
import StatusTag from "./StatusTag.jsx";

export default function ImportantDates() {
  const { dashboardData } = useDashboardData();

  return (
    <SectionCard
      id="memories"
      title="Important Dates"
      description="A shared space for anniversaries, dates, trips, and meaningful reminders."
      actionLabel="Add Date"
      actionIcon={Plus}
      className="scroll-mt-28"
    >
      <div className="grid gap-3">
        {dashboardData.importantDates.map((date) => (
          <article
            key={date.id}
            className="surface-row grid gap-4 rounded-card p-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF8F5] text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-ink">{date.title}</h3>
              <p className="mt-1 text-sm text-muted">{date.date || "No date set"}</p>
              {date.description ? (
                <p className="mt-1 text-sm leading-5 text-muted/85">
                  {date.description}
                </p>
              ) : null}
              <p className="mt-2 text-xs font-semibold text-muted/80">
                Created by {date.createdBy} · Last edited by {date.lastEditedBy}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag status={date.status} />
              <span className="text-sm font-medium text-muted">
                {getDaysUntil(date.date)}
              </span>
            </div>
            <ActionButton icon={Eye} className="w-full sm:w-auto">
              View
            </ActionButton>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
