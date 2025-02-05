const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize"); 
const User = require("../models/User");


const router = express.Router();

//  Registro de usuario en PostgreSQL
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validar que los campos no estén vacíos
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    // Crear usuario en la base de datos (sin encriptar contraseña)
    const newUser = await User.create({ username, email, password });

    res.status(201).json({ message: "Usuario registrado exitosamente", user: newUser });

  } catch (error) {
    console.error("❌ Error en el registro:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});



//  Login
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  console.log("📩 Petición recibida en login:", { identifier, password });

  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
      },
      
    });
    console.log("🔹 Usuario encontrado:", user);

    if (!user) {
      console.log("❌ Usuario no encontrado:", identifier);
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    console.log("🔹 Usuario encontrado:", user);

    if (user.password) {
      console.log("🔹 Comparando contraseña...");
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("🔹 Resultado de bcrypt.compare:", isMatch);

      if (!isMatch) {
        console.log("❌ Contraseña incorrecta para el usuario:", user.username);
        return res.status(400).json({ error: "Contraseña incorrecta" });
      }
    } else {
      console.log("⚠️ Usuario registrado con Google, no tiene contraseña:", user.username);
      return res.status(400).json({ error: "Este usuario solo puede iniciar sesión con Google" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login exitoso para el usuario:", user.username);
    res.json({ token, user });
  } catch (error) {
    console.error("❌ Error en el login:", error);
    res.status(500).json({ error: "Error en el login" });
  }
});

// Login con Google 
router.post("/google-login", async (req, res) => {
  const { email, username } = req.body;

  try {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Si el usuario no existe, crearlo sin username ni password
      user = await User.create({ email, username: null, password: null });
    }

    // Si el usuario ya tiene un username, autenticamos y generamos token
    if (user.username) {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({ token, user });
    }

    // Si no tiene username, forzar a ingresarlo
    return res.status(200).json({ requiresUsername: true, email: user.email });

  } catch (error) {
    console.error("❌ Error en el login con Google:", error);
    res.status(500).json({ error: "Error en el login con Google" });
  }
});

// Guardar username después del login con Google
router.post("/set-username", async (req, res) => {
  const { email, username } = req.body;

  try {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si el nombre de usuario ya está en uso
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    // Guardar el nombre de usuario
    user.username = username;
    await user.save();

    // Generar el token con JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token, user });

  } catch (error) {
    console.error("❌ Error al actualizar username:", error);
    res.status(500).json({ error: "Error al actualizar username" });
  }
});

module.exports = router;

