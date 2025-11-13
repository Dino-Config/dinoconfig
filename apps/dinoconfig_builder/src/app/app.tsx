import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Profile, Settings, Features, SdkApiKeys, MultiConfigBuilder, SubscriptionPage, SubscriptionSuccess, SubscriptionCancel, EmailVerificationPending } from "./pages";
import BrandAdd from "./brand-add/brand-add";
import Layout from "./layout/layout";
import BrandSelection from "./brand-selection/brand-selection";
import { LimitViolationGuard, EmailVerificationGuard } from "./components";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verify-email" element={<EmailVerificationPending />} />
        <Route path="/" element={
      <LimitViolationGuard>
            <EmailVerificationGuard>
              <Layout />
            </EmailVerificationGuard>
          </LimitViolationGuard>
        }>
            <Route index element={<Navigate to="/brands" replace />} />
            <Route path="/brands" element={<BrandSelection />} />
            <Route path="/brands/add" element={<BrandAdd />} />
            <Route path="/brands/:brandId/builder" element={<MultiConfigBuilder />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/sdk" element={<SdkApiKeys />} />
            <Route path="settings/features" element={<Features />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="subscription/success" element={<SubscriptionSuccess />} />
            <Route path="subscription/cancel" element={<SubscriptionCancel />} />
          </Route>
        </Routes>
    </Router>
  );
}

export default App;
