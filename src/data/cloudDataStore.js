import { defaultDashboardData } from "./dashboardData.js";
import {
  isSupabaseConfigured,
  supabaseRequest,
  uploadSupabaseObject,
} from "../lib/supabaseClient.js";

const REST_PREFIX = "/rest/v1";
const MEMORY_BUCKET = "memory-photos";

const metricNameMap = {
  communication: "communication",
  qualityTime: "quality_time",
  conflictRecovery: "conflict_recovery",
  emotionalSupport: "emotional_support",
};

const reverseMetricNameMap = Object.fromEntries(
  Object.entries(metricNameMap).map(([key, value]) => [value, key]),
);

function apiPath(table, query = "select=*") {
  return `${REST_PREFIX}/${table}${query ? `?${query}` : ""}`;
}

async function fetchTable(table, query = "select=*") {
  return supabaseRequest(apiPath(table, query));
}

async function deleteRows(table, ids) {
  if (!ids?.length) return;

  await supabaseRequest(apiPath(table, `id=in.(${ids.join(",")})`), {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

function upsertRows(table, rows, conflictKey = "id") {
  if (!rows.length) return Promise.resolve();

  return supabaseRequest(apiPath(table, `on_conflict=${conflictKey}`), {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
}

async function syncTable(table, rows, deletedIds = []) {
  const nextRows = rows.filter((row) => row.id);

  await upsertRows(table, nextRows);
  await deleteRows(table, deletedIds);
}

function groupNotesByOwner(rows, users) {
  const personA = users.find((user) => user.role === "personA");
  const personB = users.find((user) => user.role === "personB");

  return {
    personA: rows
      .filter((row) => row.owner_id === personA?.id)
      .map((row) => ({
        id: row.id,
        ownerId: row.owner_id,
        authorName: row.author_name,
        content: row.content,
        visibility: row.visibility,
      })),
    personB: rows
      .filter((row) => row.owner_id === personB?.id)
      .map((row) => ({
        id: row.id,
        ownerId: row.owner_id,
        authorName: row.author_name,
        content: row.content,
        visibility: row.visibility,
      })),
  };
}

function groupFutureVision(rows) {
  const grouped = rows.reduce((groups, row) => {
    const category = row.category || "Shared Plans";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(row);
    return groups;
  }, new Map());

  return Array.from(grouped.entries()).map(([category, items], index) => {
    const completed = items.filter((item) => item.status === "Completed").length;

    return {
      id: `future-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-") || index}`,
      title: category,
      tone: index === 0 ? "accent" : index === 1 ? "sage" : "clay",
      completed,
      total: Math.max(items.length, 1),
      items: items.map((item) => ({
        id: item.id,
        text: item.title || item.description || "",
        description: item.description ?? "",
        status: item.status ?? "Planned",
        visibility: item.visibility ?? "shared",
        lastEditedBy: item.last_edited_by ?? "",
      })),
    };
  });
}

function cloudToDashboardData(result) {
  const users = defaultDashboardData.users;
  const profileRow = result.relationship_profile?.[0];
  const aiRows = result.ai_coach_metrics ?? [];
  const weeklyInsight =
    aiRows.find((row) => row.weekly_insight)?.weekly_insight ??
    defaultDashboardData.aiCoach.weeklyInsight;

  const metrics = aiRows.reduce(
    (values, row) => {
      const key = reverseMetricNameMap[row.metric_name];
      if (key) values[key] = Number(row.metric_value) || 0;
      return values;
    },
    { ...defaultDashboardData.aiCoach.metrics },
  );

  return {
    profile: {
      personAName:
        profileRow?.person_a_name ?? defaultDashboardData.profile.personAName,
      personBName:
        profileRow?.person_b_name ?? defaultDashboardData.profile.personBName,
      relationshipStartDate:
        profileRow?.relationship_start_date ??
        defaultDashboardData.profile.relationshipStartDate,
      lastDateLabel: profileRow?.last_date ?? defaultDashboardData.profile.lastDateLabel,
    },
    navItems: defaultDashboardData.navItems,
    users,
    importantDates: (result.important_dates ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      description: row.description,
      status: row.status,
      visibility: row.visibility,
      createdBy: row.created_by,
      lastEditedBy: row.last_edited_by,
    })),
    sharedNotes: groupNotesByOwner(result.shared_notes ?? [], users),
    conflictEntries: (result.conflict_entries ?? []).map((row) => ({
      id: row.id,
      date: row.date,
      topic: row.topic,
      duration: row.duration,
      status: row.status,
      resolution: row.resolution,
      rewardPenalty: row.reward_penalty,
      visibility: row.visibility,
      lastEditedBy: row.last_edited_by,
    })),
    futureVision: groupFutureVision(result.future_vision_items ?? []),
    gratitudeItems: (result.gratitude_items ?? []).map((row) => ({
      id: row.id,
      ownerId: row.owner_id,
      authorName: row.author_name,
      message: row.message,
      visibility: row.visibility,
      locked: true,
    })),
    wishes: {
      giftHints: (result.wishes ?? [])
        .filter((row) => row.wish_type === "gift_hint")
        .map((row) => ({
          id: row.id,
          wishType: "gift_hint",
          ownerId: row.owner_id,
          ownerName: row.owner_name,
          title: row.title,
          description: row.description,
          category: row.category,
          priority: row.priority,
          visibility: row.visibility,
        })),
      secretWishes: (result.wishes ?? [])
        .filter((row) => row.wish_type === "secret_wish")
        .map((row) => ({
          id: row.id,
          wishType: "secret_wish",
          ownerId: row.owner_id,
          title: row.title,
          description: row.description,
          unlockDate: row.unlock_date,
          visibility: row.visibility,
        })),
      sharedDreams: (result.wishes ?? [])
        .filter((row) => row.wish_type === "shared_dream")
        .map((row) => ({
          id: row.id,
          wishType: "shared_dream",
          title: row.title,
          description: row.description,
          status: row.status,
          visibility: row.visibility,
          lastEditedBy: row.owner_name,
        })),
    },
    memoryPhotos: (result.memory_photos ?? []).map((row, index) => ({
      id: row.id,
      ownerId: row.owner_id,
      uploadedBy: row.uploaded_by,
      imageUrl: row.image_url,
      src: row.image_url,
      caption: row.caption,
      createdAt: row.created_at,
      visibility: row.visibility,
      locked: true,
      gradient:
        defaultDashboardData.memoryPhotos[index % defaultDashboardData.memoryPhotos.length]
          ?.gradient ?? "",
    })),
    footprints: (result.footprints ?? []).map((row) => ({
      id: row.id,
      city: row.city,
      state: row.state,
      label: row.label,
      note: row.note,
      dateVisited: row.date_visited,
      ownerId: row.owner_id,
      addedBy: row.added_by,
      visibility: row.visibility,
      kind: "footprint",
    })),
    aiCoach: {
      weeklyInsight,
      metrics,
    },
  };
}

function dashboardToCloudRows(data) {
  const dashboardData = data;

  return {
    relationship_profile: [
      {
        id: "main",
        person_a_name: dashboardData.profile.personAName,
        person_b_name: dashboardData.profile.personBName,
        relationship_start_date: dashboardData.profile.relationshipStartDate,
        last_date: dashboardData.profile.lastDateLabel,
      },
    ],
    important_dates: dashboardData.importantDates.map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date || null,
      description: item.description,
      status: item.status,
      visibility: item.visibility,
      created_by: item.createdBy,
      last_edited_by: item.lastEditedBy,
    })),
    shared_notes: [
      ...dashboardData.sharedNotes.personA,
      ...dashboardData.sharedNotes.personB,
    ].map((item) => ({
      id: item.id,
      owner_id: item.ownerId,
      author_name: item.authorName,
      content: item.content,
      visibility: item.visibility,
    })),
    conflict_entries: dashboardData.conflictEntries.map((item) => ({
      id: item.id,
      date: item.date || null,
      topic: item.topic,
      duration: item.duration,
      status: item.status,
      resolution: item.resolution,
      reward_penalty: item.rewardPenalty,
      visibility: item.visibility,
      last_edited_by: item.lastEditedBy,
    })),
    future_vision_items: dashboardData.futureVision.flatMap((group) =>
      group.items.map((item) => ({
        id: item.id,
        category: group.title,
        title: item.text,
        description: item.description ?? "",
        status: item.status ?? "Planned",
        visibility: item.visibility ?? "shared",
        last_edited_by: item.lastEditedBy ?? "",
      })),
    ),
    gratitude_items: dashboardData.gratitudeItems.map((item) => ({
      id: item.id,
      owner_id: item.ownerId,
      author_name: item.authorName,
      message: item.message,
      visibility: item.visibility,
    })),
    wishes: [
      ...dashboardData.wishes.giftHints.map((item) => ({
        id: item.id,
        wish_type: "gift_hint",
        owner_id: item.ownerId,
        owner_name: item.ownerName,
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        unlock_date: null,
        status: null,
        visibility: item.visibility,
      })),
      ...dashboardData.wishes.secretWishes.map((item) => ({
        id: item.id,
        wish_type: "secret_wish",
        owner_id: item.ownerId,
        owner_name:
          dashboardData.users.find((user) => user.id === item.ownerId)?.name ?? "",
        title: item.title,
        description: item.description,
        category: null,
        priority: null,
        unlock_date: item.unlockDate || null,
        status: null,
        visibility: item.visibility,
      })),
      ...dashboardData.wishes.sharedDreams.map((item) => ({
        id: item.id,
        wish_type: "shared_dream",
        owner_id: null,
        owner_name: item.lastEditedBy ?? "",
        title: item.title,
        description: item.description,
        category: null,
        priority: null,
        unlock_date: null,
        status: item.status,
        visibility: item.visibility,
      })),
    ],
    memory_photos: dashboardData.memoryPhotos.map((item) => ({
      id: item.id,
      owner_id: item.ownerId,
      uploaded_by: item.uploadedBy,
      image_url: item.imageUrl || item.src || "",
      caption: item.caption,
      visibility: item.visibility,
    })),
    footprints: dashboardData.footprints.map((item) => ({
      id: item.id,
      city: item.city,
      state: item.state,
      label: item.label || `${item.city}, ${item.state}`,
      note: item.note,
      date_visited: item.dateVisited || null,
      owner_id: item.ownerId,
      added_by: item.addedBy,
      visibility: item.visibility,
    })),
    ai_coach_metrics: Object.entries(dashboardData.aiCoach.metrics).map(
      ([key, value]) => ({
        id: metricNameMap[key],
        metric_name: metricNameMap[key],
        metric_value: Number(value) || 0,
        weekly_insight: dashboardData.aiCoach.weeklyInsight,
      }),
    ),
  };
}

export async function fetchDashboardData() {
  if (!isSupabaseConfigured) {
    return defaultDashboardData;
  }

  const tables = await Promise.all([
    fetchTable("relationship_profile", "select=*&limit=1"),
    fetchTable("important_dates", "select=*&order=date.asc"),
    fetchTable("shared_notes", "select=*&order=created_at.asc"),
    fetchTable("conflict_entries", "select=*&order=created_at.desc"),
    fetchTable("future_vision_items", "select=*&order=created_at.asc"),
    fetchTable("gratitude_items", "select=*&order=created_at.desc"),
    fetchTable("wishes", "select=*&order=created_at.asc"),
    fetchTable("memory_photos", "select=*&order=created_at.asc"),
    fetchTable("footprints", "select=*&order=date_visited.asc"),
    fetchTable("ai_coach_metrics", "select=*"),
  ]);

  return cloudToDashboardData({
    relationship_profile: tables[0],
    important_dates: tables[1],
    shared_notes: tables[2],
    conflict_entries: tables[3],
    future_vision_items: tables[4],
    gratitude_items: tables[5],
    wishes: tables[6],
    memory_photos: tables[7],
    footprints: tables[8],
    ai_coach_metrics: tables[9],
  });
}

export async function saveDashboardData(data, deletedIds = {}) {
  if (!isSupabaseConfigured) return data;

  const rows = dashboardToCloudRows(data);
  await upsertRows("relationship_profile", rows.relationship_profile);
  await syncTable("important_dates", rows.important_dates, deletedIds.important_dates);
  await syncTable("shared_notes", rows.shared_notes, deletedIds.shared_notes);
  await syncTable("conflict_entries", rows.conflict_entries, deletedIds.conflict_entries);
  await syncTable(
    "future_vision_items",
    rows.future_vision_items,
    deletedIds.future_vision_items,
  );
  await syncTable("gratitude_items", rows.gratitude_items, deletedIds.gratitude_items);
  await syncTable("wishes", rows.wishes, deletedIds.wishes);
  await syncTable("memory_photos", rows.memory_photos, deletedIds.memory_photos);
  await syncTable("footprints", rows.footprints, deletedIds.footprints);
  await upsertRows("ai_coach_metrics", rows.ai_coach_metrics);

  return data;
}

export async function uploadMemoryPhoto(file, currentUser) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const filePath = `${currentUser.id}/${Date.now()}-${safeName}`;
  return uploadSupabaseObject(MEMORY_BUCKET, filePath, file);
}

export const updateImportantDate = saveDashboardData;
export const addImportantDate = saveDashboardData;
export const deleteImportantDate = saveDashboardData;
export const addSharedNote = saveDashboardData;
export const updateSharedNote = saveDashboardData;
export const addWish = saveDashboardData;
export const updateWish = saveDashboardData;
export const addFootprint = saveDashboardData;
export const updateFootprint = saveDashboardData;
export const deleteFootprint = saveDashboardData;

export { isSupabaseConfigured };
