import { ArrowRight, HeartPulse } from "lucide-react";
import { calculateDaysTogether, useDashboardData } from "../data/dataStore.js";
import { getDaysUntil } from "../utils/dateUtils.js";
import { getGreetingByNewYorkTime } from "../utils/timeUtils.js";
import ActionButton from "./ActionButton.jsx";
import MemoryFilmStrip from "./MemoryFilmStrip.jsx";
import StatCard from "./StatCard.jsx";

export default function HeroSection() {
  const { dashboardData } = useDashboardData();
  const { profile, importantDates } = dashboardData;
  const daysTogether = calculateDaysTogether(profile.relationshipStartDate);
  const partnerNames = `${profile.personAName} & ${profile.personBName}`;
  const nextDate = importantDates[0]?.date
    ? getDaysUntil(importantDates[0].date)
    : "Date not set";
  const heroStats = [
    { label: "Days Together", value: String(daysTogether) },
    { label: "Next Anniversary", value: nextDate },
    { label: "Last Date", value: profile.lastDateLabel || "Not recorded" },
  ];
  const heroTitle = `${getGreetingByNewYorkTime()}, ${partnerNames}`;
  const heroSubtitle =
    profile.heroSubtitle
      ?.replaceAll("{days}", String(daysTogether))
      .replaceAll("{names}", partnerNames) || "";
  const temperature = Math.min(
    100,
    Math.max(0, Number(profile.relationshipTemperature) || 0),
  );

  return (
    <section
      id="top"
      className="grid w-full min-w-0 gap-6 rounded-[34px] border border-white/80 bg-white/52 p-5 shadow-soft backdrop-blur-xl sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:p-8"
    >
      <div className="flex min-h-[390px] min-w-0 flex-col justify-between gap-8">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/70 px-3 py-2 text-xs font-semibold text-accent shadow-sm">
            <HeartPulse className="h-4 w-4" />
            Private relationship dashboard
          </div>
          <h1 className="max-w-3xl break-words text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {heroSubtitle}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <MemoryFilmStrip />
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="surface-card rounded-[30px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted">
                Relationship Temperature
              </p>
              <p className="mt-2 text-5xl font-semibold text-ink">{temperature}</p>
              <p className="mt-1 text-sm text-muted">out of 100</p>
            </div>
            <div className="rounded-2xl bg-[#EAF8F5] p-3 text-primary">
              <HeartPulse className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5">
            <div className="progress-track h-2.5">
              <div
                className="progress-fill"
                style={{ width: `${temperature}%` }}
              />
            </div>
            <p className="mt-4 text-base font-medium text-ink">
              {profile.temperatureStatus}
            </p>
          </div>

          <ActionButton icon={ArrowRight} variant="ghost" className="mt-4 px-0">
            Review today&apos;s snapshot
          </ActionButton>
        </div>
      </div>

    </section>
  );
}
