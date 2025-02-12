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
  
  try {
    // Obtener todos los usuarios ordenados por bestScore
    const [userRankings] = await sequelize.query(`
      WITH RankedUsers AS (
        SELECT 
          id,
          DENSE_RANK() OVER (ORDER BY "bestScore" DESC) as rank
        FROM "Users"
        WHERE "bestScore" > 0
      )
      SELECT rank
      FROM RankedUsers
      WHERE id = :userId
    `, {
      replacements: { userId: this.idPlayer },
      type: sequelize.QueryTypes.SELECT
    });

    // Si el usuario tiene un ranking, actualizarlo
    if (userRankings && userRankings.rank) {
      const newRank = parseInt(userRankings.rank);
      console.log('Nuevo ranking calculado:', newRank);

      await this.update({ currentRanking: newRank });

      // Actualizar mejor ranking si corresponde
      if (!this.bestRanking || newRank < this.bestRanking) {
        await this.update({ bestRanking: newRank });
      }
    } else {
      // Si el usuario no tiene puntuación, ponerlo al final
      const totalUsers = await User.count({
        where: {
          bestScore: {
            [sequelize.Op.gt]: 0
          }
        }
      });
      await this.update({ currentRanking: totalUsers + 1 });
      
      if (!this.bestRanking) {
        await this.update({ bestRanking: totalUsers + 1 });
      }
    }

    // Recargar el ranking actualizado
    await this.reload();
    
    console.log('Ranking actualizado:', {
      idPlayer: this.idPlayer,
      currentRanking: this.currentRanking,
      bestRanking: this.bestRanking
    });

  } catch (error) {
    console.error('Error actualizando ranking:', error);
    throw error;
  }
};

// Método de clase para actualizar todos los rankings
Ranking.updateAllRankings = async function() {
  const rankings = await this.findAll();
  for (const ranking of rankings) {
    await ranking.updateRanking();
  }
};

module.exports = Ranking;