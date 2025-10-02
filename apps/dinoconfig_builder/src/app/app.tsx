import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Profile, Settings, MultiConfigBuilder } from "./pages";
import BrandAdd from "./brand-add/brand-add";
import Layout from "./layout/layout";
import BrandSelection from "./brand-selection/brand-selection";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/brands" replace />} />
          <Route path="/brands" element={<BrandSelection />} />
          <Route path="/brands/add" element={<BrandAdd />} />
          <Route path="/brands/:brandId/builder" element={<MultiConfigBuilder />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
