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
      const User = require('./User');
      const user = await User.findByPk(gameData.idPlayer);
      
      if (user) {
        await user.increment('gamesPlayed');
      }
    }
  }
});

module.exports = GameData;