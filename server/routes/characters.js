const express = require("express");
const path = require("path");
const multer = require("multer");
const Character = require("../models/Character");
const User = require("../models/User");
const { Op } = require("sequelize");

const router = express.Router();

//  Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../client/public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ==================================================
// ===============   GET ALL CHARACTERS   ===========
// ==================================================
router.get("/", async (req, res) => {
  try {
    const characters = await Character.findAll();
    res.json(characters);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener los personajes", error: err.message });
  }
});

// ==================================================
// ==============   CREATE CHARACTER   ==============
// ==================================================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !description || !image) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const newCharacter = await Character.create({ name, description, image });
    res.status(201).json(newCharacter);
  } catch (err) {
    res.status(500).json({ message: "Error al crear personaje", error: err.message });
  }
});

// ==================================================
// ==============   UPDATE CHARACTER   ==============
// ==================================================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    let updatedFields = { name, description };

    if (req.file) {
      updatedFields.image = req.file.filename;
    }

    const [updated] = await Character.update(updatedFields, {
      where: { id },
    });

    if (!updated) {
      return res.status(404).json({ message: "Personaje no encontrado" });
    }

    const updatedCharacter = await Character.findByPk(id);
    res.json(updatedCharacter);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar el personaje", error: err.message });
  }
});

// ==================================================
// ==============   DELETE CHARACTER   ==============
// ==================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ⚠️ Verificar si el personaje está seleccionado por algún usuario
    const userUsingCharacter = await User.findOne({ where: { selectedCharacterId: id } });

    if (userUsingCharacter) {
      return res.status(400).json({ message: "No puedes eliminar un personaje que está seleccionado por un usuario." });
    }

    const deletedCharacter = await Character.destroy({ where: { id } });

    if (!deletedCharacter) {
      return res.status(404).json({ message: "Personaje no encontrado" });
    }

    res.json({ message: "Personaje eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar personaje", error: err.message });
  }
});


// ==================================================
// ======  SET SELECTED CHARACTER IN USER  ==========
// ==================================================
router.put("/:id/select", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.selectedCharacterId = id;
    await user.save();

    const selectedCharacter = await Character.findByPk(id);
    res.json({ message: "Personaje seleccionado correctamente", selectedCharacter });
  } catch (err) {
    res.status(500).json({ message: "Error al seleccionar personaje", error: err.message });
  }
});

// ==================================================
// ========== GET SELECTED CHARACTER OF USER ========
// ==================================================
router.get("/selected/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: { model: Character },
    });

    if (!user || !user.selectedCharacterId) {
      return res.status(404).json({ message: "El usuario no tiene un personaje seleccionado" });
    }

    const selectedCharacter = await Character.findByPk(user.selectedCharacterId);
    res.json(selectedCharacter);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el personaje seleccionado", error: err.message });
  }
});

module.exports = router;
