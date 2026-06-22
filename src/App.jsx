import Navbar from "./components/Navbar.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { DashboardDataProvider } from "./data/dataStore.js";
import { useDashboardData } from "./data/dataStore.js";
import HomePage from "./pages/HomePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

function RoutedApp() {
  const isSettingsPage = window.location.pathname === "/settings";

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
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
