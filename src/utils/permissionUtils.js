export function getOwnerName(users, ownerId) {
  return users.find((user) => user.id === ownerId)?.name ?? "Unknown owner";
}

export function getPermissionMessage(users, item) {
  return `Only ${getOwnerName(users, item?.ownerId)} can edit this`;
}

// This is client-side role-based editing for prototype use.
// Real production permissions should be enforced by backend auth and database rules.
export function canEditItem(currentUser, item) {
  if (!currentUser || !item) return false;

  if (item.locked === true) {
    return item.ownerId === currentUser.id;
  }

  if (item.visibility === "shared") return true;

  return item.ownerId === currentUser.id;
}

export function canEditOwnedItem(currentUser, item) {
  if (!currentUser || !item) return false;
  return item.ownerId === currentUser.id;
}

export function withLastEditedBy(item, currentUser) {
  return {
    ...item,
    lastEditedBy: currentUser?.name ?? item.lastEditedBy,
  };
}
