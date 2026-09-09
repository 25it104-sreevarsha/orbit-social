import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import OnboardingWelcome from '@/screens/OnboardingWelcome';
import OnboardingIdentity from '@/screens/OnboardingIdentity';
import OnboardingInterests from '@/screens/OnboardingInterests';
import GalaxyView from '@/screens/GalaxyView';
import OrbitRoom from '@/screens/OrbitRoom';
import YourSky from '@/screens/YourSky';
import LaunchSpark from '@/screens/LaunchSpark';
import Discover from '@/screens/Discover';

// The app is always populated and reachable, even on a completely fresh
// browser/session: AppContext seeds a safe demo identity and interests
// (persisted to localStorage from that point on), so none of the main
// screens need to gate on onboarding having been completed. Onboarding
// remains available as an optional, explicit "Create your Sky" flow for
// anyone who wants to personalize their name/avatar/interests — it just
// no longer blocks access to the product.
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/galaxy" replace />} />
          <Route path="/onboarding" element={<OnboardingWelcome />} />
          <Route path="/onboarding/identity" element={<OnboardingIdentity />} />
          <Route path="/onboarding/interests" element={<OnboardingInterests />} />
          <Route path="/galaxy" element={<GalaxyView />} />
          <Route path="/orbit/:sparkId" element={<OrbitRoom />} />
          <Route path="/sky" element={<YourSky />} />
          <Route path="/launch" element={<LaunchSpark />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="*" element={<Navigate to="/galaxy" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
