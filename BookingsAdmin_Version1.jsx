import React, { useEffect, useState } from 'react';

export default function BookingsAdmin({ restaurant }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`https://<jouw-backend-url>/api/bookings/${restaurant}`)
      .then(res => res.json())
      .then(setBookings);
  }, [restaurant]);

  return (
    <div>
      <h2>Boekingen voor {restaurant}</h2>
      <ul>
        {bookings.map(b => (
          <li key={b._id}>
            {b.date} {b.time} - {b.name} ({b.seats} personen, voorkeur: {b.seatPreference})
          </li>
        ))}
      </ul>
    </div>
  );
}