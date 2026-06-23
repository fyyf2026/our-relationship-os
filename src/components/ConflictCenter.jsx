import { Brain, Eye, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { createId, useDashboardData } from "../data/dataStore.js";
import ActionButton from "./ActionButton.jsx";
import EntryModal, {
  ModalField,
  ModalInput,
  ModalSelect,
} from "./EntryModal.jsx";
import SectionCard from "./SectionCard.jsx";
import StatusTag from "./StatusTag.jsx";

export default function ConflictCenter() {
  const { dashboardData, setDashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    date: "",
    topic: "",
    duration: "",
    status: "Resolved",
    resolution: "",
    rewardPenalty: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveConflict = () => {
    if (!currentUser || !form.topic.trim()) return;

    setDashboardData((data) => {
      data.conflictEntries.unshift({
        id: createId("conflict"),
        date: form.date,
        topic: form.topic.trim(),
        duration: form.duration.trim(),
        status: form.status,
        resolution: form.resolution.trim(),
        rewardPenalty: form.rewardPenalty.trim(),
        visibility: "shared",
        lastEditedBy: currentUser.name,
      });
      return data;
    });
    setForm({
      date: "",
      topic: "",
      duration: "",
      status: "Resolved",
      resolution: "",
      rewardPenalty: "",
    });
    setIsAdding(false);
  };

  return (
    <SectionCard
      id="conflict-center"
      title="Conflict Center"
      description="A safe place to understand, repair, and grow after disagreements."
      actionLabel="Start Reflection"
      actionIcon={Plus}
      actionOnClick={() => setIsAdding(true)}
      actionVariant="primary"
      className="scroll-mt-28"
    >
      {isAdding ? (
        <EntryModal
          title="Start Reflection"
          description={`Adding as ${currentUser?.name ?? "current user"}.`}
          submitLabel="Save Reflection"
          onCancel={() => setIsAdding(false)}
          onSubmit={saveConflict}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <ModalField label="Date">
              <ModalInput value={form.date} onChange={(value) => updateField("date", value)} />
            </ModalField>
            <ModalField label="Topic">
              <ModalInput value={form.topic} onChange={(value) => updateField("topic", value)} />
            </ModalField>
            <ModalField label="Duration">
              <ModalInput
                value={form.duration}
                onChange={(value) => updateField("duration", value)}
              />
            </ModalField>
          </div>
          <ModalField label="Status">
            <ModalSelect
              value={form.status}
              options={["Resolved", "Pending"]}
              onChange={(value) => updateField("status", value)}
            />
          </ModalField>
          <ModalField label="Resolution">
            <ModalInput
              value={form.resolution}
              onChange={(value) => updateField("resolution", value)}
            />
          </ModalField>
          <ModalField label="Reward / Penalty">
            <ModalInput
              value={form.rewardPenalty}
              onChange={(value) => updateField("rewardPenalty", value)}
            />
          </ModalField>
        </EntryModal>
      ) : null}

      <div className="overflow-x-auto rounded-[24px] border border-stone-900/5 bg-white/52">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="border-b border-stone-900/5 bg-[#FBF8F4] text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Resolution</th>
              <th className="px-4 py-3">Reward / Penalty</th>
              <th className="px-4 py-3">Last Edited</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-900/5">
            {dashboardData.conflictEntries.map((entry) => (
              <tr key={entry.id} className="transition hover:bg-white/70">
                <td className="px-4 py-4 font-medium text-ink">{entry.date}</td>
                <td className="px-4 py-4 text-ink">{entry.topic}</td>
                <td className="px-4 py-4 text-muted">{entry.duration}</td>
                <td className="px-4 py-4">
                  <StatusTag status={entry.status} />
                </td>
                <td className="px-4 py-4 text-muted">{entry.resolution}</td>
                <td className="px-4 py-4 text-muted">{entry.rewardPenalty}</td>
                <td className="px-4 py-4 text-muted">
                  Last edited by {entry.lastEditedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 rounded-[26px] border border-[#DCEBFA] bg-gradient-to-br from-white via-[#EDF5FF] to-[#F5E3E7] p-5 shadow-insetSoft md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/78 text-primary shadow-sm">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">AI Mediator</h3>
            <span className="rounded-full border border-white/80 bg-white/70 px-2 py-1 text-xs font-semibold text-accent">
              Gentle analysis
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Tell both sides of the story. I&apos;ll help summarize emotions,
            identify misunderstandings, and suggest a fair repair plan.
          </p>
        </div>
        <ActionButton icon={MessageCircle} variant="primary" className="w-full md:w-auto">
          Open AI Mediator
        </ActionButton>
      </div>
    </SectionCard>
  );
}
