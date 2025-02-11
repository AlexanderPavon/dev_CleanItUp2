// models/associations.js

// Importar todos los modelos
const User = require('./User');
const Character = require('./Character');
const GameData = require('./GameData');
const Achievements = require('./Achievements');
const Ranking = require('./Ranking');

// Relaciones User-Character
User.belongsTo(Character, {
  foreignKey: 'selectedCharacterId',
  as: 'selectedCharacter'
});

Character.hasMany(User, {
  foreignKey: 'selectedCharacterId',
  as: 'users'
});

// Relaciones User-GameData
User.hasMany(GameData, {
  foreignKey: 'idPlayer',
  as: 'games'
});

GameData.belongsTo(User, {
  foreignKey: 'idPlayer',
  as: 'player'
});

// Relaciones User-Achievement
User.hasOne(Achievements, { 
  foreignKey: 'idPlayer',
  as: 'achievements' 
});

Achievements.belongsTo(User, { 
  foreignKey: 'idPlayer',
  as: 'player' 
});

// Relaciones User-Ranking
User.hasOne(Ranking, { 
  foreignKey: 'idPlayer',
  as: 'ranking' 
});

Ranking.belongsTo(User, { 
  foreignKey: 'idPlayer',
  as: 'player' 
});

// Exportar todos los modelos con sus relaciones establecidas
module.exports = {
  User,
  Character,
  GameData,
  Achievements,
  Ranking
};