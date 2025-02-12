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

  useEffect(() => {
    const fetchMainCharacter = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/characters/selected/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('No se pudo obtener el personaje principal');
        const data = await res.json();
        setCharacter(data);
      } catch (error) {
        console.error('Error al obtener el personaje principal:', error);
      }
    };

    if (userId) fetchMainCharacter();
  }, [userId, token]);

  useEffect(() => {
    const interval = 25;
    const newIndex = Math.floor(score / interval) % backgrounds.length;
    setBackgroundIndex(newIndex);
  }, [score, backgrounds]);

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

  const calculateSpeed = (currentScore) => {
    const baseSpeed = 2;
    const speedIncrease = 0.3;
    return baseSpeed + (Math.floor(currentScore / 10) * speedIncrease);
  };

  const calculateSpawnInterval = (currentScore) => {
    const baseInterval = 800;
    const intervalDecrease = 50;
    const minInterval = 200;
    
    const newInterval = baseInterval - (Math.floor(currentScore / 10) * intervalDecrease);
    return Math.max(newInterval, minInterval);
  };
  
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

        if (checkCollision(playerElement, trashElement)) {
          trash.processed = true;
          gainPoint();
          return false;
        }

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
    let intervalId;
    
    const updateSpawnInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      const spawnTrash = () => {
        if (!gamePaused) {
          const x = Math.random() * 370;
          const currentSpeed = calculateSpeed(scoreRef.current);
          const img = trashImgs[Math.floor(Math.random() * trashImgs.length)];
          trashRef.current.push({ id: Date.now(), x, y: 0, speed: currentSpeed, img });
        }
      };

      const currentInterval = calculateSpawnInterval(scoreRef.current);
      intervalId = setInterval(spawnTrash, currentInterval);
    };

    updateSpawnInterval();

    const scoreCheckInterval = setInterval(() => {
      updateSpawnInterval();
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(scoreCheckInterval);
    };
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

  const saveGameData = async (score) => {
    console.log('🎮 Guardando datos de la partida:', { userId, score });
  
    try {
      const response = await fetch(`http://localhost:5000/api/games/save-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          score,
          idPlayer: userId 
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error al guardar la partida: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('✅ Partida guardada exitosamente:', data);
    } catch (error) {
      console.error('❌ Error al guardar la partida:', error);
    }
  };

  const updateGameData = async (score) => {
    console.log('🔵 Enviando datos al backend:', { userId, score });

    try {
      if (score >= 250) {
        console.log('🌱 Score >= 250. Intentando incrementar árboles en MongoDB...');

        const treeResponse = await fetch(`http://localhost:5000/api/game-data/increment-trees-to-plant`, {
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

  const endGame = () => { 
    if (!gameActive || dataUpdated) return; 
    
    setDataUpdated(true); 
    setGameActive(false); 
    setGamePaused(false); 
    trashRef.current = []; 
  
    if (scoreRef.current > 0) { 
      saveGameData(scoreRef.current);
      updateGameData(scoreRef.current);
    } else {
      console.log('Score no es mayor que 0, no se guardan los datos.');
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