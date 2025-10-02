import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConfigBuilder from "./builder/config-builder";
import BrandAdd from "./brand-add/brand-add";
import BrandSelection from "./brand-selection/brand-selection";
import ProfilePage from "./builder/profile/profile";
import SettingsPage from "./builder/settings/settings";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BrandSelection />} />
        <Route path="/brand-add" element={<BrandAdd />} />
        <Route path="/builder/:brandId" element={<ConfigBuilder />} />
        <Route path="/builder" element={<ConfigBuilder />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
