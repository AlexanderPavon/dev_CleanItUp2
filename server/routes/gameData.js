const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Plantation = require('../models/Plantation');
const { Op } = require('sequelize'); 


// Actualizar datos del juego del usuario
router.post('/update', async (req, res) => {
  console.log("Solicitud recibida en el backend"); // Log inicial

  const { userId, score } = req.body;
  console.log("Datos recibidos:", { userId, score });

  if (!userId || !score) {
    console.log("Datos inválidos"); // Log de datos inválidos
    return res.status(400).json({ message: 'Faltan datos necesarios.' });
  }

  try {
    const user = await User.findByPk(userId);
    console.log("Usuario encontrado:", user);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualiza datos del usuario
    user.gamesPlayed += 1;
    if (score > user.bestScore) {
      user.bestScore = score;
    }
    if (score >= 250) {
      user.treesObtained += 1;
    }

    await user.save();

    console.log("Usuario actualizado:", user);
    res.status(200).json({
      message: 'Datos del juego actualizados correctamente.',
      user,
    });
  } catch (error) {
    console.error('Error en el backend:', error); // Log del error
    res.status(500).json({ message: 'Error al actualizar datos del juego.' });
  }
});



// Obtener estadísticas del usuario
router.get("/stats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId, {
      attributes: ["bestScore", "gamesPlayed", "treesObtained"],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener estadísticas del usuario:", error);
    res.status(500).json({ error: "Error al obtener estadísticas del usuario" });
  }
});

// Obtener el ranking del usuario
router.get("/top-scores", async (req, res) => {
  try {
    const topScores = await User.findAll({
      order: [["bestScore", "DESC"]], // Ordenar por el puntaje más alto
      limit: 10, // Limitar a los 10 mejores
      attributes: ["id", "username", "bestScore"], // Seleccionar solo las columnas necesarias
    });

    res.status(200).json(topScores);
  } catch (error) {
    console.error("Error al obtener el ranking:", error);
    res.status(500).json({ error: "Error al obtener el ranking" });
  }
});






// Obtener estadísticas de los árboles
router.get('/trees-stats', async (req, res) => {
  try {
    const plantation = await Plantation.findOne(); // Obtiene el único registro
    const totalTreesToPlant = plantation ? plantation.treesToPlant : 0; 
    const totalTreesPlanted = plantation ? plantation.treesPlanted : 0; 

    // Obtener lista de jugadores y sus árboles obtenidos desde PostgreSQL
    const players = await User.findAll({
      attributes: ['username', 'treesObtained'],
      where: { treesObtained: { [Op.gt]: 0 } }, // Condición: árboles obtenidos > 0
    });

    res.status(200).json({
      totalTreesToPlant,
      totalTreesPlanted,
      players: players.map((player) => ({
        username: player.username,
        treesObtained: player.treesObtained,
      })),
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de árboles:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de árboles' });
  }
});


// Actualizar el número de árboles plantados manualmente
router.post('/update-trees-planted', async (req, res) => {
  const { treesPlanted } = req.body;

  if (!treesPlanted || treesPlanted <= 0) {
    return res.status(400).json({ error: 'Cantidad inválida de árboles plantados.' });
  }

  try {
    // 🔥 Buscar o crear el registro único en la colección `Plantation`
    let plantation = await Plantation.findOne();
    if (!plantation) {
      plantation = await Plantation.create({ treesToPlant: 0, treesPlanted: 0 });
    }

    // 🔹 Validar si hay suficientes árboles por plantar
    const remainingTreesToPlant = plantation.treesToPlant - plantation.treesPlanted;
    if (treesPlanted > remainingTreesToPlant) {
      return res.status(400).json({ error: 'No hay suficientes árboles por plantar disponibles.' });
    }

    // 🔥 **Restar de `treesToPlant` y sumar en `treesPlanted`**
    plantation.treesToPlant -= treesPlanted;
    plantation.treesPlanted += treesPlanted;

    // Guardar cambios en MongoDB
    await plantation.save();

    res.status(200).json({
      message: 'Árboles plantados actualizados correctamente.',
      plantation,
    });
  } catch (error) {
    console.error('❌ Error al actualizar árboles plantados:', error);
    res.status(500).json({ error: 'Error al actualizar árboles plantados.' });
  }
});


// Incrementar árboles por plantar (cuando un usuario alcanza 250 puntos)
router.post('/increment-trees-to-plant', async (req, res) => {
  const { treesObtained } = req.body;
  console.log('📩 Datos recibidos en la API:', { treesObtained });

  if (!treesObtained || treesObtained <= 0) {
    console.log('⚠️ Datos inválidos. No se procesa la solicitud.');
    return res.status(400).json({ error: 'Cantidad inválida de árboles por plantar.' });
  }

  try {
    let plantation = await Plantation.findOne();
    console.log('🔎 Resultado de Plantation.findOne():', plantation);

    if (!plantation) {
      console.log('⚠️ No existe un registro en Plantation. Creando uno nuevo...');
      plantation = new Plantation({ treesToPlant: 0, treesPlanted: 0 });
      await plantation.save();
      console.log('✅ Registro de Plantation creado correctamente:', plantation);
    } else {
      console.log('✅ Registro de Plantation encontrado:', plantation);
    }

    plantation.treesToPlant += treesObtained;
    await plantation.save();

    res.status(200).json({ message: 'Árboles por plantar incrementados correctamente.' });
  } catch (error) {
    console.error('❌ Error al incrementar árboles por plantar:', error);
    res.status(500).json({ error: 'Error al incrementar árboles por plantar.' });
  }
});

module.exports = router;
