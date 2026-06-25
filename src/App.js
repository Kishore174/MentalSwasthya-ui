import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Admin/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
// import RoleRoute from "./routes/RoleRoute";
import Mainfol from "./Admin/Mainfol";
import { AuthProvider } from "./context/AuthContext";
import Unauthorized from "./routes/Unauthorized";
import SplashScreen from "./Admin/SplashScreen";
import AboutMentalSwasthya from "./Admin/AboutMentalSwasthya";
import Dashboard from "./Admin/Dashboard";
import MeditationScreen from "./Admin/MeditationScreen";
import AffirmationsScreen from "./Admin/AffirmationsScreen";
import MeditationPlaylistScreen from "./Admin/MeditationPlaylistScreen";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

<Route element={<ProtectedRoute />}>
  <Route path="/splash" element={<SplashScreen />} />
  <Route path="/about" element={<AboutMentalSwasthya />} />
  <Route path="/" element={<Mainfol />}>
    <Route index element={<Dashboard />} />
    <Route path="meditation" element={<MeditationScreen />} />
    <Route path="affirmations" element={<AffirmationsScreen />} />
    <Route path="meditation-playlist" element={<MeditationPlaylistScreen />} />
    {/* <Route path="users" element={<Users />} /> */}


  </Route>
</Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
