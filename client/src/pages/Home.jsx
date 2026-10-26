import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export async function deleteConfirmedEvent(event) {
  if (!window.confirm(`Delete "${event.eventName}"? This action cannot be undone.`)) return false;
  await api.delete(`/api/events/${event._id}`);
  return true;
}

function formatDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(date);
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingIds, setDeletingIds] = useState([]);
  const [notice, setNotice] = useState(null);
  const pendingDeletes = useRef(new Set());
  const noticeRef = useRef(null);

  useEffect(() => {
    if (notice) noticeRef.current?.focus();
  }, [notice]);

  async function handleDelete(event) {
    // The ref blocks repeat clicks immediately, before React renders disabled buttons.
    if (pendingDeletes.current.has(event._id)) return;
    pendingDeletes.current.add(event._id);
    setDeletingIds([...pendingDeletes.current]);

    try {
      const deleted = await deleteConfirmedEvent(event);
      if (!deleted) return;
      setEvents(previous => previous.filter(item => item._id !== event._id));
      setNotice({ type: 'success', message: `"${event.eventName}" was deleted successfully.` });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete the event. Check your connection and try again.',
      });
    } finally {
      pendingDeletes.current.delete(event._id);
      setDeletingIds([...pendingDeletes.current]);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setStatus('loading');
      setError('');
      try {
        const { data } = await api.get('/api/events', { signal: controller.signal });
        if (!Array.isArray(data)) throw new Error('Unexpected events response.');
        if (controller.signal.aborted) return;
        setEvents(data);
        setStatus('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(error.response?.data?.message || 'We could not load your events. Check that the backend is running and try again.');
        setStatus('error');
      }
    }

    loadEvents();
    return () => controller.abort();
  }, [refreshKey]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EVENT MANAGEMENT</p>
          <h1>Event dashboard</h1>
          <p className="muted">Your events and registration numbers, all in one place.</p>
        </div>
        <Link className="button button-primary" to="/add-event">+ Add Event</Link>
      </div>

      {notice && <div ref={noticeRef} tabIndex={-1} className={`dashboard-notice notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.message}</div>}

      <section className="panel" aria-labelledby="events-heading" aria-busy={status === 'loading'}>
        <div className="panel-heading">
          <div className="section-title">
            <h2 id="events-heading">All events</h2>
            {status === 'success' && <span className="count-badge">{events.length} {events.length === 1 ? 'event' : 'events'}</span>}
          </div>
          <button className="button button-secondary" type="button" disabled={status === 'loading' || deletingIds.length > 0} onClick={() => setRefreshKey(key => key + 1)}>Refresh</button>
        </div>

        {status === 'loading' && <div className="state-message" role="status"><span className="loading-dot" aria-hidden="true" /><h3>Loading events…</h3><p>Fetching the latest event details.</p></div>}

        {status === 'error' && <div className="state-message error-state" role="alert"><h3>Unable to load events</h3><p>{error}</p><button className="button button-secondary" type="button" onClick={() => setRefreshKey(key => key + 1)}>Try again</button></div>}

        {status === 'success' && events.length === 0 && <div className="state-message" role="status"><span className="empty-mark" aria-hidden="true">+</span><h3>No events yet</h3><p>Your events will appear here once you add your first one.</p><Link className="button button-primary" to="/add-event">Add your first event</Link></div>}

        {status === 'success' && events.length > 0 && (
          <>
            <div className="table-scroll" role="region" aria-label="Events table, scroll horizontally on smaller screens" tabIndex={0}>
              <table>
                <caption className="sr-only">Events and their registration totals</caption>
                <thead><tr>
                  <th scope="col">Event ID</th>
                  <th scope="col">Event Name</th>
                  <th scope="col">Event Date</th>
                  <th scope="col">Venue</th>
                  <th scope="col" className="number-column">Total Registrations</th>
                  <th scope="col">Actions</th>
                </tr></thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event._id}>
                      <td><code className="event-id">{event._id}</code></td>
                      <th scope="row" className="event-name">{event.eventName}</th>
                      <td className="date-cell">{formatDate(event.eventDate)}</td>
                      <td className="venue-cell">{event.venue}</td>
                      <td className="number-column"><span className="registration-badge">{event.totalRegistrations ?? 0}</span></td>
                      <td><div className="row-actions">
                        <Link className="button button-update" to={`/edit-event/${event._id}`} aria-label={`Update ${event.eventName}`}>Update</Link>
                        <button className="button button-delete" type="button" disabled={deletingIds.includes(event._id)} aria-busy={deletingIds.includes(event._id)} aria-label={`${deletingIds.includes(event._id) ? 'Deleting' : 'Delete'} ${event.eventName}`} onClick={() => handleDelete(event)}>{deletingIds.includes(event._id) ? 'Deleting…' : 'Delete'}</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="table-note">On smaller screens, scroll the table to see all columns.</p>
          </>
        )}
      </section>
    </>
  );
}
