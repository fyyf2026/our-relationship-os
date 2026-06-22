import { NotebookPen, Plus } from "lucide-react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { useDashboardData } from "../data/dataStore.js";
import { canEditOwnedItem } from "../utils/permissionUtils.js";
import SectionCard from "./SectionCard.jsx";

export default function SharedNotes() {
  const { dashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const { profile, sharedNotes } = dashboardData;
  const noteColumns = [
    { person: profile.personAName, notes: sharedNotes.personA },
    { person: profile.personBName, notes: sharedNotes.personB },
  ];

  return (
    <SectionCard
      title="Shared Notes & To-dos"
      description="Things we want each other to remember."
      actionLabel="Add Note"
      actionIcon={Plus}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {noteColumns.map(({ person, notes }) => (
          <div key={person} className="rounded-[24px] bg-white/42 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EAF8F5] text-primary">
                <NotebookPen className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-ink">{person} posted</h3>
            </div>
            <div className="grid gap-3">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="surface-row rounded-card p-4 text-sm leading-6 text-ink"
                >
                  <p>{note.content}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="owner-badge">Owner: {note.authorName}</span>
                    {!canEditOwnedItem(currentUser, note) ? (
                      <span
                        className="view-only-badge"
                        title={`Only ${note.authorName} can edit this`}
                      >
                        View only
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
