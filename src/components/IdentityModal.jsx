export default function IdentityModal({ users, onSelectUser }) {
  return (
    <div className="identity-modal-backdrop" role="presentation">
      <div className="identity-modal" role="dialog" aria-modal="true">
        <div className="mb-6 text-center">
          <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-[#EAF8F5] px-3 py-1 text-xs font-semibold text-primary">
            Relationship OS
          </p>
          <h2 className="text-3xl font-semibold text-ink">Who are you?</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Choose your identity to enter this relationship space.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className="identity-option"
              onClick={() => onSelectUser(user.id)}
            >
              <span className="identity-avatar">{user.shortName}</span>
              <span className="text-left">
                <span className="block text-base font-semibold text-ink">
                  {user.name}
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted">
                  Owner of {user.name}&apos;s notes, wishes, and private content.
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
