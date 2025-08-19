const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const session = require('express-session');
const config = require('./config');
const app = express();

mongoose.connect('mongodb+srv://<username>:<password>@cluster.mongodb.net/booking', { useNewUrlParser: true });

const bookingSchema = new mongoose.Schema({
  restaurantId: String,
  name: String,
  email: String,
  phone: String,
  date: String,
  time: String,
  seats: Number,
  seatPreference: String,
  specialRequest: String,
  isChecked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'superSecretSessionKey!',
  resave: false,
  saveUninitialized: true
}));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: config.mail.service,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass
  }
});

// --- AUTHENTICATIE ---

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === config.admin.username && password === config.admin.password) {
    req.session.role = "admin";
    res.json({ success: true, role: "admin" });
  } else {
    res.status(401).json({ success: false, message: "Foutieve login" });
  }
});

// Owner login
app.post('/api/owner/login', (req, res) => {
  const { username, password } = req.body;
  const restaurant = config.restaurants.find(r => r.owner.username === username && r.owner.password === password);
  if (restaurant) {
    req.session.role = "owner";
    req.session.restaurantId = restaurant.id;
    res.json({ success: true, role: "owner", restaurantId: restaurant.id });
  } else {
    res.status(401).json({ success: false, message: "Foutieve login" });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// AUTH MIDDLEWARE
function requireAdmin(req, res, next) {
  if (req.session.role === "admin") return next();
  res.status(403).json({ message: "Niet geautoriseerd" });
}
function requireOwner(req, res, next) {
  if (req.session.role === "owner") return next();
  res.status(403).json({ message: "Niet geautoriseerd" });
}

// --- BOEKINGEN ---

// Maak boeking
app.post('/api/book', async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();

  const restaurant = config.restaurants.find(r => r.id === booking.restaurantId);

  // Mail aan gast
  const mailOptionsGuest = {
    from: `"${restaurant.name}" <${config.mail.user}>`,
    to: booking.email,
    subject: `Bevestiging reservering bij ${restaurant.name}`,
    html: `
      <img src="${restaurant.logo}" style="height:70px" alt="logo"/><h2>Bedankt voor uw reservering!</h2>
      <ul>
        <li>Restaurant: ${restaurant.name}</li>
        <li>Naam: ${booking.name}</li>
        <li>Datum: ${booking.date}</li>
        <li>Tijd: ${booking.time}</li>
        <li>Aantal personen: ${booking.seats}</li>
        <li>Zitvoorkeur: ${booking.seatPreference}</li>
        <li>Speciaal verzoek: ${booking.specialRequest || "-"}</li>
      </ul>
      <p>We kijken uit naar uw komst!</p>
    `
  };

  // Mail aan eigenaar
  const mailOptionsAdmin = {
    from: `"Reservering Systeem" <${config.mail.user}>`,
    to: restaurant.adminEmail,
    subject: `Nieuwe reservering: ${booking.name}`,
    html: `
      <h2>Nieuwe reservering ontvangen</h2>
      <ul>
        <li>Naam: ${booking.name}</li>
        <li>Email: ${booking.email}</li>
        <li>Telefoon: ${booking.phone}</li>
        <li>Datum: ${booking.date}</li>
        <li>Tijd: ${booking.time}</li>
        <li>Aantal personen: ${booking.seats}</li>
        <li>Zitvoorkeur: ${booking.seatPreference}</li>
        <li>Speciaal verzoek: ${booking.specialRequest || "-"}</li>
      </ul>
    `
  };

  try {
    await transporter.sendMail(mailOptionsGuest);
    await transporter.sendMail(mailOptionsAdmin);
    res.status(201).send({ success: true, message: "Boeking en mails succesvol verstuurd!" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Boeking opgeslagen, maar mails konden niet worden verstuurd.", error });
  }
});

// --- ADMIN ENDPOINTS ---

// Bekijk alle boekingen per restaurant (admin)
app.get('/api/bookings/:restaurantId', requireAdmin, async (req, res) => {
  const bookings = await Booking.find({ restaurantId: req.params.restaurantId }).sort({ createdAt: -1 });
  res.json(bookings);
});

// Verwijder boeking (admin)
app.delete('/api/booking/:id', requireAdmin, async (req, res) => {
  await Booking.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

// Bewerk boeking (admin)
app.put('/api/booking/:id', requireAdmin, async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

// --- OWNER ENDPOINTS ---

// Bekijk boekingen als eigenaar
app.get('/api/owner/bookings', requireOwner, async (req, res) => {
  const bookings = await Booking.find({ restaurantId: req.session.restaurantId }).sort({ createdAt: -1 });
  res.json(bookings);
});

// Afvinken van boeking als eigenaar
app.post('/api/owner/booking/check/:id', requireOwner, async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { isChecked: true });
  res.json({ success: true });
});

// --- PUBLIEKE ENDPOINTS ---

// Restaurantconfig ophalen
app.get('/api/restaurants', (req, res) => {
  res.json(config.restaurants.map(({ owner, ...rest }) => rest)); // owner niet publiek
});

app.listen(3001, () => console.log('Server running on port 3001'));