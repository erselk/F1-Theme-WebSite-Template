const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchEvents(options?: { featured?: boolean }) {
  const featured = options?.featured ? '?featured=true' : '';
  const response = await fetch(`${API_BASE_URL}/api/events${featured}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  return response.json();
}

export async function fetchEventBySlug(slug: string) {
  const response = await fetch(`${API_BASE_URL}/api/events?slug=${slug}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  
  return response.json();
}

export async function fetchBlogs(options?: { featured?: boolean }) {
  const featured = options?.featured ? '?featured=true' : '';
  const response = await fetch(`${API_BASE_URL}/api/blogs${featured}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch blogs');
  }
  
  return response.json();
}

export async function fetchBlogBySlug(slug: string, options?: { incrementViews?: boolean }) {
  const incrementViews = options?.incrementViews ? '&incrementViews=true' : '';
  const response = await fetch(`${API_BASE_URL}/api/blogs?slug=${slug}${incrementViews}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch blog');
  }
  
  return response.json();
}

export async function fetchBookings() {
  const response = await fetch(`${API_BASE_URL}/api/bookings`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  
  return response.json();
}

export async function fetchBookingByRef(refNumber: string) {
  const response = await fetch(`${API_BASE_URL}/api/bookings?refNumber=${refNumber}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }
  
  return response.json();
}

export async function fetchUserBookings(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/bookings?userId=${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user bookings');
  }
  
  return response.json();
}

export async function createSimulatorBooking(bookingData: any) {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bookingType: 'simulator',
      ...bookingData
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create booking');
  }
  
  return response.json();
}

export async function createEventBooking(bookingData: any) {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bookingType: 'event',
      ...bookingData
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create booking');
  }
  
  return response.json();
}

export async function updateBookingStatus(refNumber: string, status: string) {
  const response = await fetch(`${API_BASE_URL}/api/bookings?refNumber=${refNumber}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update booking');
  }
  
  return response.json();
}

export async function cancelBooking(refNumber: string) {
  const response = await fetch(`${API_BASE_URL}/api/bookings?refNumber=${refNumber}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to cancel booking');
  }
  
  return response.json();
}