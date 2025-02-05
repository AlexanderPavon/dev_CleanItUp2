# Proyecto Integrador Clean It Up

Clean It Up es una aplicación web educativa diseñada para reducir la huella de carbono mediante un videojuego interactivo. Este proyecto combina tecnología, entretenimiento y concienciación ambiental para promover hábitos sostenibles en los jugadores.

## Descripción

El juego tiene como protagonista a un pingüino, un animal en peligro de extinción, que recolecta basura en un paisaje contaminado. A medida que el pingüino limpia, el entorno se transforma, simbolizando el impacto positivo de nuestras acciones. El juego busca generar emociones como rechazo hacia la basura y satisfacción al mejorar el entorno.

## Características Principales

- **Recolectar basura:** Limpia el paisaje mientras recolectas basura.
- **Puntuaciones y logros:** Gana puntos y compite en una clasificación. Al alcanzar 250 puntos, ¡plantaremos un árbol en tu honor!
- **Expansión futura:** Agrega personajes y escenarios que representan diferentes hábitats en peligro.
- **Educación divertida:** Diseñado para influenciar positivamente, especialmente a las nuevas generaciones.

## Tecnologías Utilizadas

El proyecto está dividido en dos partes: frontend y backend, utilizando una arquitectura moderna y escalable.

### Frontend

El frontend está desarrollado con React, aprovechando su ecosistema para construir una interfaz de usuario interactiva y moderna.

- **Dependencias principales:**
  - `@tailwindcss/forms`: Estilos modernos para formularios.
  - `bootstrap` y `bootstrap-icons`: Diseño rápido y responsivo.
  - `react`, `react-dom`: Biblioteca principal y renderizador.
  - `react-router-dom`: Navegación en la aplicación.
  - `react-scripts`: Scripts de configuración para React.

### Backend

El backend está construido con Node.js y Express, proporcionando una base robusta y eficiente para gestionar la lógica del servidor y la integración con la base de datos MongoDB.

- **Dependencias principales:**
  - `bcryptjs`: Encriptación de contraseñas.
  - `cors`: Configuración de seguridad para solicitudes cross-origin.
  - `express`: Framework principal del servidor.
  - `jsonwebtoken`: Autenticación basada en tokens.
  - `mongoose`: Modelado de datos y comunicación con MongoDB.

## Estructura del Proyecto

```
📂 dev_CleanItUp
│
├── 📂 client                      # Frontend (React)
│   ├── 📂 public                  
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   └── manifest.json
│   ├── 📂 src              
│   │   ├── 📂 assets            
│   │   │   ├── 📂 images           
│   │   │   │   ├── background.jpg
│   │   │   │   └── player.png
│   │   │   └── 📂 videos           
│   │   │       └── videofondo.mp4
│   │   ├── 📂 components         
│   │   │   ├── Index.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── 📂 Context   
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── App.css
│   ├── package.json
│   └── package-lock.json
│
├── 📂 server                      # Backend (Node.js)         
│   ├── 📂 config         
│   │   └── db.js
│   ├── 📂 controllers      
│   ├── 📂 middleware      
│   │   └── auth.js
│   ├── 📂 models        
│   │   └── User.js
│   ├── 📂 routes       
│   │   └── auth.js
│   ├── server.js
│   ├── package-lock.json
│   └── package.json
├── .gitignore
└── README.md
```

## Instrucciones de Instalación y Uso

### 1. Clonar el Repositorio
Clona el repositorio en tu máquina local:
~~~
git clone https://github.com/MichaelAlejandro/dev_CleanItUp.git
~~~

### 2. Instalar Dependencias
Navega a los directorios `client` y `server` y ejecuta:
~~~
cd client
npm install
~~~
~~~
cd ../server
npm install
~~~

### 3. Configurar Base de Datos
Asegúrate de tener MongoDB ejecutándose en `localhost:27017`. Configura las variables necesarias en `server/config/db.js`.

### 4. Iniciar el Proyecto
En dos terminales navega a los directorios `client` y `server` y ejecuta:

Frontend:
~~~
cd client
npm start
~~~

Backend:
~~~
cd ../server
npm start
~~~

### 5. Acceder a la Aplicación
Abre el navegador y navega a `http://localhost:3000` para interactuar con la aplicación.

## Futuras Expansiones

- Nuevos personajes como el oso de anteojos y la tortuga marina.
- Incorporación de más hábitats y misiones educativas.
- Sistema de recompensas expandido para fomentar una mayor participación.

## Contribución
Si deseas contribuir al desarrollo de Clean It Up, no dudes en hacer un fork del repositorio y enviar tus propuestas.

## Créditos

Proyecto desarrollado por:
- Jeremy Marin
- Michael Alejandro
- Alexander Pavon

Inspirados por el deseo de proteger nuestro planeta.