function getOwnerId(item) {
  return item?.ownerId ?? item?.owner_id ?? item?.addedById ?? null;
}

function getAddedByName(item) {
  return item?.addedBy ?? item?.added_by ?? null;
}

function getItemType(item) {
  return item?.kind ?? item?.wishType ?? item?.wish_type ?? item?.type ?? "";
}

export function getOwnerName(users, ownerIdOrItem) {
  if (typeof ownerIdOrItem === "object") {
    const addedBy = getAddedByName(ownerIdOrItem);
    if (addedBy) return addedBy;
    return (
      ownerIdOrItem.ownerName ??
      ownerIdOrItem.owner_name ??
      ownerIdOrItem.authorName ??
      ownerIdOrItem.author_name ??
      ownerIdOrItem.uploadedBy ??
      ownerIdOrItem.uploaded_by ??
      users.find((user) => user.id === getOwnerId(ownerIdOrItem))?.name ??
      "Unknown owner"
    );
  }

  return users.find((user) => user.id === ownerIdOrItem)?.name ?? "Unknown owner";
}

export function getPermissionMessage(users, item) {
  return `Only ${getOwnerName(users, item)} can edit this`;
}

// This is client-side role-based editing for prototype use.
// Real production permissions should be enforced by Supabase Auth and RLS.
export function canEditItem(currentUser, item) {
  if (!currentUser || !item) return false;

  const ownerId = getOwnerId(item);
  const itemType = getItemType(item);
  const ownerOnlyTypes = new Set([
    "gift_hint",
    "secret_wish",
    "memory_photo",
    "personal_note",
    "gratitude",
  ]);

  if (itemType === "footprint") {
    return ownerId === currentUser.id || getAddedByName(item) === currentUser.name;
  }

  if (ownerOnlyTypes.has(itemType)) {
    return ownerId === currentUser.id;
  }

  if (item.locked === true) {
    return ownerId === currentUser.id;
  }

  if (item.visibility === "shared") return true;

  return ownerId === currentUser.id;
}

export function canEditOwnedItem(currentUser, item) {
  if (!currentUser || !item) return false;
  return getOwnerId(item) === currentUser.id;
}

export function withLastEditedBy(item, currentUser) {
  return {
    ...item,
    lastEditedBy: currentUser?.name ?? item.lastEditedBy,
  };
}
