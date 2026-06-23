import { ArrowRight, Compass } from "lucide-react";
import { calculateDaysTogether, useDashboardData } from "../data/dataStore.js";
import { getDaysUntil, getNewYorkDayDifference } from "../utils/dateUtils.js";
import { getGreetingByNewYorkTime } from "../utils/timeUtils.js";
import ActionButton from "./ActionButton.jsx";
import MemoryFilmStrip from "./MemoryFilmStrip.jsx";
import StatCard from "./StatCard.jsx";

function getNextAnniversary(importantDates) {
  const anniversaries = importantDates
    .filter((item) => /anniversary/i.test(item.title ?? ""))
    .map((item) => ({
      ...item,
      difference: getNewYorkDayDifference(item.date),
    }))
    .filter((item) => item.difference !== null && item.difference >= 0)
    .sort((a, b) => a.difference - b.difference);

  const next = anniversaries[0] ?? importantDates[0];
  return next?.date ? getDaysUntil(next.date) : "Date not set";
}

export default function HeroSection() {
  const { dashboardData } = useDashboardData();
  const { profile, importantDates, memoryPhotos, footprints, wishes } = dashboardData;
  const daysTogether = calculateDaysTogether(profile.relationshipStartDate);
  const partnerNames = `${profile.personAName} & ${profile.personBName}`;
  const greeting = getGreetingByNewYorkTime();
  const heroStats = [
    { label: "Days Together", value: String(daysTogether) },
    { label: "Next Anniversary", value: getNextAnniversary(importantDates) },
    { label: "Last Date", value: profile.lastDateLabel || "Not recorded" },
  ];
  const snapshotStats = [
    { label: "Memories Saved", value: memoryPhotos.length },
    { label: "Cities Visited", value: footprints.length },
    { label: "Shared Dreams", value: wishes.sharedDreams.length },
    { label: "Important Dates", value: importantDates.length },
  ];

  return (
    <section
      id="top"
      className="grid w-full min-w-0 gap-6 rounded-[34px] border border-white/80 bg-white/58 p-5 shadow-soft backdrop-blur-xl sm:p-7 lg:p-8"
    >
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
        <div className="flex min-w-0 flex-col justify-between gap-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/76 px-3 py-2 text-xs font-semibold text-accent shadow-sm">
              <Compass className="h-4 w-4" />
              Private relationship operating system
            </div>
            <h1 className="max-w-3xl break-words text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {greeting},
              <span className="block">{partnerNames}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              {daysTogether} days together and still choosing each other.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[30px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted">
                Relationship Snapshot
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                Real moments, not scores.
              </h2>
            </div>
            <div className="rounded-2xl bg-[#F5E3E7] p-3 text-[#C89AA4]">
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {snapshotStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/80 bg-white/68 p-4"
              >
                <p className="text-3xl font-semibold text-ink">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <ActionButton icon={ArrowRight} variant="ghost" className="mt-4 px-0">
            Review shared life
          </ActionButton>
        </div>
      </div>

      <MemoryFilmStrip />
    </section>
  );
}
