import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { createId, useDashboardData } from "../data/dataStore.js";
import EntryModal, {
  ModalField,
  ModalTextArea,
} from "./EntryModal.jsx";
import SectionCard from "./SectionCard.jsx";

export default function GratitudeWall() {
  const { dashboardData, setDashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  const saveGratitude = () => {
    if (!currentUser || !message.trim()) return;

    setDashboardData((data) => {
      data.gratitudeItems.unshift({
        id: createId("gratitude"),
        kind: "gratitude",
        ownerId: currentUser.id,
        authorName: currentUser.name,
        message: message.trim(),
        visibility: "shared",
        locked: true,
      });
      return data;
    });
    setMessage("");
    setIsAdding(false);
  };

  return (
    <SectionCard
      title="Gratitude Wall"
      description="Small things we don't want to forget."
      actionLabel="Add Gratitude"
      actionIcon={Plus}
      actionOnClick={() => setIsAdding(true)}
    >
      {isAdding ? (
        <EntryModal
          title="Add Gratitude"
          description={`Posting as ${currentUser?.name ?? "current user"}.`}
          submitLabel="Save Gratitude"
          onCancel={() => setIsAdding(false)}
          onSubmit={saveGratitude}
        >
          <ModalField label="Message">
            <ModalTextArea
              value={message}
              onChange={setMessage}
              placeholder="What do you want to thank them for?"
            />
          </ModalField>
        </EntryModal>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        {dashboardData.gratitudeItems.map((item) => (
          <article
            key={item.id}
            className="surface-row rounded-card p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-ink">{item.authorName}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5E3E7] text-accent">
                <Heart className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">{item.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="owner-badge">Owner: {item.authorName}</span>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
