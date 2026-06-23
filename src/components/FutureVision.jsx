import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { createId, useDashboardData } from "../data/dataStore.js";
import EntryModal, {
  ModalField,
  ModalInput,
  ModalSelect,
} from "./EntryModal.jsx";
import SectionCard from "./SectionCard.jsx";

const toneStyles = {
  sage: "bg-[#EDF5FF] text-[#2F4F6F]",
  clay: "bg-[#F5E3E7] text-[#8E6D78]",
  accent: "bg-primary/10 text-primary",
};

export default function FutureVision() {
  const { dashboardData, setDashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    category: dashboardData.futureVision[0]?.title ?? "Travel Dreams",
    title: "",
    status: "Planned",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveDream = () => {
    if (!currentUser || !form.title.trim()) return;

    setDashboardData((data) => {
      const groupIndex = data.futureVision.findIndex(
        (group) => group.title === form.category,
      );
      const targetIndex = groupIndex >= 0 ? groupIndex : 0;
      data.futureVision[targetIndex].items.push({
        id: createId("future-item"),
        text: form.title.trim(),
        status: form.status,
        visibility: "shared",
        lastEditedBy: currentUser.name,
      });
      data.futureVision[targetIndex].total = Math.max(
        Number(data.futureVision[targetIndex].total) || 0,
        data.futureVision[targetIndex].items.length,
      );
      return data;
    });
    setForm({
      category: dashboardData.futureVision[0]?.title ?? "Travel Dreams",
      title: "",
      status: "Planned",
    });
    setIsAdding(false);
  };

  return (
    <SectionCard
      id="future"
      title="Future Vision"
      description="Dreams, plans, and little promises for the life we are building."
      actionLabel="Add Dream"
      actionIcon={Plus}
      actionOnClick={() => setIsAdding(true)}
      className="scroll-mt-28"
    >
      {isAdding ? (
        <EntryModal
          title="Add Dream"
          description={`Adding as ${currentUser?.name ?? "current user"}.`}
          submitLabel="Save Dream"
          onCancel={() => setIsAdding(false)}
          onSubmit={saveDream}
        >
          <ModalField label="Category">
            <ModalSelect
              value={form.category}
              options={dashboardData.futureVision.map((group) => group.title)}
              onChange={(value) => updateField("category", value)}
            />
          </ModalField>
          <ModalField label="Title">
            <ModalInput value={form.title} onChange={(value) => updateField("title", value)} />
          </ModalField>
          <ModalField label="Status">
            <ModalSelect
              value={form.status}
              options={["Planned", "In Progress", "Completed"]}
              onChange={(value) => updateField("status", value)}
            />
          </ModalField>
        </EntryModal>
      ) : null}

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
