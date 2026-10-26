import Event from '../models/Event.js';

// Accept only the four editable fields; registration counts remain server-managed.
function getEventInput(body) {
  const fields = ['eventName', 'eventDescription', 'eventDate', 'venue'];
  const input = {};

  for (const field of fields) {
    if (typeof body?.[field] !== 'string' || !body[field].trim()) {
      return { error: 'Event name, description, date, and venue are required.' };
    }
    input[field] = body[field].trim();
  }

  if (input.eventName.length > 120 || input.eventDescription.length > 2000 || input.venue.length > 200) {
    return { error: 'Use at most 120 characters for the name, 2000 for the description, and 200 for the venue.' };
  }

  // The frontend converts DD/MM/YYYY text to YYYY-MM-DD; validate it in UTC.
  const date = new Date(`${input.eventDate}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.eventDate)
    || Number.isNaN(date.getTime())
    || date.toISOString().slice(0, 10) !== input.eventDate) {
    return { error: 'Provide a valid event date in YYYY-MM-DD format.' };
  }

  return { input };
}

export async function getEvents(req, res) {
  const events = await Event.find().sort({ eventDate: 1, createdAt: -1 });
  res.json(events);
}

export async function getEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json(event);
}

export async function createEvent(req, res) {
  const { input, error } = getEventInput(req.body);
  if (error) return res.status(400).json({ message: error });

  const event = await Event.create(input);
  res.status(201).json(event);
}

export async function updateEvent(req, res) {
  const { input, error } = getEventInput(req.body);
  if (error) return res.status(400).json({ message: error });

  const event = await Event.findByIdAndUpdate(req.params.id, input, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json(event);
}

export async function deleteEvent(req, res) {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json({ message: 'Event deleted successfully.' });
}
