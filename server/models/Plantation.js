const mongoose = require('mongoose');

const PlantationSchema = new mongoose.Schema({
  treesToPlant: { type: Number, required: true, default: 0 }, // Árboles acumulados por jugadores
  treesPlanted: { type: Number, required: true, default: 0 }, // Árboles efectivamente plantados
  date: { type: Date, default: Date.now }, // Fecha de actualización
});

module.exports = mongoose.model('Plantation', PlantationSchema);

