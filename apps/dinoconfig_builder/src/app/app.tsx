import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConfigBuilder from "./config-builder";
import BrandAdd from "./brand-add/brand-add";
import BrandSelection from "./brand-selection/brand-selection";
import { AuthProvider } from "./auth/auth-provider";
import { ProtectedRoute } from "./route/protected-route";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BrandSelection />} />
        <Route path="/brand-add" element={<BrandAdd />} />
        <Route path="/builder/:brandId" element={<ConfigBuilder />} />
        <Route path="/builder" element={<ConfigBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;
