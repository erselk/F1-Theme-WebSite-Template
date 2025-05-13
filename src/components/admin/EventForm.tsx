'use client';

import { Event } from '@/types';
import EventFormModular from './event-form/EventForm';

interface EventFormProps {
  event?: Event;
  onSubmit: (eventData: Partial<Event>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function EventForm({ event, onSubmit, onCancel, isSubmitting }: EventFormProps) {
  return (
    <EventFormModular 
      event={event}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  );
}