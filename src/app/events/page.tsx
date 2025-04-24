import { Metadata } from 'next';
import { EventList } from '@/components/features/events/EventList';
import { EventPageHeader } from '@/components/features/events/EventPageHeader';

export const metadata: Metadata = {
  title: 'Events | Padok Club',
  description: 'Upcoming events and activities for motorsport enthusiasts',
};

export default function EventsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <EventPageHeader />
      <EventList />
    </main>
  );
}