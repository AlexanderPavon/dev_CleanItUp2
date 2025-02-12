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

  // Obtener el ranking del usuario actual
  const [result] = await sequelize.query(`
    SELECT subquery.rank as current_rank
    FROM (
      SELECT id,
             RANK() OVER (ORDER BY "bestScore" DESC) as rank
      FROM "Users"
      WHERE "bestScore" > 0
    ) as subquery
    WHERE id = :userId
  `, {
    replacements: { userId: this.idPlayer },
    type: sequelize.QueryTypes.SELECT
  });

  // Obtener el ranking actual (o usar el último + 1 si no tiene puntuación)
  const currentRank = result ? result.current_rank : await User.count() + 1;

  // Actualizar el ranking actual
  await this.update({ currentRanking: currentRank });
  
  // Actualizar el mejor ranking si corresponde
  if (!this.bestRanking || currentRank < this.bestRanking) {
    await this.update({ bestRanking: currentRank });
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