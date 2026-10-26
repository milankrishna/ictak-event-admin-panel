import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EventForm from '../components/EventForm.jsx';
import api from '../services/api.js';

export default function EditEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setEvent(null);

    async function loadEvent() {
      try {
        const { data } = await api.get(`/api/events/${id}`, { signal: controller.signal });
        if (!controller.signal.aborted) setEvent(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.response?.data?.message || 'Unable to load this event. Check your connection and try again.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadEvent();
    return () => controller.abort();
  }, [id, retry]);

  return (
    <section className="panel event-page" aria-labelledby="form-heading">
      <p className="eyebrow">EVENT MANAGEMENT</p>
      <h1 id="form-heading">Update event</h1>
      <p className="muted">Keep your event details up to date.</p>
      {loading && <p className="form-loading" role="status">Loading event details…</p>}
      {!loading && error && (
        <div className="form-error-summary" role="alert">
          <p>{error}</p>
          <div className="form-actions">
            <Link className="button button-secondary" to="/">Back to dashboard</Link>
            <button className="button button-primary" onClick={() => setRetry(value => value + 1)}>Try again</button>
          </div>
        </div>
      )}
      {!loading && !error && event?._id === id && <EventForm key={id} event={event} />}
    </section>
  );
}
