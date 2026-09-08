import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import OnboardingWelcome from '@/screens/OnboardingWelcome';
import OnboardingInterests from '@/screens/OnboardingInterests';
import GalaxyView from '@/screens/GalaxyView';
import OrbitRoom from '@/screens/OrbitRoom';
import YourSky from '@/screens/YourSky';
import LaunchSpark from '@/screens/LaunchSpark';
import Discover from '@/screens/Discover';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<OnboardingWelcome />} />
          <Route path="/onboarding/interests" element={<OnboardingInterests />} />
          <Route path="/galaxy" element={<GalaxyView />} />
          <Route path="/orbit/:sparkId" element={<OrbitRoom />} />
          <Route path="/sky" element={<YourSky />} />
          <Route path="/launch" element={<LaunchSpark />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
