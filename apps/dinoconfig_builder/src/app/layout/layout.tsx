// Layout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import LeftNavigation from "../navigation/left-navigation";
import "./layout.scss";

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Map current URL to active menu item
  const activeItem =
    location.pathname.startsWith("/builder") ? "builder" :
    location.pathname.startsWith("/profile") ? "profile" :
    location.pathname.startsWith("/settings") ? "settings" :
    "builder";

  return (
    <div className="app-layout">
      <LeftNavigation
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        activeItem={activeItem as "builder" | "profile" | "settings"}
      />

      <div className="main-area">
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}