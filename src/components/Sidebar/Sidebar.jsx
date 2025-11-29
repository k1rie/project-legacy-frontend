import { Link, useLocation } from 'react-router-dom';
import { Users, BookOpen, Home, Sparkles } from 'lucide-react';
import styles from './Sidebar.module.css';

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <Link to="/" className={styles.logo}>
          <Sparkles className={styles.logoIcon} size={24} />
        </Link>
        
        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navItem} ${location.pathname === '/' ? styles.active : ''}`}
            title="Inicio"
          >
            <Home size={20} />
          </Link>
          <Link
            to="/grupos"
            className={`${styles.navItem} ${isActive('/grupos') ? styles.active : ''}`}
            title="Grupos"
          >
            <Users size={20} />
          </Link>
          <Link
            to="/clases"
            className={`${styles.navItem} ${isActive('/clases') ? styles.active : ''}`}
            title="Clases"
          >
            <BookOpen size={20} />
          </Link>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;

