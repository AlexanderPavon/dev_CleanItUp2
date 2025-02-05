import React, { useEffect, useState, useRef,useCallback } from "react";
import Navbar from "../components/Navbar";
import "../styles/Characters.css";

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); 

  const imageInputRef = useRef(null); // Referencia al input de archivos

  // Estados para edición
  const [editCharacterId, setEditCharacterId] = useState(null);
  const [editCharacterData, setEditCharacterData] = useState({ name: "", description: "" });
  const [editImageFile, setEditImageFile] = useState(null);


  const editImageInputRef = useRef(null);
  // ========================
  //        READ
  // ========================
  const fetchCharacters = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/characters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("No se pudieron obtener los personajes");

      const data = await response.json();
      setCharacters(data);
    } catch (err) {
      setError(err.message);
    }
  }, [token]); // Dependencias: Solo cambiará si `token` cambia

  const fetchSelectedCharacter = useCallback(async () => {
    try {
      if (!userId) return;

      const response = await fetch(`http://localhost:5000/api/characters/selected/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener el personaje seleccionado");

      const data = await response.json();
      setSelectedCharacter(data);
    } catch (err) {
      setError(err.message);
    }
  }, [token, userId]); // Dependencias: Solo cambiará si `token` o `userId` cambian

  useEffect(() => {
    fetchCharacters();
    fetchSelectedCharacter();
  }, [fetchCharacters, fetchSelectedCharacter]); // Ahora son funciones estables

  // ========================
  //       CREATE
  // ========================
  const handleCreate = async () => {
    if (!newCharacter.name || !newCharacter.description || !imageFile) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newCharacter.name);
      formData.append("description", newCharacter.description);
      formData.append("image", imageFile);

      const response = await fetch("http://localhost:5000/api/characters", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al crear el personaje");

      setNewCharacter({ name: "", description: "" });
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = ""; // Limpiar input de archivos
      setError(null); //  Limpiar error después de crear un personaje
      fetchCharacters();
    } catch (err) {
      setError(err.message);
    }
  };
  // ========================
  //       UPDATE
  // ========================
  const handleEditClick = (char) => {
    setEditCharacterId(char.id);
    setEditCharacterData({ name: char.name, description: char.description });
    setEditImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditCharacterId(null);
    setEditCharacterData({ name: "", description: "" });
    setEditImageFile(null);
  };

  const handleUpdate = async () => {
    if (!editCharacterData.name || !editCharacterData.description) {
      setError("Todos los campos son obligatorios para actualizar.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", editCharacterData.name);
      formData.append("description", editCharacterData.description);
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      const response = await fetch(`http://localhost:5000/api/characters/${editCharacterId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al actualizar el personaje");

      const updatedCharacter = await response.json();

      setEditCharacterId(null);
      setEditCharacterData({ name: "", description: "" });
      setEditImageFile(null);
      if (editImageInputRef.current) editImageInputRef.current.value = "";

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) => (char.id === updatedCharacter.id ? updatedCharacter : char))
      );

      if (selectedCharacter?.id === updatedCharacter.id) {
        setSelectedCharacter(updatedCharacter);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ========================
  //       DELETE
  // ========================
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/characters/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al eliminar el personaje");

      setCharacters(prevCharacters => prevCharacters.filter(char => char.id !== id)); // Eliminar personaje sin recargar
    } catch (err) {
      setError(err.message);
    }
  };

  // ========================
  //     SET SELECTED CHARACTER
  // ========================
  const handleSelectCharacter = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/characters/${id}/select`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setSelectedCharacter(data.selectedCharacter);
    } catch (err) {
      setError(err.message);
    }
  };

  // Función para limpiar el mensaje de error cuando el usuario escribe o sube una imagen
  const clearErrorOnInput = () => {
    if (error) setError(null);
  };

  return (
    <div className="characters-page">
      <Navbar />
      <div className="characters-container">
        <h1 className="characters-title">Gestión de Personajes</h1>

        {error && <p className="error-message">{error}</p>}

        {/* FORMULARIO PARA CREAR */}
        <div className="create-form">
          <h2>Añadir Personaje</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={newCharacter.name}
            onChange={(e) => {
              setNewCharacter({ ...newCharacter, name: e.target.value });
              clearErrorOnInput(); //  Limpiar error al escribir
            }}
          />
          <input 
            type="file" 
            ref={imageInputRef} // Asignamos la referencia
            onChange={(e) => {
              setImageFile(e.target.files[0]);
              clearErrorOnInput(); //  Limpiar error al subir imagen
            }} 
          />
          <textarea
            placeholder="Descripción"
            value={newCharacter.description}
            onChange={(e) => {
              setNewCharacter({ ...newCharacter, description: e.target.value });
              clearErrorOnInput(); // Limpiar error al escribir
            }}
          />
          <button onClick={handleCreate} className="btn-primary">
            Crear
          </button>
        </div>

        {/* LISTADO DE PERSONAJES */}
        <div className="characters-list">
          <h2>Lista de Personajes</h2>
          {characters.map((char) => (
            <div key={char.id} className="character-card">
              <img src={`/uploads/${char.image}`} alt={char.name} style={{ width: "100px", height: "100px", objectFit: "cover" }} />
              <h3>{char.name}</h3>
              <p>{char.description}</p>
              {editCharacterId === char.id ? (
                <>
                  <input
                    type="text"
                    value={editCharacterData.name}
                    onChange={(e) => setEditCharacterData({ ...editCharacterData, name: e.target.value })}
                  />
                  <textarea
                    value={editCharacterData.description}
                    onChange={(e) => setEditCharacterData({ ...editCharacterData, description: e.target.value })}
                  />
                  <input type="file" onChange={(e) => setEditImageFile(e.target.files[0])} />
                  <button onClick={handleUpdate} className="btn btn-success">Guardar</button>
                  <button onClick={handleCancelEdit} className="btn btn-secondary">Cancelar</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditClick(char)} className="btn btn-warning">Editar</button>
                  <button onClick={() => handleDelete(char.id)} className="btn btn-danger">Eliminar</button>
                  <button onClick={() => handleSelectCharacter(char.id)} className="btn btn-success">
                    {selectedCharacter?.id === char.id ? "Personaje Seleccionado" : "Seleccionar"}
                  </button>
                </>  
              )}
            </div>
          ))}
        </div>

        {/* MOSTRAR PERSONAJE SELECCIONADO */}
        {selectedCharacter && (
          <div className="main-character">
            <h2>Personaje Seleccionado</h2>
            <img src={`/uploads/${selectedCharacter.image}`} alt={selectedCharacter.name} style={{ width: "100px", height: "100px", objectFit: "cover" }} />
            <h3>{selectedCharacter.name}</h3>
            <p>{selectedCharacter.description}</p>
          </div>
        )};
      </div>
    </div>
  );
};

export default Characters;