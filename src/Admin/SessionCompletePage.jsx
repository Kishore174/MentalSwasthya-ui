import React from "react";
import { useNavigate } from "react-router-dom";
import CompletionScreen from "../components/CompletionScreen";
import { getTodayProgress } from "../utils/dailyProgress";

// "Last page": today's progress, streak and share prompt. Reached from the dashboard when the user
// doesn't pick another wellness tool right after finishing one (see Dashboard).
const SessionCompletePage = () => {
  const navigate = useNavigate();
  const goDashboard = () => navigate("/app", { replace: true });

  return (
    <CompletionScreen
      onDone={goDashboard}
      onReset={goDashboard}
      stepStatus={getTodayProgress()}
      streakDays={1}
      referralCount={2}
      refLink="mentalswasthya.com/ref/MS-REF2026"
    />
  );
};

export default SessionCompletePage;
