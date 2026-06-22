import {
  Check,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { useCurrentUser } from "../context/UserContext.jsx";
import {
  calculateDaysTogether,
  createId,
  useDashboardData,
} from "../data/dataStore.js";
import {
  canEditItem,
  getPermissionMessage,
  withLastEditedBy,
} from "../utils/permissionUtils.js";
import ActionButton from "../components/ActionButton.jsx";

const importantStatusOptions = ["Upcoming", "Pending", "Completed"];
const conflictStatusOptions = ["Resolved", "Pending"];
const giftPriorityOptions = ["High", "Medium", "Low"];
const sharedDreamStatusOptions = ["Planned", "In Progress", "Completed"];

function Field({ label, children, className = "" }) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-xs font-semibold uppercase text-muted">{label}</span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  readOnly = false,
  disabled = false,
  title,
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      disabled={disabled}
      title={title}
      autoComplete="off"
      data-lpignore="true"
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-stone-900/10 bg-white/75 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary/55 focus:bg-white focus:ring-4 focus:ring-primary/10 read-only:bg-stone-100/70 read-only:text-muted disabled:cursor-not-allowed disabled:bg-[#EEF7FB]/70 disabled:text-muted"
    />
  );
}

function TextArea({ value, onChange, rows = 3, disabled = false, title }) {
  return (
    <textarea
      value={value}
      rows={rows}
      disabled={disabled}
      title={title}
      autoComplete="off"
      data-lpignore="true"
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y rounded-2xl border border-stone-900/10 bg-white/75 px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-muted/70 focus:border-primary/55 focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-[#EEF7FB]/70 disabled:text-muted"
    />
  );
}

function SelectInput({ value, onChange, options, disabled = false, title }) {
  return (
    <select
      value={value}
      disabled={disabled}
      title={title}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-stone-900/10 bg-white/75 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary/55 focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-[#EEF7FB]/70 disabled:text-muted"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function NumberInput({ value, onChange, min = 0, max = 100, disabled = false }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-2xl border border-stone-900/10 bg-white/75 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary/55 focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-[#EEF7FB]/70 disabled:text-muted"
    />
  );
}

function ManagerSection({ id, title, description, actionLabel, onAdd, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-panel border border-white/85 bg-white/78 p-5 shadow-soft backdrop-blur-xl sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actionLabel ? (
          <ActionButton icon={Plus} onClick={onAdd} className="w-full sm:w-auto">
            {actionLabel}
          </ActionButton>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function RowCard({ children }) {
  return (
    <div className="rounded-[24px] border border-stone-900/6 bg-ivory/70 p-4">
      {children}
    </div>
  );
}

function IconButton({ label, onClick, disabled = false, title }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-900/10 bg-white/75 text-muted transition hover:border-primary/35 hover:bg-[#EAF8F5] hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export default function SettingsPage() {
  const { dashboardData, setDashboardData, resetToDefault, savedAt } =
    useDashboardData();
  const { currentUser, users } = useCurrentUser();
  const { profile } = dashboardData;
  const partnerNames = `${profile.personAName} & ${profile.personBName}`;
  const daysTogether = calculateDaysTogether(profile.relationshipStartDate);

  const updateProfile = (field, value) => {
    setDashboardData((data) => {
      data.profile[field] = value;
      return data;
    });
  };

  const updateListItem = (listName, index, field, value) => {
    setDashboardData((data) => {
      const item = data[listName][index];
      if (!canEditItem(currentUser, item)) return data;
      data[listName][index] = withLastEditedBy(
        {
          ...item,
          [field]: value,
        },
        currentUser,
      );
      return data;
    });
  };

  const removeListItem = (listName, index) => {
    setDashboardData((data) => {
      if (!canEditItem(currentUser, data[listName][index])) return data;
      data[listName].splice(index, 1);
      return data;
    });
  };

  const addImportantDate = () => {
    setDashboardData((data) => {
      if (!currentUser) return data;
      data.importantDates.push({
        id: createId("date"),
        title: "New Date",
        date: "",
        description: "",
        status: "Upcoming",
        visibility: "shared",
        createdBy: currentUser.name,
        lastEditedBy: currentUser.name,
      });
      return data;
    });
  };

  const addConflict = () => {
    setDashboardData((data) => {
      if (!currentUser) return data;
      data.conflictEntries.push({
        id: createId("conflict"),
        date: "",
        topic: "New reflection",
        duration: "",
        status: "Resolved",
        resolution: "",
        rewardPenalty: "",
        visibility: "shared",
        lastEditedBy: currentUser.name,
      });
      return data;
    });
  };

  const addGratitude = () => {
    setDashboardData((data) => {
      if (!currentUser) return data;
      data.gratitudeItems.push({
        id: createId("gratitude"),
        ownerId: currentUser.id,
        authorName: currentUser.name,
        message: "",
        visibility: "shared",
        locked: true,
      });
      return data;
    });
  };

  const addGiftHint = () => {
    setDashboardData((data) => {
      if (!currentUser) return data;
      data.wishes.giftHints.push({
        id: createId("gift"),
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        title: "New gift hint",
        description: "",
        category: "",
        priority: "Medium",
        visibility: "visible_to_partner",
      });
      return data;
    });
  };

  const addSecretWish = () => {
    setDashboardData((data) => {
      if (!currentUser) return data;
      data.wishes.secretWishes.push({
        id: createId("secret"),
        ownerId: currentUser.id,
        title: "New secret wish",
        description: "",
        unlockDate: "",
        visibility: "private_until_unlock",
      });
      return data;
    });
  };

  const addSharedDream = () => {
    setDashboardData((data) => {
      if (!currentUser) return data;
      data.wishes.sharedDreams.push({
        id: createId("shared"),
        title: "New shared dream",
        description: "",
        status: "Planned",
        visibility: "shared",
        lastEditedBy: currentUser.name,
      });
      return data;
    });
  };

  const updateWishItem = (groupName, index, field, value) => {
    setDashboardData((data) => {
      const item = data.wishes[groupName][index];
      if (!canEditItem(currentUser, item)) return data;
      data.wishes[groupName][index] = withLastEditedBy(
        {
          ...item,
          [field]: value,
        },
        currentUser,
      );
      return data;
    });
  };

  const removeWishItem = (groupName, index) => {
    setDashboardData((data) => {
      if (!canEditItem(currentUser, data.wishes[groupName][index])) return data;
      data.wishes[groupName].splice(index, 1);
      return data;
    });
  };

  const updateNote = (personKey, index, value) => {
    setDashboardData((data) => {
      const note = data.sharedNotes[personKey][index];
      if (!canEditItem(currentUser, note)) return data;
      data.sharedNotes[personKey][index].content = value;
      return data;
    });
  };

  const addNote = (personKey) => {
    setDashboardData((data) => {
      if (!currentUser || currentUser.role !== personKey) return data;
      data.sharedNotes[personKey].push({
        id: createId(personKey === "personA" ? "note-a" : "note-b"),
        ownerId: currentUser.id,
        authorName: currentUser.name,
        content: "",
        visibility: "visible_to_partner",
      });
      return data;
    });
  };

  const removeNote = (personKey, index) => {
    setDashboardData((data) => {
      if (!canEditItem(currentUser, data.sharedNotes[personKey][index])) return data;
      data.sharedNotes[personKey].splice(index, 1);
      return data;
    });
  };

  const updateFutureItem = (groupIndex, itemIndex, value) => {
    setDashboardData((data) => {
      data.futureVision[groupIndex].items[itemIndex].text = value;
      return data;
    });
  };

  const addFutureItem = (groupIndex) => {
    setDashboardData((data) => {
      data.futureVision[groupIndex].items.push({
        id: createId("future-item"),
        text: "",
      });
      return data;
    });
  };

  const removeFutureItem = (groupIndex, itemIndex) => {
    setDashboardData((data) => {
      data.futureVision[groupIndex].items.splice(itemIndex, 1);
      return data;
    });
  };

  const updateFutureMeta = (groupIndex, field, value) => {
    setDashboardData((data) => {
      data.futureVision[groupIndex][field] = value;
      return data;
    });
  };

  const updateMemoryPhoto = (index, field, value) => {
    setDashboardData((data) => {
      const photo = data.memoryPhotos[index];
      if (!canEditItem(currentUser, photo)) return data;
      data.memoryPhotos[index][field] = value;
      return data;
    });
  };

  const removeMemoryPhoto = (index) => {
    setDashboardData((data) => {
      if (!canEditItem(currentUser, data.memoryPhotos[index])) return data;
      data.memoryPhotos.splice(index, 1);
      return data;
    });
  };

  const updateCoachMetric = (field, value) => {
    setDashboardData((data) => {
      data.aiCoach.metrics[field] = value;
      return data;
    });
  };

  const saveNow = () => {
    setDashboardData((data) => data);
  };

  return (
    <main className="mx-auto grid min-w-0 max-w-7xl gap-6 px-4 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-white/85 bg-white/58 p-5 shadow-soft backdrop-blur-xl sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/70 px-3 py-2 text-xs font-semibold text-accent shadow-sm">
              <Settings className="h-4 w-4" />
              Content Manager
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Settings
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
              Edit the private dashboard for {partnerNames}. Changes save to this
              browser automatically.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-semibold text-muted">
              {savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : "Ready"}
            </span>
            <ActionButton icon={Save} variant="primary" onClick={saveNow}>
              Save
            </ActionButton>
            <ActionButton icon={RotateCcw} onClick={resetToDefault}>
              Reset To Default
            </ActionButton>
          </div>
        </div>
      </section>

      <ManagerSection title="Relationship Profile">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Person A Name">
            <TextInput
              value={profile.personAName}
              onChange={(value) => updateProfile("personAName", value)}
            />
          </Field>
          <Field label="Person B Name">
            <TextInput
              value={profile.personBName}
              onChange={(value) => updateProfile("personBName", value)}
            />
          </Field>
          <Field label="Relationship Start Date">
            <TextInput
              type="date"
              value={profile.relationshipStartDate}
              onChange={(value) => updateProfile("relationshipStartDate", value)}
            />
          </Field>
          <Field label="Days Together">
            <TextInput value={String(daysTogether)} readOnly onChange={() => {}} />
          </Field>
          <Field label="Relationship Temperature">
            <NumberInput
              value={profile.relationshipTemperature}
              onChange={(value) =>
                updateProfile("relationshipTemperature", value)
              }
            />
          </Field>
          <Field label="Last Date Summary">
            <TextInput
              value={profile.lastDateLabel}
              onChange={(value) => updateProfile("lastDateLabel", value)}
            />
          </Field>
          <Field label="Hero Subtitle" className="md:col-span-2">
            <TextArea
              value={profile.heroSubtitle}
              onChange={(value) => updateProfile("heroSubtitle", value)}
            />
          </Field>
          <Field label="Temperature Status Text">
            <TextArea
              value={profile.temperatureStatus}
              onChange={(value) => updateProfile("temperatureStatus", value)}
            />
          </Field>
        </div>
      </ManagerSection>

      <ManagerSection
        title="Important Dates"
        description="Maintain anniversaries, dates, trips, and reminders."
        actionLabel="Add Date"
        onAdd={addImportantDate}
      >
        <div className="grid gap-3">
          {dashboardData.importantDates.map((item, index) => (
            <RowCard key={item.id}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="owner-badge">Created by {item.createdBy}</span>
                <span className="owner-badge">Last edited by {item.lastEditedBy}</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr_1.3fr_0.8fr_auto] lg:items-end">
                <Field label="Title">
                  <TextInput
                    value={item.title}
                    onChange={(value) =>
                      updateListItem("importantDates", index, "title", value)
                    }
                  />
                </Field>
                <Field label="Date">
                  <TextInput
                    type="date"
                    value={item.date}
                    onChange={(value) =>
                      updateListItem("importantDates", index, "date", value)
                    }
                  />
                </Field>
                <Field label="Description">
                  <TextInput
                    value={item.description}
                    onChange={(value) =>
                      updateListItem(
                        "importantDates",
                        index,
                        "description",
                        value,
                      )
                    }
                  />
                </Field>
                <Field label="Status">
                  <SelectInput
                    value={item.status}
                    options={importantStatusOptions}
                    onChange={(value) =>
                      updateListItem("importantDates", index, "status", value)
                    }
                  />
                </Field>
                <IconButton
                  label="Delete date"
                  onClick={() => removeListItem("importantDates", index)}
                />
              </div>
            </RowCard>
          ))}
        </div>
      </ManagerSection>

      <ManagerSection title="Shared Notes">
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            ["personA", `${profile.personAName} Notes`],
            ["personB", `${profile.personBName} Notes`],
          ].map(([personKey, title]) => (
            <div key={personKey} className="rounded-[24px] bg-white/44 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-ink">{title}</h3>
                <ActionButton
                  icon={Plus}
                  onClick={() => addNote(personKey)}
                  disabled={currentUser?.role !== personKey}
                  title={
                    currentUser?.role !== personKey
                      ? `Only ${title.replace(" Notes", "")} can add here`
                      : undefined
                  }
                  className="min-h-9 px-3"
                >
                  Add Note
                </ActionButton>
              </div>
              <div className="grid gap-3">
                {dashboardData.sharedNotes[personKey].map((note, index) => {
                  const editable = canEditItem(currentUser, note);
                  const message = getPermissionMessage(users, note);

                  return (
                    <div key={note.id} className="grid gap-2">
                      <div className="flex gap-2">
                        <TextInput
                          value={note.content}
                          disabled={!editable}
                          title={!editable ? message : undefined}
                          onChange={(value) => updateNote(personKey, index, value)}
                        />
                        <IconButton
                          label="Delete note"
                          disabled={!editable}
                          title={!editable ? message : undefined}
                          onClick={() => removeNote(personKey, index)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="owner-badge">Owner: {note.authorName}</span>
                        {!editable ? (
                          <span className="view-only-badge">View only</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ManagerSection>

      <ManagerSection
        title="Memory Photos"
        description="Captions can only be edited by the person who uploaded the photo."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {dashboardData.memoryPhotos.map((photo, index) => {
            const editable = canEditItem(currentUser, photo);
            const message = getPermissionMessage(users, photo);
            const imageUrl = photo.imageUrl || photo.src;

            return (
              <RowCard key={photo.id}>
                <div className="grid gap-3 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                  <div
                    className="h-20 rounded-2xl border border-white/80 bg-cover bg-center"
                    style={{
                      background: imageUrl
                        ? `url(${imageUrl}) center / cover`
                        : photo.gradient,
                    }}
                  />
                  <div className="grid gap-2">
                    <TextInput
                      value={photo.caption}
                      disabled={!editable}
                      title={!editable ? message : undefined}
                      onChange={(value) => updateMemoryPhoto(index, "caption", value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <span className="owner-badge">Uploaded by {photo.uploadedBy}</span>
                      {!editable ? (
                        <span className="view-only-badge">View only</span>
                      ) : null}
                    </div>
                  </div>
                  <IconButton
                    label="Delete photo"
                    disabled={!editable}
                    title={!editable ? message : undefined}
                    onClick={() => removeMemoryPhoto(index)}
                  />
                </div>
              </RowCard>
            );
          })}
        </div>
      </ManagerSection>

      <ManagerSection
        title="Conflict Center"
        description="Maintain reflection records without editing code."
        actionLabel="Add Conflict"
        onAdd={addConflict}
      >
        <div className="grid gap-3">
          {dashboardData.conflictEntries.map((item, index) => (
            <RowCard key={item.id}>
              <div className="grid gap-3 lg:grid-cols-3">
                <Field label="Date">
                  <TextInput
                    value={item.date}
                    onChange={(value) =>
                      updateListItem("conflictEntries", index, "date", value)
                    }
                  />
                </Field>
                <Field label="Topic">
                  <TextInput
                    value={item.topic}
                    onChange={(value) =>
                      updateListItem("conflictEntries", index, "topic", value)
                    }
                  />
                </Field>
                <Field label="Duration">
                  <TextInput
                    value={item.duration}
                    onChange={(value) =>
                      updateListItem("conflictEntries", index, "duration", value)
                    }
                  />
                </Field>
                <Field label="Status">
                  <SelectInput
                    value={item.status}
                    options={conflictStatusOptions}
                    onChange={(value) =>
                      updateListItem("conflictEntries", index, "status", value)
                    }
                  />
                </Field>
                <Field label="Resolution">
                  <TextInput
                    value={item.resolution}
                    onChange={(value) =>
                      updateListItem(
                        "conflictEntries",
                        index,
                        "resolution",
                        value,
                      )
                    }
                  />
                </Field>
                <div className="flex items-end gap-2">
                  <Field label="Reward / Penalty" className="flex-1">
                    <TextInput
                      value={item.rewardPenalty}
                      onChange={(value) =>
                        updateListItem(
                          "conflictEntries",
                          index,
                          "rewardPenalty",
                          value,
                        )
                      }
                    />
                  </Field>
                  <IconButton
                    label="Delete conflict"
                    onClick={() => removeListItem("conflictEntries", index)}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="owner-badge">Last edited by {item.lastEditedBy}</span>
              </div>
            </RowCard>
          ))}
        </div>
      </ManagerSection>

      <ManagerSection title="Future Vision">
        <div className="grid gap-4 lg:grid-cols-3">
          {dashboardData.futureVision.map((group, groupIndex) => (
            <div key={group.id} className="rounded-[24px] bg-white/44 p-4">
              <div className="grid gap-3">
                <Field label="Category">
                  <TextInput
                    value={group.title}
                    onChange={(value) =>
                      updateFutureMeta(groupIndex, "title", value)
                    }
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Completed">
                    <NumberInput
                      value={group.completed}
                      onChange={(value) =>
                        updateFutureMeta(groupIndex, "completed", value)
                      }
                      max={999}
                    />
                  </Field>
                  <Field label="Total">
                    <NumberInput
                      value={group.total}
                      onChange={(value) =>
                        updateFutureMeta(groupIndex, "total", value)
                      }
                      min={1}
                      max={999}
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {group.items.map((item, itemIndex) => (
                  <div key={item.id} className="flex gap-2">
                    <TextInput
                      value={item.text}
                      onChange={(value) =>
                        updateFutureItem(groupIndex, itemIndex, value)
                      }
                    />
                    <IconButton
                      label="Delete dream"
                      onClick={() => removeFutureItem(groupIndex, itemIndex)}
                    />
                  </div>
                ))}
              </div>
              <ActionButton
                icon={Plus}
                onClick={() => addFutureItem(groupIndex)}
                className="mt-4 w-full"
              >
                Add Item
              </ActionButton>
            </div>
          ))}
        </div>
      </ManagerSection>

      <ManagerSection
        title="Gratitude Wall"
        actionLabel="Add Gratitude"
        onAdd={addGratitude}
      >
        <div className="grid gap-3">
          {dashboardData.gratitudeItems.map((item, index) => (
            <RowCard key={item.id}>
              {(() => {
                const editable = canEditItem(currentUser, item);
                const message = getPermissionMessage(users, item);

                return (
              <div className="grid gap-3 lg:grid-cols-[0.8fr_1.7fr_auto] lg:items-end">
                <Field label="Author">
                  <TextInput
                    value={item.authorName}
                    disabled={!editable}
                    title={!editable ? message : undefined}
                    onChange={(value) =>
                      updateListItem("gratitudeItems", index, "authorName", value)
                    }
                  />
                </Field>
                <Field label="Message">
                  <TextInput
                    value={item.message}
                    disabled={!editable}
                    title={!editable ? message : undefined}
                    onChange={(value) =>
                      updateListItem("gratitudeItems", index, "message", value)
                    }
                  />
                </Field>
                <IconButton
                  label="Delete gratitude"
                  disabled={!editable}
                  title={!editable ? message : undefined}
                  onClick={() => removeListItem("gratitudeItems", index)}
                />
              </div>
                );
              })()}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="owner-badge">Owner: {item.authorName}</span>
                {!canEditItem(currentUser, item) ? (
                  <span className="view-only-badge">View only</span>
                ) : null}
              </div>
            </RowCard>
          ))}
        </div>
      </ManagerSection>

      <ManagerSection
        id="wish-box-manager"
        title="Wish Box"
        description="Manage public gift hints, private timed wishes, and shared dreams."
      >
        <div className="grid gap-5">
          <div className="rounded-[24px] bg-white/44 p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-ink">Gift Hints</h3>
                <p className="mt-1 text-sm leading-5 text-muted">
                  Little things I love, in case you ever need inspiration.
                </p>
              </div>
              <ActionButton icon={Plus} onClick={addGiftHint}>
                Add Gift Hint
              </ActionButton>
            </div>
            <div className="grid gap-3">
              {dashboardData.wishes.giftHints.map((item, index) => (
                <RowCard key={item.id}>
                  {(() => {
                    const editable = canEditItem(currentUser, item);
                    const message = getPermissionMessage(users, item);

                    return (
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.25fr_0.75fr_0.7fr_auto] lg:items-end">
                    <Field label="Title">
                      <TextInput
                        value={item.title}
                        disabled={!editable}
                        title={!editable ? message : undefined}
                        onChange={(value) =>
                          updateWishItem("giftHints", index, "title", value)
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <TextInput
                        value={item.description}
                        disabled={!editable}
                        title={!editable ? message : undefined}
                        onChange={(value) =>
                          updateWishItem(
                            "giftHints",
                            index,
                            "description",
                            value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Category">
                      <TextInput
                        value={item.category}
                        disabled={!editable}
                        title={!editable ? message : undefined}
                        onChange={(value) =>
                          updateWishItem("giftHints", index, "category", value)
                        }
                      />
                    </Field>
                    <Field label="Priority">
                      <SelectInput
                        value={item.priority}
                        options={giftPriorityOptions}
                        disabled={!editable}
                        title={!editable ? message : undefined}
                        onChange={(value) =>
                          updateWishItem("giftHints", index, "priority", value)
                        }
                      />
                    </Field>
                    <IconButton
                      label="Delete gift hint"
                      disabled={!editable}
                      title={!editable ? message : undefined}
                      onClick={() => removeWishItem("giftHints", index)}
                    />
                  </div>
                    );
                  })()}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="owner-badge">Owner: {item.ownerName}</span>
                    {!canEditItem(currentUser, item) ? (
                      <span className="view-only-badge">View only</span>
                    ) : null}
                  </div>
                </RowCard>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] bg-white/44 p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-ink">Secret Wishes</h3>
                <p className="mt-1 text-sm leading-5 text-muted">
                  Private wishes that will open when the time is right.
                </p>
              </div>
              <ActionButton icon={Plus} onClick={addSecretWish}>
                Add Secret Wish
              </ActionButton>
            </div>
            <div className="grid gap-3">
              {dashboardData.wishes.secretWishes.map((item, index) => (
                <RowCard key={item.id}>
                  {(() => {
                    const editable = canEditItem(currentUser, item);
                    const message = getPermissionMessage(users, item);
                    const ownerName =
                      users.find((user) => user.id === item.ownerId)?.name ??
                      "Owner";

                    return (
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr_0.8fr_auto] lg:items-end">
                    <Field label="Title">
                      <TextInput
                        value={item.title}
                        disabled={!editable}
                        title={!editable ? message : undefined}
                        onChange={(value) =>
                          updateWishItem("secretWishes", index, "title", value)
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <TextInput
                        value={item.description}
                        disabled={!editable}
                        title={!editable ? message : undefined}
                        onChange={(value) =>
                          updateWishItem(
                            "secretWishes",
                            index,
                            "description",
                            value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Unlock Date">
                      <TextInput
                        type="date"
                        value={item.unlockDate}
                        disabled={!editable}
                        title={!editable ? message : undefined}
                        onChange={(value) =>
                          updateWishItem(
                            "secretWishes",
                            index,
                            "unlockDate",
                            value,
                          )
                        }
                      />
                    </Field>
                    <IconButton
                      label="Delete secret wish"
                      disabled={!editable}
                      title={!editable ? message : undefined}
                      onClick={() => removeWishItem("secretWishes", index)}
                    />
                  </div>
                    );
                  })()}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="owner-badge">
                      Owner: {users.find((user) => user.id === item.ownerId)?.name ?? "Owner"}
                    </span>
                    {!canEditItem(currentUser, item) ? (
                      <span className="view-only-badge">View only</span>
                    ) : null}
                  </div>
                </RowCard>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] bg-white/44 p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-ink">Shared Dreams</h3>
                <p className="mt-1 text-sm leading-5 text-muted">
                  Things we want to experience together.
                </p>
              </div>
              <ActionButton icon={Plus} onClick={addSharedDream}>
                Add Shared Dream
              </ActionButton>
            </div>
            <div className="grid gap-3">
              {dashboardData.wishes.sharedDreams.map((item, index) => (
                <RowCard key={item.id}>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr_0.8fr_auto] lg:items-end">
                    <Field label="Title">
                      <TextInput
                        value={item.title}
                        onChange={(value) =>
                          updateWishItem("sharedDreams", index, "title", value)
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <TextInput
                        value={item.description}
                        onChange={(value) =>
                          updateWishItem(
                            "sharedDreams",
                            index,
                            "description",
                            value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Status">
                      <SelectInput
                        value={item.status}
                        options={sharedDreamStatusOptions}
                        onChange={(value) =>
                          updateWishItem("sharedDreams", index, "status", value)
                        }
                      />
                    </Field>
                    <IconButton
                      label="Delete shared dream"
                      onClick={() => removeWishItem("sharedDreams", index)}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="owner-badge">Shared</span>
                    <span className="owner-badge">
                      Last edited by {item.lastEditedBy}
                    </span>
                  </div>
                </RowCard>
              ))}
            </div>
          </div>
        </div>
      </ManagerSection>

      <ManagerSection title="AI Coach">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Field label="Weekly Insight">
            <TextArea
              rows={7}
              value={dashboardData.aiCoach.weeklyInsight}
              onChange={(value) =>
                setDashboardData((data) => {
                  data.aiCoach.weeklyInsight = value;
                  return data;
                })
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Communication Score">
              <NumberInput
                value={dashboardData.aiCoach.metrics.communication}
                onChange={(value) => updateCoachMetric("communication", value)}
              />
            </Field>
            <Field label="Quality Time Score">
              <NumberInput
                value={dashboardData.aiCoach.metrics.qualityTime}
                onChange={(value) => updateCoachMetric("qualityTime", value)}
              />
            </Field>
            <Field label="Conflict Recovery Score">
              <NumberInput
                value={dashboardData.aiCoach.metrics.conflictRecovery}
                onChange={(value) =>
                  updateCoachMetric("conflictRecovery", value)
                }
              />
            </Field>
            <Field label="Emotional Support Score">
              <NumberInput
                value={dashboardData.aiCoach.metrics.emotionalSupport}
                onChange={(value) =>
                  updateCoachMetric("emotionalSupport", value)
                }
              />
            </Field>
            <div className="flex items-center gap-2 rounded-2xl border border-[#C8D8CC] bg-[#EEF5EF] px-4 py-3 text-sm font-semibold text-[#58735F] sm:col-span-2">
              <Check className="h-4 w-4" />
              Auto-saved to localStorage
            </div>
          </div>
        </div>
      </ManagerSection>
    </main>
  );
}
