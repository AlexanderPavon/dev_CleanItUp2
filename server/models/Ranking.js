const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Ranking = sequelize.define("Ranking", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  idPlayer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    },
    onDelete: "CASCADE",
    unique: true
  },

  bestRanking: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  currentRanking: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: "Rankings",
  timestamps: true,
  
  indexes: [
    {
      name: "ranking_current_idx",
      fields: ["currentRanking"]
    },
    {
      name: "ranking_best_idx",
      fields: ["bestRanking"]
    }
  ]
});

// Método para actualizar el ranking de un jugador
Ranking.prototype.updateRanking = async function() {
  const User = require('./User');
  const user = await User.findByPk(this.idPlayer);
  
  if (!user) return;

  // Calcular nuevo ranking basado en bestScore
  const betterPlayers = await User.count({
    where: {
      bestScore: {
        [sequelize.Op.gt]: user.bestScore
      }
    }
  });

  const newRanking = betterPlayers + 1;
  const updates = { currentRanking: newRanking };
  
  // Actualizar mejor ranking si corresponde
  if (!this.bestRanking || newRanking < this.bestRanking) {
    updates.bestRanking = newRanking;
  }

  await this.update(updates);
};

// Método de clase para actualizar todos los rankings
Ranking.updateAllRankings = async function() {
  const rankings = await this.findAll();
  for (const ranking of rankings) {
    await ranking.updateRanking();
  }
};

module.exports = Ranking;