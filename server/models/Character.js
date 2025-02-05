const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Character = sequelize.define("Character", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  games_played: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, 
});

module.exports = Character;



