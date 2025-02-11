const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Achievement = sequelize.define("Achievement", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  treesGoal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  gamesGoal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  rookie: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  apprentice: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  expert: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  master: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  legend: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  idPlayer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    },
    onDelete: "CASCADE"
  }
}, {
  tableName: "Achievements",
  timestamps: true
});

// Método para verificar y actualizar logros
Achievement.prototype.checkProgress = async function() {
  const User = require('./User');
  const user = await User.findByPk(this.idPlayer);
  
  if (!user) return;

  // Actualizar logros basados en árboles obtenidos
  if (user.treesObtained >= 100 && !this.treesGoal) {
    await this.update({ treesGoal: true });
  }

  // Actualizar logros basados en juegos jugados
  if (user.gamesPlayed >= 50 && !this.gamesGoal) {
    await this.update({ gamesGoal: true });
  }

  // Actualizar rangos basados en bestScore
  const updates = {};
  if (user.bestScore >= 1000 && !this.rookie) updates.rookie = true;
  if (user.bestScore >= 5000 && !this.apprentice) updates.apprentice = true;
  if (user.bestScore >= 10000 && !this.expert) updates.expert = true;
  if (user.bestScore >= 25000 && !this.master) updates.master = true;
  if (user.bestScore >= 50000 && !this.legend) updates.legend = true;

  if (Object.keys(updates).length > 0) {
    await this.update(updates);
  }
};

module.exports = Achievement;