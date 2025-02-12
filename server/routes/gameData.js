const express = require("express");
const router = express.Router();
const { GameData } = require("../models/Association");

// Ruta para guardar una nueva partida
router.post("/save-game", async (req, res) => {
  try {
    const { score, idPlayer } = req.body;

    // Validar que vengan los datos necesarios
    if (!score || !idPlayer) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos necesarios (score o idPlayer)"
      });
    }

    // Crear el registro de la partida
    const gameData = await GameData.create({
      score,
      idPlayer
    });

    // El hook afterCreate se encargará de incrementar gamesPlayed automáticamente

    res.status(201).json({
      success: true,
      message: "Partida guardada exitosamente",
      data: gameData
    });

  } catch (error) {
    console.error("Error al guardar la partida:", error);
    res.status(500).json({
      success: false,
      message: "Error al guardar la partida",
      error: error.message
    });
  }
});

// Obtener todas las partidas de un jugador
router.get("/player-games/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    const games = await GameData.findAll({
      where: { idPlayer: playerId },
      order: [['createdAt', 'DESC']] // Ordenadas por más recientes primero
    });

    res.status(200).json({
      success: true,
      data: games
    });

  } catch (error) {
    console.error("Error al obtener las partidas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las partidas",
      error: error.message
    });
  }
});

module.exports = router;