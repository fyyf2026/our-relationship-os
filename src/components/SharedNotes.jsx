import { NotebookPen, Plus } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { createId, useDashboardData } from "../data/dataStore.js";
import EntryModal, {
  ModalField,
  ModalTextArea,
} from "./EntryModal.jsx";
import SectionCard from "./SectionCard.jsx";

export default function SharedNotes() {
  const { dashboardData, setDashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const { profile, sharedNotes } = dashboardData;
  const noteColumns = [
    { person: profile.personAName, notes: sharedNotes.personA },
    { person: profile.personBName, notes: sharedNotes.personB },
  ];

  const saveNote = () => {
    if (!currentUser || !content.trim()) return;

    setDashboardData((data) => {
      const personKey = currentUser.role;
      data.sharedNotes[personKey].push({
        id: createId(personKey === "personA" ? "note-a" : "note-b"),
        kind: "personal_note",
        ownerId: currentUser.id,
        authorName: currentUser.name,
        content: content.trim(),
        visibility: "visible_to_partner",
      });
      return data;
    });
    setContent("");
    setIsAdding(false);
  };

  return (
    <SectionCard
      title="Shared Notes & To-dos"
      description="Things we want each other to remember."
      actionLabel="Add Note"
      actionIcon={Plus}
      actionOnClick={() => setIsAdding(true)}
    >
      {isAdding ? (
        <EntryModal
          title="Add Note"
          description={`Posting as ${currentUser?.name ?? "current user"}.`}
          submitLabel="Save Note"
          onCancel={() => setIsAdding(false)}
          onSubmit={saveNote}
        >
          <ModalField label="Note content">
            <ModalTextArea
              value={content}
              onChange={setContent}
              placeholder="What should we remember?"
            />
          </ModalField>
        </EntryModal>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {noteColumns.map(({ person, notes }) => (
          <div key={person} className="rounded-[24px] bg-white/42 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EDF5FF] text-primary">
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
