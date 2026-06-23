import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultDashboardData } from "./dashboardData.js";
import {
  fetchDashboardData,
  isSupabaseConfigured,
  saveDashboardData,
  uploadMemoryPhoto as uploadCloudMemoryPhoto,
} from "./cloudDataStore.js";
import { normalizeDateString } from "../utils/dateUtils.js";

const DashboardDataContext = createContext(null);

const cloneData = (value) => JSON.parse(JSON.stringify(value));

const toFiniteNumber = (value, fallback) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const isComputedDateDescription = (value) =>
  /^(today|date not set|\d+\s+days?\s+(left|ago))$/i.test((value ?? "").trim());

const getDefaultUserByRole = (role) =>
  defaultDashboardData.users.find((user) => user.role === role);

const getDefaultUserById = (id) =>
  defaultDashboardData.users.find((user) => user.id === id);

const normalizeKnownName = (name, role) => {
  const defaultUser = getDefaultUserByRole(role);
  if (!name) return defaultUser?.name ?? "";
  if (name === "Grace" && role === "personA") return "Fan Ye";
  if (name === "Yihang" && role === "personB") return "Yihang Fu";
  return name;
};

const getUserByDisplayName = (name) => {
  if (!name) return null;

  const candidates = [
    name,
    normalizeKnownName(name, "personA"),
    normalizeKnownName(name, "personB"),
  ];

  return (
    defaultDashboardData.users.find((user) =>
      candidates.some(
        (candidate) =>
          candidate === user.name || candidate === user.shortName,
      ),
    ) ?? null
  );
};

const normalizeDisplayName = (name, fallbackRole = "personA") =>
  getUserByDisplayName(name)?.name ?? normalizeKnownName(name, fallbackRole);

const getAlternatingRole = (index) =>
  index % 2 === 0 ? "personA" : "personB";

const resolveOwner = (item, index, fallbackRole = "personA", nameFields = []) => {
  const byId = getDefaultUserById(item.ownerId);
  if (byId) return byId;

  const byName = nameFields
    .map((field) => getUserByDisplayName(item[field]))
    .find(Boolean);
  if (byName) return byName;

  return getDefaultUserByRole(
    fallbackRole === "alternate" ? getAlternatingRole(index) : fallbackRole,
  );
};

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function calculateDaysTogether(startDate) {
  if (!startDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );

  return Math.max(0, Math.floor((today - startDay) / 86400000));
}

function normalizeArrayItems(items, prefix, mapper) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({
    id: item?.id ?? `${prefix}-${index + 1}`,
    ...mapper(item ?? {}, index),
  }));
}

function normalizeSharedNotes(notes) {
  if (notes?.personA || notes?.personB) {
    const personA = getDefaultUserByRole("personA");
    const personB = getDefaultUserByRole("personB");

    return {
      personA: normalizeArrayItems(notes.personA, "note-a", (item) => ({
        kind: "personal_note",
        ownerId: personA.id,
        authorName: personA.name,
        content: item.content ?? item.text ?? "",
        visibility: item.visibility ?? "visible_to_partner",
      })),
      personB: normalizeArrayItems(notes.personB, "note-b", (item) => ({
        kind: "personal_note",
        ownerId: personB.id,
        authorName: personB.name,
        content: item.content ?? item.text ?? "",
        visibility: item.visibility ?? "visible_to_partner",
      })),
    };
  }

  const [firstKey, secondKey] = Object.keys(notes ?? {});
  const personA = getDefaultUserByRole("personA");
  const personB = getDefaultUserByRole("personB");
  return {
    personA: normalizeArrayItems(notes?.[firstKey], "note-a", (item) => ({
      kind: "personal_note",
      ownerId: personA.id,
      authorName: personA.name,
      content: typeof item === "string" ? item : item.content ?? item.text ?? "",
      visibility: item.visibility ?? "visible_to_partner",
    })),
    personB: normalizeArrayItems(notes?.[secondKey], "note-b", (item) => ({
      kind: "personal_note",
      ownerId: personB.id,
      authorName: personB.name,
      content: typeof item === "string" ? item : item.content ?? item.text ?? "",
      visibility: item.visibility ?? "visible_to_partner",
    })),
  };
}

function normalizeWishArray(items, prefix, mapper) {
  return normalizeArrayItems(items, prefix, mapper);
}

function normalizeWishes(wishes) {
  const defaults = defaultDashboardData.wishes;

  if (Array.isArray(wishes)) {
    return wishes.reduce(
      (groups, item, index) => {
        const legacyType = item.type ?? item.status;
        const baseId = item.id ?? `legacy-wish-${index + 1}`;
        const personA = getDefaultUserByRole("personA");
        const owner = resolveOwner(
          item,
          index,
          legacyType === "Locked" ? "personB" : "personA",
          ["ownerName", "authorName", "uploadedBy"],
        );

        if (legacyType === "Locked") {
          groups.secretWishes.push({
            id: baseId,
            ownerId: owner.id,
            wishType: "secret_wish",
            title: item.title ?? "Secret wish",
            description: item.description ?? item.text ?? "",
            unlockDate: normalizeDateString(item.unlockDate) || "2026-07-01",
            visibility: "private_until_unlock",
          });
        } else if (legacyType === "Shared") {
          groups.sharedDreams.push({
            id: baseId,
            wishType: "shared_dream",
            title: item.title ?? "Shared dream",
            description: item.description ?? item.text ?? "",
            status: "Planned",
            visibility: "shared",
            lastEditedBy: item.lastEditedBy ?? personA.name,
          });
        } else {
          groups.giftHints.push({
            id: baseId,
            ownerId: owner.id,
            ownerName: owner.name,
            wishType: "gift_hint",
            title: item.title ?? "Gift hint",
            description: item.description ?? item.text ?? "",
            category: item.category ?? "Personal",
            priority: item.priority ?? "Medium",
            visibility: "visible_to_partner",
          });
        }

        return groups;
      },
      { giftHints: [], secretWishes: [], sharedDreams: [] },
    );
  }

  return {
    giftHints: normalizeWishArray(
      wishes?.giftHints ?? defaults.giftHints,
      "gift",
      (item, index) => {
        const owner = resolveOwner(item, index, "alternate", ["ownerName"]);

        return {
          ownerId: owner.id,
          ownerName: owner.name,
          wishType: "gift_hint",
          title: item.title ?? "",
          description: item.description ?? "",
          category: item.category ?? "",
          priority: item.priority ?? "Medium",
          visibility: item.visibility ?? "visible_to_partner",
        };
      },
    ),
    secretWishes: normalizeWishArray(
      wishes?.secretWishes ?? defaults.secretWishes,
      "secret",
      (item, index) => {
        const owner = resolveOwner(item, index, "alternate", [
          "ownerName",
          "authorName",
        ]);

        return {
          ownerId: owner.id,
          wishType: "secret_wish",
          title: item.title ?? "",
          description: item.description ?? "",
          unlockDate: normalizeDateString(item.unlockDate),
          visibility: item.visibility ?? "private_until_unlock",
        };
      },
    ),
    sharedDreams: normalizeWishArray(
      wishes?.sharedDreams ?? defaults.sharedDreams,
      "shared",
      (item) => ({
        title: item.title ?? "",
        wishType: "shared_dream",
        description: item.description ?? "",
        status: item.status ?? "Planned",
        visibility: item.visibility ?? "shared",
        lastEditedBy: item.lastEditedBy ?? getDefaultUserByRole("personA").name,
      }),
    ),
  };
}

export function normalizeDashboardData(rawData) {
  const raw = rawData ?? {};
  const defaults = defaultDashboardData;

  return {
    profile: {
      ...defaults.profile,
      ...(raw.profile ?? {}),
      personAName: normalizeKnownName(
        raw.profile?.personAName ?? defaults.profile.personAName,
        "personA",
      ),
      personBName: normalizeKnownName(
        raw.profile?.personBName ?? defaults.profile.personBName,
        "personB",
      ),
    },
    navItems: raw.navItems ?? defaults.navItems,
    users: normalizeArrayItems(raw.users ?? defaults.users, "user", (item) => ({
      name: normalizeKnownName(item.name, item.role),
      shortName: item.shortName ?? item.name?.charAt(0)?.toUpperCase() ?? "",
      role: item.role ?? "personA",
    })),
    importantDates: normalizeArrayItems(
      raw.importantDates ?? defaults.importantDates,
      "date",
      (item) => {
        const description = item.description ?? item.detail ?? "";

        return {
          title: item.title ?? "",
          date: normalizeDateString(item.date),
          status: item.status ?? "Upcoming",
          description: isComputedDateDescription(description) ? "" : description,
          visibility: item.visibility ?? "shared",
          createdBy: normalizeDisplayName(item.createdBy, "personA"),
          lastEditedBy: normalizeDisplayName(item.lastEditedBy, "personA"),
        };
      },
    ),
    memoryPhotos: normalizeArrayItems(
      raw.memoryPhotos ?? defaults.memoryPhotos,
      "memory",
      (item, index) => {
        const owner = resolveOwner(item, index, "alternate", [
          "uploadedBy",
          "ownerName",
        ]);

        return {
          label: item.label ?? "",
          kind: "memory_photo",
          ownerId: owner.id,
          uploadedBy: owner.name,
          imageUrl: item.imageUrl ?? item.src ?? "",
          src: item.src ?? item.imageUrl ?? "",
          caption: item.caption ?? item.label ?? "",
          createdAt: item.createdAt ?? item.uploadedAt ?? "",
          visibility: item.visibility ?? "shared",
          locked: item.locked ?? true,
          gradient: item.gradient ?? "",
          uploadedAt: item.uploadedAt ?? "",
        };
      },
    ),
    sharedNotes: normalizeSharedNotes(raw.sharedNotes ?? defaults.sharedNotes),
    conflictEntries: normalizeArrayItems(
      raw.conflictEntries ?? defaults.conflictEntries,
      "conflict",
      (item) => ({
        date: item.date ?? "",
        topic: item.topic ?? "",
        duration: item.duration ?? "",
        status: item.status ?? "Resolved",
        resolution: item.resolution ?? "",
        rewardPenalty: item.rewardPenalty ?? item.reward ?? "",
        visibility: item.visibility ?? "shared",
        lastEditedBy: normalizeDisplayName(item.lastEditedBy, "personA"),
      }),
    ),
    futureVision: normalizeArrayItems(
      raw.futureVision ?? defaults.futureVision,
      "future",
      (group, groupIndex) => ({
        title: group.title ?? defaults.futureVision[groupIndex]?.title ?? "",
        tone: group.tone ?? defaults.futureVision[groupIndex]?.tone ?? "sage",
        completed: toFiniteNumber(
          group.completed,
          defaults.futureVision[groupIndex]?.completed ?? 0,
        ),
        total: Math.max(
          1,
          toFiniteNumber(group.total, defaults.futureVision[groupIndex]?.total ?? 1),
        ),
        items: normalizeArrayItems(group.items, `future-${groupIndex}`, (item) => ({
          text: typeof item === "string" ? item : item.text ?? "",
        })),
      }),
    ),
    gratitudeItems: normalizeArrayItems(
      raw.gratitudeItems ?? defaults.gratitudeItems,
      "gratitude",
      (item, index) => {
        const owner = resolveOwner(item, index, "alternate", [
          "authorName",
          "author",
        ]);

        return {
          ownerId: owner.id,
          kind: "gratitude",
          authorName: owner.name,
          message: item.message ?? item.text ?? "",
          visibility: item.visibility ?? "shared",
          locked: item.locked ?? true,
        };
      },
    ),
    footprints: normalizeArrayItems(
      raw.footprints ?? defaults.footprints,
      "footprint",
      (item, index) => {
        const owner = resolveOwner(item, index, "alternate", [
          "addedBy",
          "added_by",
          "ownerName",
        ]);
        const city = item.city ?? "";
        const state = item.state ?? "";

        return {
          city,
          state,
          label: item.label ?? (city && state ? `${city}, ${state}` : ""),
          note: item.note ?? "",
          dateVisited: normalizeDateString(item.dateVisited ?? item.date_visited),
          ownerId: item.ownerId ?? item.owner_id ?? owner.id,
          addedBy: item.addedBy ?? item.added_by ?? owner.name,
          visibility: item.visibility ?? "shared",
          kind: "footprint",
        };
      },
    ),
    wishes: normalizeWishes(raw.wishes ?? defaults.wishes),
    aiCoach: {
      weeklyInsight:
        raw.aiCoach?.weeklyInsight ?? defaults.aiCoach.weeklyInsight,
      metrics: {
        communication: toFiniteNumber(
          raw.aiCoach?.metrics?.communication,
          defaults.aiCoach.metrics.communication,
        ),
        qualityTime: toFiniteNumber(
          raw.aiCoach?.metrics?.qualityTime,
          defaults.aiCoach.metrics.qualityTime,
        ),
        conflictRecovery: toFiniteNumber(
          raw.aiCoach?.metrics?.conflictRecovery,
          defaults.aiCoach.metrics.conflictRecovery,
        ),
        emotionalSupport: toFiniteNumber(
          raw.aiCoach?.metrics?.emotionalSupport,
          defaults.aiCoach.metrics.emotionalSupport,
        ),
      },
    },
  };
}

function readStoredData() {
  return normalizeDashboardData(defaultDashboardData);
}

export function DashboardDataProvider({ children }) {
  const [dashboardData, setDashboardData] = useState(readStoredData);
  const [savedAt, setSavedAt] = useState(null);
  const [cloudStatus, setCloudStatus] = useState(
    isSupabaseConfigured ? "loading" : "demo",
  );
  const [cloudError, setCloudError] = useState("");
  const latestDataRef = useRef(dashboardData);
  const saveQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    latestDataRef.current = dashboardData;
  }, [dashboardData]);

  useEffect(() => {
    let isMounted = true;

    async function loadCloudData() {
      if (!isSupabaseConfigured) {
        setCloudStatus("demo");
        return;
      }

      try {
        const cloudData = normalizeDashboardData(await fetchDashboardData());
        if (!isMounted) return;
        latestDataRef.current = cloudData;
        setDashboardData(cloudData);
        setCloudStatus("cloud");
        setCloudError("");
        setSavedAt(new Date());
      } catch (error) {
        if (!isMounted) return;
        setCloudStatus("error");
        setCloudError(error.message || "Could not load Supabase data.");
      }
    }

    loadCloudData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateDashboardData = useCallback((updater) => {
    setDashboardData((currentData) => {
      const nextData = normalizeDashboardData(
        typeof updater === "function" ? updater(cloneData(currentData)) : updater,
      );
      latestDataRef.current = nextData;

      if (isSupabaseConfigured) {
        setCloudStatus("saving");
        setCloudError("");

        const saveTask = saveQueueRef.current
          .catch(() => {})
          .then(() => saveDashboardData(nextData));

        saveQueueRef.current = saveTask;

        saveTask
          .then(() => {
            setSavedAt(new Date());
            setCloudStatus("cloud");
            setCloudError("");
          })
          .catch((error) => {
            setCloudStatus("error");
            setCloudError(error.message || "Could not save Supabase data.");
          });
      } else {
        setCloudStatus("demo");
        setCloudError("");
      }

      return nextData;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    updateDashboardData(normalizeDashboardData(defaultDashboardData));
  }, [updateDashboardData]);

  const uploadPhotoFile = useCallback((file, currentUser) => {
    if (!isSupabaseConfigured) {
      return Promise.reject(new Error("Supabase Storage is not configured."));
    }

    return uploadCloudMemoryPhoto(file, currentUser);
  }, []);

  const value = useMemo(
    () => ({
      dashboardData,
      setDashboardData: updateDashboardData,
      resetToDefault,
      savedAt,
      cloudStatus,
      cloudError,
      isCloudConfigured: isSupabaseConfigured,
      uploadPhotoFile,
    }),
    [
      cloudStatus,
      cloudError,
      dashboardData,
      resetToDefault,
      savedAt,
      updateDashboardData,
      uploadPhotoFile,
    ],
  );

  return createElement(DashboardDataContext.Provider, { value }, children);
}

export function useDashboardData() {
  const value = useContext(DashboardDataContext);
  if (!value) {
    throw new Error("useDashboardData must be used inside DashboardDataProvider");
  }
  return value;
}
