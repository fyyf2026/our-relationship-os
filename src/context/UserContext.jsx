import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import IdentityModal from "../components/IdentityModal.jsx";

const CURRENT_USER_KEY = "currentUser";
const LEGACY_CURRENT_USER_KEY = "our-relationship-os:currentUser";
const UserContext = createContext(null);

export function UserProvider({ users, children }) {
  const [currentUserId, setCurrentUserId] = useState(() => {
    if (typeof window === "undefined") return null;
    return (
      window.localStorage.getItem(CURRENT_USER_KEY) ??
      window.localStorage.getItem(LEGACY_CURRENT_USER_KEY)
    );
  });

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) ?? null,
    [currentUserId, users],
  );

  useEffect(() => {
    if (currentUserId && !currentUser) {
      window.localStorage.removeItem(CURRENT_USER_KEY);
      window.localStorage.removeItem(LEGACY_CURRENT_USER_KEY);
      setCurrentUserId(null);
    }
  }, [currentUser, currentUserId]);

  const selectUser = useCallback((userId) => {
    window.localStorage.setItem(CURRENT_USER_KEY, userId);
    window.localStorage.removeItem(LEGACY_CURRENT_USER_KEY);
    setCurrentUserId(userId);
  }, []);

  const switchUser = useCallback(() => {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.localStorage.removeItem(LEGACY_CURRENT_USER_KEY);
    setCurrentUserId(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      currentUserId,
      selectUser,
      switchUser,
      users,
    }),
    [currentUser, currentUserId, selectUser, switchUser, users],
  );

  return (
    <UserContext.Provider value={value}>
      {children}
      {!currentUser ? <IdentityModal users={users} onSelectUser={selectUser} /> : null}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const value = useContext(UserContext);
  if (!value) {
    throw new Error("useCurrentUser must be used inside UserProvider");
  }
  return value;
}
