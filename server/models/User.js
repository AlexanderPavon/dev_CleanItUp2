const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  
  username: { 
    type: DataTypes.STRING, 
    allowNull: true, // Permitimos null para usuarios de Google
    unique: { msg: "El nombre de usuario ya está en uso" }, 
    validate: { notEmpty: { msg: "El nombre de usuario no puede estar vacío" } }
  },

  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: { msg: "El correo ya está registrado" } 
  },

  password: { type: DataTypes.STRING, allowNull: true }, // Permitimos null para usuarios de Google

  selectedCharacterId: { 
    type: DataTypes.INTEGER, 
    references: { model: "Characters", key: "id" }
  },

  bestScore: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  },

  gamesPlayed: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  },

  treesObtained: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  }
}, 
{
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        console.log("🔹 Encriptando contraseña antes de guardar en la DB...");
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed("password") && user.password) {
        console.log("🔹 Actualizando contraseña en la DB...");
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Método de instancia para comparar contraseñas en el login
User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Evita comparar null en usuarios de Google
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;

