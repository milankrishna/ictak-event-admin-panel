import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="nav-container">
        <Link className="brand" to="/" aria-label="EventDesk dashboard">
          <span className="brand-mark" aria-hidden="true">E</span>
          <span>EventDesk<small>ADMIN PANEL</small></span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/add-event">Add Event</NavLink>
        </nav>
      </div>
    </header>
  );
}
