import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Game.module.css';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Game() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const [gamePaused, setGamePaused] = useState(false);
  const [playerX, setPlayerX] = useState(175);
  const [direction, setDirection] = useState('right');
  const [character, setCharacter] = useState(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [dataUpdated, setDataUpdated] = useState(false);

  const trashRef = useRef([]);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const keysRef = useRef({ left: false, right: false });
  const scoreRef = useRef(0);

  const { token } = useAuth();
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
  useEffect(() => {
    console.log('Token JWT:', token);
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Token decodificado:', decoded);
    }
  }, [token]);

  const backgrounds = [
    '/assets/background1.jpg',
    '/assets/background2.jpg',
    '/assets/background3.jpg',
    '/assets/background4.jpg',
    '/assets/background5.jpg',
    '/assets/background6.jpg',
  ];

  const trashImgs = [
    '/assets/trash1.png',
    '/assets/trash3.png',
    '/assets/trash4.png',
  ];

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Obtener el personaje principal seleccionado por el usuario
  useEffect(() => {
    const fetchMainCharacter = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/characters/selected/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('No se pudo obtener el personaje principal');
        const data = await res.json();
        setCharacter(data); // Guardar los datos del personaje principal
      } catch (error) {
        console.error('Error al obtener el personaje principal:', error);
      }
    };

    if (userId) fetchMainCharacter();
  }, [userId, token]);

  // Actualización del fondo basado en el puntaje
  useEffect(() => {
    const interval = 5; // Intervalo de puntaje para cambiar el fondo
    const newIndex = Math.floor(score / interval) % backgrounds.length;
    setBackgroundIndex(newIndex);
  }, [score, backgrounds]);

  // Control del teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        keysRef.current.left = true;
        setDirection('left');
      }
      if (e.key === 'ArrowRight') {
        keysRef.current.right = true;
        setDirection('right');
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Movimiento del personaje
  useEffect(() => {
    const movePlayer = () => {
      if (!gameActive) return;

      setPlayerX((prevX) => {
        let newX = prevX;
        if (keysRef.current.left && newX > 0) newX -= 5;
        if (keysRef.current.right && newX < 350) newX += 5;
        return newX;
      });
    };

    const interval = setInterval(() => {
      if (!gamePaused) {
        movePlayer();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [gameActive, gamePaused]);
  
  // Movimiento de la basura
  const moveTrash = () => {
    if (!gameActive || gamePaused) return;

    trashRef.current = trashRef.current
      .map((trash) => ({
        ...trash,
        y: trash.y + trash.speed,
      }))
      .filter((trash) => {
        if (trash.processed) return false;

        const playerElement = document.querySelector(`.${styles.player}`);
        const trashElement = document.querySelector(`[data-id="${trash.id}"]`);

        if (!playerElement || !trashElement) return true;

        // Detectar colisión
        if (checkCollision(playerElement, trashElement)) {
          trash.processed = true;
          gainPoint();
          return false;
        }

        // Si la basura toca el suelo
        if (trash.y > 550) {
          trash.processed = true;
          loseLife();
          return false;
        }

        return true;
      });

    const trashContainer = document.querySelector(`.${styles.trashContainer}`);
    if (trashContainer) {
      while (trashContainer.firstChild) {
        trashContainer.removeChild(trashContainer.firstChild);
      }

      trashRef.current.forEach((trash) => {
        const trashDiv = document.createElement('div');
        trashDiv.className = styles.trash;
        trashDiv.style.left = `${trash.x}px`;
        trashDiv.style.top = `${trash.y}px`;
        trashDiv.style.backgroundImage = `url(${trash.img})`;
        trashDiv.setAttribute('data-id', trash.id);
        trashContainer.appendChild(trashDiv);
      });
    }

    animationFrameRef.current = requestAnimationFrame(moveTrash);
  };

  useEffect(() => {
    if (gameActive && !gamePaused) {
      animationFrameRef.current = requestAnimationFrame(moveTrash);
    }

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameActive, gamePaused]);

  useEffect(() => {
    const spawnTrash = () => {
      if (!gamePaused) {
        const x = Math.random() * 370;
        const speed = 2 + Math.random() * 3;
        const img = trashImgs[Math.floor(Math.random() * trashImgs.length)];
        trashRef.current.push({ id: Date.now(), x, y: 0, speed, img });
      }
    };

    const intervalId = setInterval(spawnTrash, 1000);
    return () => clearInterval(intervalId);
  }, [gamePaused]);

  const checkCollision = (playerElement, trashElement) => {
    const playerRect = playerElement.getBoundingClientRect();
    const trashRect = trashElement.getBoundingClientRect();

    return !(
      trashRect.right < playerRect.left ||
      trashRect.left > playerRect.right ||
      trashRect.bottom < playerRect.top ||
      trashRect.top > playerRect.bottom
    );
  };

  const loseLife = () => {
    if (dataUpdated) return;

    setLives((prev) => {
      if (prev > 1) return prev - 1;
      endGame();
      return 0;
    });
  };

  const gainPoint = () => setScore((prev) => prev + 1);

  const endGame = () => { 
    if (!gameActive || dataUpdated) return; 
    
    setDataUpdated(true); 
    setGameActive(false); 
    setGamePaused(false); 
    trashRef.current = []; 
  
  
    if (scoreRef.current > 0) { 
      updateGameData(scoreRef.current); 
    } else {
      console.log('Score no es mayor que 0, no se llama a updateGameData.');
    }
  };
  
  
  

  const initGame = () => {
    setScore(0);
    setLives(3);
    setGameActive(true);
    setGamePaused(false);
    setBackgroundIndex(0);
    setDataUpdated(false);
    trashRef.current = [];
  };

  // const updateGameData = async (score) => {
  
  //   if (!userId) {
  //     console.error('userId no está definido. Abortando fetch.');
  //     return;
  //   }
  
  //   console.log('Enviando datos al backend:', { userId, score }); 
  
  //   try {
  //     const response = await fetch('http://localhost:5000/api/game-data/update', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`, 
  //       },
  //       body: JSON.stringify({ userId, score }),
  //     });
  
  
  //     if (!response.ok) {
  //       throw new Error(`Error en la respuesta del backend: ${response.statusText}`);
  //     }
  
  //     const data = await response.json();
  //     console.log('Respuesta del backend:', data); 
  //   } catch (error) {
  //     console.error('Error al guardar los datos del juego:', error);
  //   }
  // };


  const updateGameData = async (score) => {
    console.log('🔵 Enviando datos al backend:', { userId, score });

    try {
      // Actualiza los datos en PostgreSQL
      console.log('🟢 Enviando solicitud a /update');
      const response = await fetch('http://localhost:5000/api/game-data/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, score }),
      });

      if (!response.ok) {
        throw new Error(`❌ Error en la respuesta del backend: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta de /update:', data);

      // 🔴 **Verifica si el puntaje es suficiente para plantar un árbol**
      if (score >= 250) {
        console.log('🌱 Score >= 250. Intentando incrementar árboles en MongoDB...');

        const treeResponse = await fetch('http://localhost:5000/api/game-data/increment-trees-to-plant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ treesObtained: 1 }),
        });

        if (!treeResponse.ok) {
          throw new Error(`❌ Error al incrementar árboles: ${treeResponse.statusText}`);
        }

        const treeData = await treeResponse.json();
        console.log('🌳 Respuesta de /increment-trees-to-plant:', treeData);
      } else {
        console.log('⚠️ Score menor a 250, no se incrementa el contador de árboles.');
      }
    } catch (error) {
      console.error('❌ Error al guardar los datos del juego:', error);
    }
};

  
  
  

  return (
    <div
      className={styles.background}
      style={{ backgroundImage: `url(${backgrounds[backgroundIndex]})` }}
    >
      <div className={styles.gameContainer} ref={containerRef}>
        <div className={styles.trashContainer}></div>
        <div className={styles.scoreDisplay}>Puntos: {score}</div>
        <div className={styles.livesDisplay}>Vidas: {lives}</div>
        <button
          className={styles.pauseButton}
          onClick={() => setGamePaused((prev) => !prev)}
        >
          {gamePaused ? 'Continuar' : 'Pausar'}
        </button>
        <div
          className={styles.player}
          style={{
            left: `${playerX}px`,
            bottom: '10px',
            backgroundImage: character ? `url(/uploads/${character.image})` : 'none',
            transform: direction === 'left' ? 'scaleX(1)' : 'scaleX(-1)',
          }}
        ></div>
      </div>
      {!gameActive && (
        <div className={styles.gameOverScreen}>
          <h1>¡Perdiste!</h1>
          <p>Puntuación final: {score}</p>
          <button className={styles.restartButton} onClick={initGame}>
            Otra Partida
          </button>
          <Link to="/" className={styles.homeButton}>
            Ir a inicio
          </Link>
        </div>
      )}
      {gamePaused && (
        <div className={styles.gameOverScreen}>
          <h1>¡Pausa!</h1>
          <p>Puntuación hasta ahora: {score}</p>
          <button
            className={styles.restartButton}
            onClick={() => setGamePaused(false)}
          >
            Volver a jugar
          </button>
          <Link to="/" className={styles.homeButton}>
            Ir a inicio
          </Link>
        </div>
      )}
    </div>
  );
}
