import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const fields = [
  { name: 'eventName', label: 'Event Name', maxLength: 120 },
  { name: 'eventDescription', label: 'Event Description', maxLength: 2000, multiline: true },
  { name: 'eventDate', label: 'Event Date', maxLength: 10, placeholder: 'DD/MM/YYYY' },
  { name: 'venue', label: 'Venue', maxLength: 200 },
];

export function toApiDate(displayDate) {
  return displayDate.trim().split('/').reverse().join('-');
}

export function validateEvent(values) {
  const errors = {};
  for (const field of fields) {
    const value = values[field.name]?.trim() || '';
    if (!value) errors[field.name] = `${field.label} is required.`;
    else if (field.maxLength && value.length > field.maxLength) {
      errors[field.name] = `Use at most ${field.maxLength} characters.`;
    }
  }
  if (values.eventDate && !errors.eventDate) {
    const displayDate = values.eventDate.trim();
    const apiDate = toApiDate(displayDate);
    const date = new Date(`${apiDate}T00:00:00.000Z`);
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(displayDate)
      || Number.isNaN(date.getTime())
      || date.toISOString().slice(0, 10) !== apiDate) {
      errors.eventDate = 'Enter a valid date in DD/MM/YYYY format.';
    }
  }
  return errors;
}

export default function EventForm({ event }) {
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [values, setValues] = useState({
    eventName: event?.eventName || '',
    eventDescription: event?.eventDescription || '',
    eventDate: event?.eventDate?.slice(0, 10).split('-').reverse().join('/') || '',
    venue: event?.venue || '',
  });
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues(previous => ({ ...previous, [name]: value }));
    setErrors(previous => ({ ...previous, [name]: '' }));
    setSaveError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current) return;
    const validation = validateEvent(values);
    setErrors(validation);
    if (Object.keys(validation).length) {
      e.currentTarget.elements.namedItem(Object.keys(validation)[0])?.focus();
      return;
    }

    submitting.current = true;
    setSaving(true);
    setSaveError('');
    const payload = Object.fromEntries(fields.map(field => [field.name, values[field.name].trim()]));
    payload.eventDate = toApiDate(payload.eventDate);
    try {
      if (event) await api.put(`/api/events/${event._id}`, payload);
      else await api.post('/api/events', payload);
      navigate('/');
    } catch (error) {
      setSaveError(error.response?.data?.message || 'Unable to save the event. Check your connection and try again.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit} noValidate aria-busy={saving}>
      <p className="form-hint">All fields are required. Registration totals are managed automatically.</p>
      {saveError && <p className="form-error-summary" role="alert">{saveError}</p>}
      <fieldset disabled={saving}>
        <legend className="sr-only">Event details</legend>
        {fields.map(field => {
          const Input = field.multiline ? 'textarea' : 'input';
          return (
            <div className="form-field" key={field.name}>
              <label htmlFor={field.name}>{field.label} <span aria-hidden="true">*</span></label>
              <Input
                id={field.name}
                name={field.name}
                type={field.multiline ? undefined : field.type || 'text'}
                rows={field.multiline ? 5 : undefined}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={[field.name === 'eventDate' ? 'eventDate-hint' : '', errors[field.name] ? `${field.name}-error` : ''].filter(Boolean).join(' ') || undefined}
              />
              {field.name === 'eventDate' && <p className="form-hint" id="eventDate-hint">Day / Month / Year — for example, 25/12/2026.</p>}
              {errors[field.name] && <p className="field-error" id={`${field.name}-error`} role="alert">{errors[field.name]}</p>}
            </div>
          );
        })}
        <div className="form-actions">
          <button className="button button-secondary" type="button" onClick={() => navigate('/')}>Cancel</button>
          <button className="button button-primary" type="submit">{saving ? 'Saving…' : event ? 'Save changes' : 'Create event'}</button>
        </div>
      </fieldset>
      {saving && <p className="form-hint" role="status">Saving your event. Please wait…</p>}
    </form>
  );
}
