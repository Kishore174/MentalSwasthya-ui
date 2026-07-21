import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Admin/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
// import RoleRoute from "./routes/RoleRoute";
import Mainfol from "./Admin/Mainfol";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Unauthorized from "./routes/Unauthorized";
import SplashScreen from "./Admin/SplashScreen";
import AboutMentalSwasthya from "./Admin/AboutMentalSwasthya";
import Dashboard from "./Admin/Dashboard";
import MeditationScreen from "./Admin/MeditationScreen";
import AffirmationsScreen from "./Admin/AffirmationsScreen";
import MeditationPlaylistScreen from "./Admin/MeditationPlaylistScreen";
import LandingPage from "./Admin/LandingPage";
import IntentionsScreen from "./Admin/IntentionsScreen";
import ContactScreen from "./Admin/ContactScreen";
import SubscriptionScreen from "./Admin/SubscriptionScreen";
import GiftCardsScreen from "./Admin/GiftCardsScreen";
import AchievementsScreen from "./Admin/AchievementsScreen";

const HomeRoute = () => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? <Navigate to="/app" replace /> : <LandingPage />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/about" element={<AboutMentalSwasthya />} />
            <Route path="/app" element={<Mainfol />}>
              <Route index element={<Dashboard />} />
              <Route path="about" element={<AboutMentalSwasthya />} />
              <Route path="meditation" element={<MeditationScreen />} />
              <Route path="affirmations" element={<AffirmationsScreen />} />
              <Route path="meditation-playlist" element={<MeditationPlaylistScreen />} />
              <Route path="intentions" element={<IntentionsScreen />} />
              <Route path="contact" element={<ContactScreen />} />
              <Route path="subscription" element={<SubscriptionScreen />} />
              <Route path="gift-cards" element={<GiftCardsScreen />} />
              <Route path="achievements" element={<AchievementsScreen />} />
              {/* <Route path="users" element={<Users />} /> */}
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
