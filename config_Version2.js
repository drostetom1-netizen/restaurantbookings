module.exports = {
  restaurants: [
    {
      id: "gouden-lepel",
      name: "De Gouden Lepel",
      color: "#F5D142",
      logo: "/assets/gouden-lepel.png",
      seatOptions: ["Bij het raam", "Buiten", "In de lounge", "Standaard"],
      openHours: { start: "17:00", end: "23:00" },
      adminEmail: "manager@goudenlepel.nl",
      owner: { username: "goudenlepel", password: "SterkWachtwoord1" }
    },
    {
      id: "bella-vita",
      name: "La Bella Vita",
      color: "#E75480",
      logo: "/assets/bella-vita.png",
      seatOptions: ["Terras", "Bar", "Salon", "Standaard"],
      openHours: { start: "16:00", end: "22:00" },
      adminEmail: "manager@bellavita.nl",
      owner: { username: "bellavita", password: "SterkWachtwoord2" }
    }
  ],
  admin: {
    username: "admin",
    password: "SterkWachtwoord123!"
  },
  mail: {
    service: "gmail",
    user: "jouwmail@gmail.com",
    pass: "app-password"
  }
};