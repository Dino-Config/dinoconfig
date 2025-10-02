import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Profile, Settings, MultiConfigBuilder } from "./pages";
import BrandAdd from "./brand-add/brand-add";
import BrandSelection from "./brand-selection/brand-selection";
import Layout from "./layout/layout";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<BrandSelection />} />
          <Route path="brand-selection" element={<BrandSelection />} />
          <Route path="brand-add" element={<BrandAdd />} />
          <Route path="builder/:brandId" element={<MultiConfigBuilder />} />
          <Route path="builder" element={<MultiConfigBuilder />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
