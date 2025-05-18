import { prisma } from './prisma';
import type { Booking, BookingStatus } from '@prisma/client';

function generateRefNumber() {
  const prefix = 'PDK';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export async function getAllBookings() {
  return prisma.booking.findMany({
    orderBy: { startTime: 'desc' },
    include: {
      user: true,
      simulator: true,
      event: true
    }
  });
}

export async function getBookingByRef(refNumber: string) {
  return prisma.booking.findUnique({
    where: { refNumber },
    include: {
      user: true,
      simulator: true,
      event: true,
      payment: true
    }
  });
}

export async function getBookingsByUser(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
    include: {
      simulator: true,
      event: true
    }
  });
}

export async function createSimulatorBooking(bookingData: {
  userId: string;
  simulatorId: string;
  name: string;
  email: string;
  phone?: string;
  startTime: Date | string;
  endTime: Date | string;
  people?: number;
  totalPrice: number;
  notes?: string;
  status?: BookingStatus;
}) {
  return prisma.booking.create({
    data: {
      ...bookingData,
      refNumber: generateRefNumber(),
      startTime: typeof bookingData.startTime === 'string' 
        ? new Date(bookingData.startTime) 
        : bookingData.startTime,
      endTime: typeof bookingData.endTime === 'string' 
        ? new Date(bookingData.endTime) 
        : bookingData.endTime,
      people: bookingData.people || 1,
      status: bookingData.status || 'PENDING'
    }
  });
}

export async function createEventBooking(bookingData: {
  userId: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  startTime: Date | string;
  endTime: Date | string;
  people?: number;
  totalPrice: number;
  notes?: string;
  status?: BookingStatus;
}) {
  return prisma.booking.create({
    data: {
      ...bookingData,
      refNumber: generateRefNumber(),
      startTime: typeof bookingData.startTime === 'string' 
        ? new Date(bookingData.startTime) 
        : bookingData.startTime,
      endTime: typeof bookingData.endTime === 'string' 
        ? new Date(bookingData.endTime) 
        : bookingData.endTime,
      people: bookingData.people || 1,
      status: bookingData.status || 'PENDING'
    }
  });
}

export async function updateBookingStatus(refNumber: string, status: BookingStatus) {
  return prisma.booking.update({
    where: { refNumber },
    data: { status }
  });
}

export async function cancelBooking(refNumber: string) {
  return prisma.booking.update({
    where: { refNumber },
    data: { status: 'CANCELLED' }
  });
}

export async function deleteBooking(refNumber: string) {
  return prisma.booking.delete({
    where: { refNumber }
  });
}