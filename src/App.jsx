import Navbar from "./components/Navbar.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { DashboardDataProvider } from "./data/dataStore.js";
import { useDashboardData } from "./data/dataStore.js";
import HomePage from "./pages/HomePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

function RoutedApp() {
  const isSettingsPage = window.location.pathname === "/settings";
  const { cloudError, cloudStatus, isCloudConfigured } = useDashboardData();

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      {!isCloudConfigured ? (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-full border border-[#D9A7B0]/30 bg-white/72 px-4 py-2 text-center text-xs font-semibold text-[#8E6D78] shadow-sm backdrop-blur-xl">
            Cloud sync is not configured. Showing demo data.
          </div>
        </div>
      ) : cloudStatus === "error" ? (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-full border border-[#D9A7B0]/30 bg-white/72 px-4 py-2 text-center text-xs font-semibold text-[#8E6D78] shadow-sm backdrop-blur-xl">
            Cloud sync error: {cloudError || "Please check Supabase settings."}
          </div>
        </div>
      ) : null}
      {isSettingsPage ? <SettingsPage /> : <HomePage />}
    </div>
  );
}

function AppWithUsers() {
  const { dashboardData } = useDashboardData();

  return (
    <UserProvider users={dashboardData.users}>
      <RoutedApp />
    </UserProvider>
  );
}

export default function App() {
  return (
    <DashboardDataProvider>
      <AppWithUsers />
    </DashboardDataProvider>
  );
}
