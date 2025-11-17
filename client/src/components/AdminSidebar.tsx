import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <Link 
          to="/admin" 
          className={isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/admin/issuers" 
          className={isActive('/admin/issuers') ? 'active' : ''}
        >
          Issuers
        </Link>
        <Link 
          to="/admin/trials" 
          className={isActive('/admin/trials') ? 'active' : ''}
        >
          Trials
        </Link>
      </nav>
    </aside>
  );
}

