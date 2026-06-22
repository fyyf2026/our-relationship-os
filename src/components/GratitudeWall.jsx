import { Heart, Plus } from "lucide-react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { useDashboardData } from "../data/dataStore.js";
import { canEditOwnedItem } from "../utils/permissionUtils.js";
import SectionCard from "./SectionCard.jsx";

export default function GratitudeWall() {
  const { dashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();

  return (
    <SectionCard
      title="Gratitude Wall"
      description="Small things we don't want to forget."
      actionLabel="Add Gratitude"
      actionIcon={Plus}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {dashboardData.gratitudeItems.map((item) => (
          <article
            key={item.id}
            className="surface-row rounded-card p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-ink">{item.authorName}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF8F5] text-primary">
                <Heart className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">{item.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="owner-badge">Owner: {item.authorName}</span>
              {!canEditOwnedItem(currentUser, item) ? (
                <span
                  className="view-only-badge"
                  title={`Only ${item.authorName} can edit this`}
                >
                  View only
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
