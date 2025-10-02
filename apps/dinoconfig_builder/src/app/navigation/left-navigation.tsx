import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoHammerOutline, IoPersonOutline, IoSettingsOutline } from "react-icons/io5";
import "./left-navigation.scss";

type LeftNavigationProps = {
  isCollapsed: boolean;
  onToggle: () => void;
  activeItem: 'builder' | 'profile' | 'settings';
};

export default function LeftNavigation({ isCollapsed, onToggle, activeItem }: LeftNavigationProps) {
  const navigate = useNavigate();

  const goBuilder = () => {
    const lastBrandId = localStorage.getItem('lastBrandId');
    navigate(`/builder/${lastBrandId}`);
  };

  const goProfile = () => navigate(`/profile`);
  const goSettings = () => navigate(`/settings`);

  return (
    <nav className={`left-navigation ${isCollapsed ? 'collapsed' : ''}`}>
      <div className={`nav-header ${isCollapsed ? 'collapsed' : ''}`}>
        {isCollapsed ? (
          <img 
            src="assets/dinoconfig-logo.svg" 
            alt="DinoConfig" 
            className="nav-logo clickable-logo"
            onClick={onToggle}
          />
        ) : (
          <>
            <h2 
              className="nav-title-clickable"
              onClick={onToggle}
            >
              DinoConfig Builder
            </h2>
          </>
        )}
      </div>

      <div className="nav-sections">
        <div className="nav-section">
          <h3 className={`nav-section-title ${isCollapsed ? 'hidden' : ''}`}>Main</h3>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeItem === 'builder' ? 'active' : ''}`}
                onClick={goBuilder}
              >
                <IoHammerOutline className="nav-icon" />
                <span className={isCollapsed ? 'hidden' : ''}>Builder</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <h3 className={`nav-section-title ${isCollapsed ? 'hidden' : ''}`}>Account</h3>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeItem === 'profile' ? 'active' : ''}`}
                onClick={goProfile}
              >
                <IoPersonOutline className="nav-icon" />
                <span className={isCollapsed ? 'hidden' : ''}>Profile</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeItem === 'settings' ? 'active' : ''}`}
                onClick={goSettings}
              >
                <IoSettingsOutline className="nav-icon" />
                <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="nav-footer">
        <button className="btn back-button" onClick={() => navigate('/') }>
          <IoChevronBack />
          <span className={isCollapsed ? 'hidden' : ''}>Back to Brands</span>
        </button>
      </div>
    </nav>
  );
}



