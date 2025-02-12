const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/db");

// Middleware básico de autenticación
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Acceso no autorizado" });
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Middleware que además configura el `user_id` en PostgreSQL
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Acceso no autorizado" });
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded; // Guardamos el usuario en la request

    // 🔹 Establecer el `user_id` en PostgreSQL para auditoría
    await sequelize.query(`SELECT set_config('app.current_user_id', '${decoded.userId}', false)`);

    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = { auth, authenticateUser };