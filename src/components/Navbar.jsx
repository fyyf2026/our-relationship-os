import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { useDashboardData } from "../data/dataStore.js";

const navTargets = {
  Home: "/#top",
  Memories: "/#memories",
  "Conflict Center": "/#conflict-center",
  Future: "/#future",
  "Wish Box": "/#wish-box",
  Settings: "/settings",
};

function Avatar({ initials, className }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/80 text-xs font-semibold shadow-sm ${className}`}
    >
      {initials}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { dashboardData } = useDashboardData();
  const { currentUser, switchUser } = useCurrentUser();
  const { profile, navItems } = dashboardData;
  const personAInitial = profile.personAName?.charAt(0)?.toUpperCase() || "A";
  const personBInitial = profile.personBName?.charAt(0)?.toUpperCase() || "B";
  const partnerNames = `${profile.personAName} & ${profile.personBName}`;

  return (
    <header className="sticky top-3 z-50 px-4 pt-3 sm:px-6 lg:px-8">
      <div className="glass-nav mx-auto max-w-7xl rounded-full px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <a
            href="#top"
            className="flex min-w-0 items-center gap-3 text-sm font-semibold text-ink sm:text-base"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_6px_rgba(107,175,167,0.16)]" />
            <span className="truncate">Our Relationship OS</span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navItems.map((item) => (
              <a
                key={item}
                href={navTargets[item]}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/70 hover:text-ink"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex -space-x-2">
              <Avatar
                initials={personAInitial}
                className="bg-[#EAF8F5] text-[#4F857F]"
              />
              <Avatar
                initials={personBInitial}
                className="bg-[#EEF7FB] text-[#5D83A1]"
              />
            </div>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="identity-badge">Editing as {currentUser.name}</span>
                <button
                  type="button"
                  className="btn-ghost min-h-9 px-3 text-xs"
                  onClick={switchUser}
                >
                  Switch User
                </button>
              </div>
            ) : (
              <span className="text-sm font-medium text-muted">{partnerNames}</span>
            )}
          </div>

          <button
            type="button"
            className="btn-secondary h-10 w-10 px-0 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {isOpen ? (
          <div className="mt-4 border-t border-white/70 pt-4 lg:hidden">
            <nav className="grid gap-1" aria-label="Mobile main">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={navTargets[item]}
                  className="rounded-2xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/75 hover:text-ink"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/60 px-3 py-2">
              <div className="flex -space-x-2">
                <Avatar
                  initials={personAInitial}
                  className="bg-[#EAF8F5] text-[#4F857F]"
                />
                <Avatar
                  initials={personBInitial}
                  className="bg-[#EEF7FB] text-[#5D83A1]"
                />
              </div>
              <div className="grid justify-items-end gap-1">
                <span className="text-sm font-medium text-muted">
                  {currentUser ? `Editing as ${currentUser.name}` : partnerNames}
                </span>
                {currentUser ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary"
                    onClick={switchUser}
                  >
                    Switch User
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
