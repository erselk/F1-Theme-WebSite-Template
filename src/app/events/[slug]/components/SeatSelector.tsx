'use client';

import React, { useState } from 'react';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { Event } from '@/types';

interface SeatSelectorProps {
  event: Event;
  selectedTickets: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  locale: LanguageType;
}

type Seat = {
  id: string;
  row: string;
  number: number;
  category: string;
  status: 'available' | 'selected' | 'reserved' | 'sold';
};

export function SeatSelector({ event, selectedTickets, locale }: SeatSelectorProps) {
  // Normally we would fetch real seat data from the API based on event
  // For now, let's create a simplified mock seating map
  const [seats, setSeats] = useState<Seat[]>(() => {
    // Generate mock seats
    const mockSeats: Seat[] = [];
    
    // Create rows A-F and seats 1-10 in each row
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    rows.forEach(row => {
      for (let i = 1; i <= 10; i++) {
        // Determine seat category based on row
        let category: string;
        if (row === 'A' || row === 'B') {
          category = 'premium';
        } else if (row === 'C' || row === 'D') {
          category = 'standard';
        } else {
          category = 'economy';
        }
        
        // Randomly mark some seats as reserved or sold
        let status: 'available' | 'reserved' | 'sold' = 'available';
        const randomStatus = Math.random();
        if (randomStatus > 0.85) {
          status = 'sold';
        } else if (randomStatus > 0.7) {
          status = 'reserved';
        }
        
        mockSeats.push({
          id: `${row}${i}`,
          row,
          number: i,
          category,
          status
        });
      }
    });
    
    return mockSeats;
  });
  
  // Calculate how many seats we need to select based on ticket quantities
  const totalTickets = selectedTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  
  // Currently selected seat IDs
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  
  // Handle seat selection
  const handleSeatClick = (seat: Seat) => {
    // Can't select sold or reserved seats
    if (seat.status === 'sold' || seat.status === 'reserved') return;
    
    // Toggle selection
    if (selectedSeatIds.includes(seat.id)) {
      // Deselect seat
      setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
      setSeats(prev => prev.map(s => 
        s.id === seat.id ? { ...s, status: 'available' } : s
      ));
    } else {
      // Check if we've reached the maximum number of seats
      if (selectedSeatIds.length >= totalTickets) {
        // Can't select more seats than tickets
        alert(locale === 'tr' 
          ? `En fazla ${totalTickets} koltuk seçebilirsiniz.`
          : `You can only select up to ${totalTickets} seats.`
        );
        return;
      }
      
      // Select seat
      setSelectedSeatIds(prev => [...prev, seat.id]);
      setSeats(prev => prev.map(s => 
        s.id === seat.id ? { ...s, status: 'selected' } : s
      ));
    }
  };
  
  // Get seat color based on status and category
  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'sold') return 'bg-gray-500 cursor-not-allowed';
    if (seat.status === 'reserved') return 'bg-amber-500 cursor-not-allowed';
    if (seat.status === 'selected') return 'bg-electric-blue';
    
    // Available seats - color by category
    switch (seat.category) {
      case 'premium':
        return 'bg-neon-red hover:bg-neon-red/80';
      case 'standard':
        return 'bg-electric-blue/70 hover:bg-electric-blue/60';
      case 'economy':
        return 'bg-neon-green hover:bg-neon-green/80';
      default:
        return 'bg-gray-300 hover:bg-gray-400';
    }
  };
  
  return (
    <div className="seat-selector">
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-neon-red rounded mr-2"></div>
            <span className="text-sm text-light-grey">{locale === 'tr' ? 'Premium' : 'Premium'}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-electric-blue/70 rounded mr-2"></div>
            <span className="text-sm text-light-grey">{locale === 'tr' ? 'Standart' : 'Standard'}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-neon-green rounded mr-2"></div>
            <span className="text-sm text-light-grey">{locale === 'tr' ? 'Ekonomi' : 'Economy'}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
            <span className="text-sm text-light-grey">{locale === 'tr' ? 'Satıldı' : 'Sold'}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
            <span className="text-sm text-light-grey">{locale === 'tr' ? 'Rezerve' : 'Reserved'}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6 p-2 bg-dark-grey/50 rounded-lg text-center font-medium text-light-grey">
        {locale === 'tr' ? 'SAHNE / ETKİNLİK ALANI' : 'STAGE / EVENT AREA'}
      </div>
      
      <div className="grid grid-cols-10 gap-2 mb-8">
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => handleSeatClick(seat)}
            disabled={seat.status === 'sold' || seat.status === 'reserved'}
            className={`seat flex items-center justify-center w-8 h-8 rounded text-xs font-medium text-white ${getSeatColor(seat)}`}
            title={`${seat.row}${seat.number} - ${seat.category.toUpperCase()}`}
          >
            {seat.row}{seat.number}
          </button>
        ))}
      </div>
      
      <div className="p-4 rounded-lg bg-dark-grey/30 mb-4">
        <h3 className="font-medium mb-2 text-light-grey">
          {locale === 'tr' ? 'Seçilen Koltuklar' : 'Selected Seats'}:
        </h3>
        
        {selectedSeatIds.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedSeatIds.map(id => {
              const seat = seats.find(s => s.id === id)!;
              return (
                <span 
                  key={id} 
                  className="px-2 py-1 rounded bg-electric-blue text-white text-xs"
                >
                  {seat.row}{seat.number}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-silver">
            {locale === 'tr' 
              ? 'Henüz koltuk seçilmedi. Lütfen yukarıdan koltuk seçin.'
              : 'No seats selected yet. Please select seats above.'
            }
          </p>
        )}
      </div>
      
      <div className="flex justify-between text-light-grey">
        <div>
          {locale === 'tr' 
            ? `Seçilmesi gereken koltuk sayısı: ${totalTickets}`
            : `Total seats needed: ${totalTickets}`
          }
        </div>
        <div>
          {locale === 'tr'
            ? `Seçilen: ${selectedSeatIds.length} / ${totalTickets}`
            : `Selected: ${selectedSeatIds.length} / ${totalTickets}`
          }
        </div>
      </div>
    </div>
  );
}