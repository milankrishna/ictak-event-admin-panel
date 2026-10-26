import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true, trim: true, maxlength: 120 },
  eventDescription: { type: String, required: true, trim: true, maxlength: 2000 },
  eventDate: { type: Date, required: true },
  venue: { type: String, required: true, trim: true, maxlength: 200 },
  totalRegistrations: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
