import React, { useState } from 'react';

const restaurants = [
  { name: "De Gouden Lepel", color: "#f5d142", logo: "gouden-lepel.png" },
  { name: "La Bella Vita", color: "#e75480", logo: "bella-vita.png" },
];

const seatOptions = ["Bij het raam", "Buiten", "In de lounge", "Standaard"];

export default function App() {
  const [form, setForm] = useState({
    restaurant: restaurants[0].name,
    name: "", email: "", phone: "", date: "", time: "", seats: 2, seatPreference: seatOptions[0]
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const selectedRestaurant = restaurants.find(r => r.name === form.restaurant);
    await fetch("https://<jouw-backend-url>/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, logo: selectedRestaurant.logo, color: selectedRestaurant.color })
    });
    alert("Boeking succesvol!");
  }

  return (
    <div style={{ background: restaurants.find(r => r.name === form.restaurant).color, minHeight: "100vh" }}>
      <img src={restaurants.find(r => r.name === form.restaurant).logo} alt="logo" style={{ height: 80 }} />
      <h1>Reserveren bij {form.restaurant}</h1>
      <form onSubmit={handleSubmit}>
        <select name="restaurant" value={form.restaurant} onChange={handleChange}>
          {restaurants.map(r => <option key={r.name}>{r.name}</option>)}
        </select>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Naam" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telefoon" required />
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
        <input name="time" type="time" value={form.time} onChange={handleChange} required />
        <input name="seats" type="number" value={form.seats} onChange={handleChange} min={1} max={20} required />
        <select name="seatPreference" value={form.seatPreference} onChange={handleChange}>
          {seatOptions.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <button>Reserveer nu</button>
      </form>
    </div>
  );
}