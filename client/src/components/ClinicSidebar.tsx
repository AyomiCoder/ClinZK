import { Link, useLocation } from 'react-router-dom';

export default function ClinicSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="clinic-sidebar">
      <div className="sidebar-header">
        <h2>Clinic Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <Link 
          to="/clinic" 
          className={isActive('/clinic') && location.pathname === '/clinic' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/clinic/credentials" 
          className={isActive('/clinic/credentials') ? 'active' : ''}
        >
          Credentials
        </Link>
      </nav>
    </aside>
  );
}

