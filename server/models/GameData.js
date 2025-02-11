const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const GameData = sequelize.define("GameData", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },

  score: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { 
        args: [0],
        msg: "El puntaje no puede ser negativo"
      }
    }
  },

  idPlayer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
}, {
  tableName: "GameData",
  timestamps: true,
  
  indexes: [
    {
      name: "gamedata_player_idx",
      fields: ["idPlayer"]
    },
    {
      name: "gamedata_score_idx",
      fields: ["score"]
    }
  ],

  hooks: {
    afterCreate: async (gameData) => {
      // Actualizar bestScore en User si es necesario
      const User = require('./User'); // Importar el modelo User
      const user = await User.findByPk(gameData.idPlayer);
      
      if (user && gameData.score > user.bestScore) {
        await user.update({
          bestScore: gameData.score,
          gamesPlayed: user.gamesPlayed + 1
        });
        console.log(`🎮 Nuevo mejor puntaje para ${user.username}: ${gameData.score}`);
      } else if (user) {
        // Solo incrementar gamesPlayed si no es mejor puntaje
        await user.increment('gamesPlayed');
      }
    }
  }
});

// Método de clase para obtener el mejor puntaje de un jugador
GameData.getBestScore = async function(playerId) {
  const bestGame = await this.findOne({
    where: { idPlayer: playerId },
    order: [["score", "DESC"]],
  });
  return bestGame ? bestGame.score : 0;
};

// Método de clase para obtener el historial de juegos de un jugador
GameData.getPlayerHistory = async function(playerId, limit = 10) {
  return await this.findAll({
    where: { idPlayer: playerId },
    order: [["createdAt", "DESC"]],
    limit: limit
  });
};

// Método de instancia para verificar si es un nuevo récord personal
GameData.prototype.isPersonalBest = async function() {
  const User = require('./User');
  const user = await User.findByPk(this.idPlayer);
  return user ? this.score > user.bestScore : false;
};

module.exports = GameData;