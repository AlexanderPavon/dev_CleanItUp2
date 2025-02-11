require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/db"); 

// Importar modelos y sus asociaciones
const { 
  User,
  Character,
  GameData,
  Achievements,
  Ranking
} = require("./models/Association");

// Importar rutas
const characterRoutes = require("./routes/characters");
const authRoutes = require("./routes/auth");
const gameDataRoutes = require("./routes/gameData");

const app = express();

console.log("JWT_SECRET:", process.env.JWT_SECRET);

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/game-data", gameDataRoutes);

// Sincronizar base de datos
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log(" Base de datos PostgreSQL sincronizada correctamente");
  } catch (error) {
    console.error(" Error al sincronizar PostgreSQL:", error);
  }
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});