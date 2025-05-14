'use client';
import React from 'react';

interface VenueCardProps {
  venue: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
  isSelected: boolean;
  onSelect: (venueId: string) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      className={`p-6 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-primary/10 border-2 border-primary"
          : "bg-card hover:shadow-md border border-border"
      }`}
      onClick={() => onSelect(venue.id)}
    >
      <div className="text-4xl mb-3">{venue.icon}</div>
      <h3 className="text-xl font-bold mb-2">{venue.title}</h3>
      <p className="text-muted-foreground">{venue.description}</p>
    </div>
  );
};

export default React.memo(VenueCard);