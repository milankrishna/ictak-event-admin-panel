import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Navbar from './components/Navbar.jsx';
import AddEvent from './pages/AddEvent.jsx';
import EditEvent from './pages/EditEvent.jsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-event" element={<AddEvent />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="*" element={<section className="panel placeholder"><h1>Page not found</h1><Link className="button button-primary" to="/">Go to dashboard</Link></section>} />
        </Routes>
      </main>
    </>
  );
}
