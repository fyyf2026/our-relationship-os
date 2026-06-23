import { Gift, Lock, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { createId, useDashboardData } from "../data/dataStore.js";
import { isDateUnlocked } from "../utils/dateUtils.js";
import { canEditOwnedItem } from "../utils/permissionUtils.js";
import EntryModal, {
  ModalField,
  ModalInput,
  ModalSelect,
  ModalTextArea,
} from "./EntryModal.jsx";
import SectionCard from "./SectionCard.jsx";
import StatusTag from "./StatusTag.jsx";

function WishGroup({ title, description, icon: Icon, children }) {
  return (
    <div className="rounded-[24px] border border-stone-900/6 bg-white/44 p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF5FF] text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
        </div>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function CompactWish({ title, description, tag, ownerName, footer }) {
  return (
    <article className="surface-row rounded-card p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        {tag ? <StatusTag status={tag} /> : null}
      </div>
      <p className="text-sm leading-6 text-muted">{description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {ownerName ? <span className="owner-badge">Owner: {ownerName}</span> : null}
        {footer ? <span className="owner-badge">{footer}</span> : null}
      </div>
    </article>
  );
}

export default function WishBox() {
  const { dashboardData, setDashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    wishType: "Gift Hint",
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    unlockDate: "",
    status: "Planned",
  });
  const { giftHints, secretWishes, sharedDreams } = dashboardData.wishes;
  const { users } = dashboardData;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      wishType: "Gift Hint",
      title: "",
      description: "",
      category: "",
      priority: "Medium",
      unlockDate: "",
      status: "Planned",
    });
  };

  const saveWish = () => {
    if (!currentUser || !form.title.trim()) return;

    setDashboardData((data) => {
      if (form.wishType === "Gift Hint") {
        data.wishes.giftHints.push({
          id: createId("gift"),
          wishType: "gift_hint",
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          priority: form.priority,
          visibility: "visible_to_partner",
        });
      } else if (form.wishType === "Secret Wish") {
        data.wishes.secretWishes.push({
          id: createId("secret"),
          wishType: "secret_wish",
          ownerId: currentUser.id,
          title: form.title.trim(),
          description: form.description.trim(),
          unlockDate: form.unlockDate,
          visibility: "private_until_unlock",
        });
      } else {
        data.wishes.sharedDreams.push({
          id: createId("shared"),
          wishType: "shared_dream",
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          visibility: "shared",
          lastEditedBy: currentUser.name,
        });
      }
      return data;
    });
    resetForm();
    setIsAdding(false);
  };

  return (
    <SectionCard
      id="wish-box"
      title="Wish Box"
      description="A quiet place for hints, private hopes, and shared dreams."
      actionLabel="Add Wish"
      actionIcon={Plus}
      actionOnClick={() => setIsAdding(true)}
      className="scroll-mt-28"
    >
      {isAdding ? (
        <EntryModal
          title="Add Wish"
          description={`Adding as ${currentUser?.name ?? "current user"}.`}
          submitLabel="Save Wish"
          onCancel={() => setIsAdding(false)}
          onSubmit={saveWish}
        >
          <ModalField label="Type">
            <ModalSelect
              value={form.wishType}
              options={["Gift Hint", "Secret Wish", "Shared Dream"]}
              onChange={(value) => updateField("wishType", value)}
            />
          </ModalField>
          <ModalField label="Title">
            <ModalInput value={form.title} onChange={(value) => updateField("title", value)} />
          </ModalField>
          <ModalField label="Description">
            <ModalTextArea
              value={form.description}
              onChange={(value) => updateField("description", value)}
            />
          </ModalField>

          {form.wishType === "Gift Hint" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Category">
                <ModalInput
                  value={form.category}
                  onChange={(value) => updateField("category", value)}
                />
              </ModalField>
              <ModalField label="Priority">
                <ModalSelect
                  value={form.priority}
                  options={["High", "Medium", "Low"]}
                  onChange={(value) => updateField("priority", value)}
                />
              </ModalField>
            </div>
          ) : null}

          {form.wishType === "Secret Wish" ? (
            <ModalField label="Unlock Date">
              <ModalInput
                type="date"
                value={form.unlockDate}
                onChange={(value) => updateField("unlockDate", value)}
              />
            </ModalField>
          ) : null}

          {form.wishType === "Shared Dream" ? (
            <ModalField label="Status">
              <ModalSelect
                value={form.status}
                options={["Planned", "In Progress", "Completed"]}
                onChange={(value) => updateField("status", value)}
              />
            </ModalField>
          ) : null}
        </EntryModal>
      ) : null}

      <div className="grid gap-4">
        <WishGroup
          title="Gift Hints"
          description="Little things I love, in case you ever need inspiration."
          icon={Gift}
        >
          {users.map((user) => {
            const ownedHints = giftHints
              .filter((wish) => wish.ownerId === user.id)
              .slice(0, 2);

            return (
              <div key={user.id} className="grid gap-2">
                <p className="text-xs font-semibold uppercase text-muted">
                  {user.name}&apos;s Gift Hints
                </p>
                {ownedHints.map((wish) => (
                  <CompactWish
                    key={wish.id}
                    title={wish.title}
                    description={`${wish.description} ${wish.category ? `(${wish.category})` : ""}`}
                    tag={wish.priority}
                    ownerName={wish.ownerName}
                  />
                ))}
              </div>
            );
          })}
        </WishGroup>

        <WishGroup
          title="Secret Wishes"
          description="Private wishes that will open when the time is right."
          icon={Lock}
        >
          {secretWishes.slice(0, 3).map((wish) => {
            const unlocked = isDateUnlocked(wish.unlockDate);
            const isOwner = canEditOwnedItem(currentUser, wish);
            const ownerName =
              users.find((user) => user.id === wish.ownerId)?.name ?? "Owner";
            const canReadFullContent = unlocked || isOwner;

            return (
              <CompactWish
                key={wish.id}
                title={
                  canReadFullContent
                    ? wish.title
                    : `A secret wish is locked until ${wish.unlockDate || "date not set"}`
                }
                description={
                  canReadFullContent
                    ? wish.description
                    : "Private until the unlock date."
                }
                tag={unlocked ? "Completed" : "Locked"}
                ownerName={ownerName}
              />
            );
          })}
        </WishGroup>

        <WishGroup
          title="Shared Dreams"
          description="Things we want to experience together."
          icon={Sparkles}
        >
          {sharedDreams.slice(0, 3).map((wish) => (
            <CompactWish
              key={wish.id}
              title={wish.title}
              description={wish.description}
              tag={wish.status}
              footer={`Last edited by ${wish.lastEditedBy}`}
            />
          ))}
        </WishGroup>
      </div>
    </SectionCard>
  );
}
