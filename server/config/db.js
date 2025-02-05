const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");

// 🔹 Conexión a PostgreSQL
const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  logging: false, // Desactiva logs en la consola
});

// 🔹 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = { sequelize, mongoose };
