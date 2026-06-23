import { CalendarDays, Eye, Plus } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { createId, useDashboardData } from "../data/dataStore.js";
import { getDaysUntil } from "../utils/dateUtils.js";
import ActionButton from "./ActionButton.jsx";
import EntryModal, {
  ModalField,
  ModalInput,
  ModalSelect,
} from "./EntryModal.jsx";
import SectionCard from "./SectionCard.jsx";
import StatusTag from "./StatusTag.jsx";

const statusOptions = ["Upcoming", "Pending", "Completed"];

export default function ImportantDates() {
  const { dashboardData, setDashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    description: "",
    status: "Upcoming",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveDate = () => {
    if (!currentUser || !form.title.trim()) return;

    setDashboardData((data) => {
      data.importantDates.push({
        id: createId("date"),
        title: form.title.trim(),
        date: form.date,
        description: form.description.trim(),
        status: form.status,
        visibility: "shared",
        createdBy: currentUser.name,
        lastEditedBy: currentUser.name,
      });
      return data;
    });
    setForm({ title: "", date: "", description: "", status: "Upcoming" });
    setIsAdding(false);
  };

  return (
    <SectionCard
      id="memories"
      title="Important Dates"
      description="A shared space for anniversaries, dates, trips, and meaningful reminders."
      actionLabel="Add Date"
      actionIcon={Plus}
      actionOnClick={() => setIsAdding(true)}
      className="scroll-mt-28"
    >
      {isAdding ? (
        <EntryModal
          title="Add Date"
          description={`Adding as ${currentUser?.name ?? "current user"}.`}
          submitLabel="Save Date"
          onCancel={() => setIsAdding(false)}
          onSubmit={saveDate}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label="Title">
              <ModalInput value={form.title} onChange={(value) => updateField("title", value)} />
            </ModalField>
            <ModalField label="Date">
              <ModalInput
                type="date"
                value={form.date}
                onChange={(value) => updateField("date", value)}
              />
            </ModalField>
          </div>
          <ModalField label="Description">
            <ModalInput
              value={form.description}
              onChange={(value) => updateField("description", value)}
            />
          </ModalField>
          <ModalField label="Status">
            <ModalSelect
              value={form.status}
              options={statusOptions}
              onChange={(value) => updateField("status", value)}
            />
          </ModalField>
        </EntryModal>
      ) : null}

      <div className="grid gap-3">
        {dashboardData.importantDates.map((date) => (
          <article
            key={date.id}
            className="surface-row grid gap-4 rounded-card p-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF5FF] text-primary">
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
