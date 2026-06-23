// This is client-side role-based editing for prototype use.
// Real production permissions should be enforced by Supabase Auth and RLS.
// Current shared-use phase allows either selected partner to edit while owner
// badges keep authorship visible in the UI.
export function canEditItem(currentUser, item) {
  if (!currentUser || !item) return false;
  return true;
}

export function canEditOwnedItem(currentUser, item) {
  if (!currentUser || !item) return false;
  return true;
}

export function withLastEditedBy(item, currentUser) {
  return {
    ...item,
    lastEditedBy: currentUser?.name ?? item.lastEditedBy,
  };
}
