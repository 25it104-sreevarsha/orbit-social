import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import OnboardingWelcome from '@/screens/OnboardingWelcome';
import OnboardingIdentity from '@/screens/OnboardingIdentity';
import OnboardingInterests from '@/screens/OnboardingInterests';
import GalaxyView from '@/screens/GalaxyView';
import OrbitRoom from '@/screens/OrbitRoom';
import YourSky from '@/screens/YourSky';
import LaunchSpark from '@/screens/LaunchSpark';
import Discover from '@/screens/Discover';

// Guards the main app screens: if someone lands here directly (a refresh,
// a bookmarked or shared deep link) without having set an identity and
// interests yet, send them back to onboarding instead of showing a blank
// name/avatar everywhere. All app state is in-memory only, so a hard
// refresh always needs to re-run onboarding by design.
function RequireOnboarding({ children }: { children: JSX.Element }) {
  const { hasSetIdentity, selectedInterests } = useApp();
  if (!hasSetIdentity || selectedInterests.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<OnboardingWelcome />} />
          <Route path="/onboarding/identity" element={<OnboardingIdentity />} />
          <Route path="/onboarding/interests" element={<OnboardingInterests />} />
          <Route path="/galaxy" element={<RequireOnboarding><GalaxyView /></RequireOnboarding>} />
          <Route path="/orbit/:sparkId" element={<RequireOnboarding><OrbitRoom /></RequireOnboarding>} />
          <Route path="/sky" element={<RequireOnboarding><YourSky /></RequireOnboarding>} />
          <Route path="/launch" element={<RequireOnboarding><LaunchSpark /></RequireOnboarding>} />
          <Route path="/discover" element={<RequireOnboarding><Discover /></RequireOnboarding>} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
