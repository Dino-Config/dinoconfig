import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConfigBuilder from "./config-builder";
import BrandAdd from "./brand-add/brand-add";
import { AuthProvider } from "./auth/auth-provider";
import { ProtectedRoute } from "./route/protected-route";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BrandAdd />} />
        <Route path="/builder" element={<ConfigBuilder companyId="1" />} />
      </Routes>
    </Router>
  );
}

export default App;
