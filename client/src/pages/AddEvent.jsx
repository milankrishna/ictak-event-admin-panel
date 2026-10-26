import EventForm from '../components/EventForm.jsx';

export default function AddEvent() {
  return (
    <section className="panel event-page" aria-labelledby="form-heading">
      <p className="eyebrow">EVENT MANAGEMENT</p>
      <h1 id="form-heading">Add event</h1>
      <p className="muted">Plan your next event. Add the details below to get started.</p>
      <EventForm />
    </section>
  );
}
