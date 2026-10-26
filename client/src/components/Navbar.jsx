import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="nav-container">
        <Link className="brand" to="/" aria-label="koot. dashboard">
          <span className="brand-name">koot.</span>
          <small lang="ml">കൂട്ടായ്മ</small>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/add-event">Add Event</NavLink>
        </nav>
      </div>
    </header>
  );
}
