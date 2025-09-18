#!/usr/bin/env node

// Servidor mock temporal para desarrollo
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8000;
const JWT_SECRET = 'sheily-ai-jwt-secret-2025-ultra-secure-random-string-128-bits';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Usuarios mock
const mockUsers = [
  {
    id: 1,
    username: 'user@sheily.ai',
    email: 'user@sheily.ai',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeLpKbHp8jJ8M9KQO', // "password"
    full_name: 'Usuario Demo',
    role: 'user',
    is_active: true
  },
  {
    id: 2,
    username: 'sergiobalma.gomez@gmail.com',
    email: 'sergiobalma.gomez@gmail.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeLpKbHp8jJ8M9KQO', // "password"
    full_name: 'Sergio Gomez',
    role: 'user',
    is_active: true
  }
];

// Endpoint de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar usuario
    const user = mockUsers.find(u => u.username === username || u.email === username);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Cuenta desactivada' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (86400000 / 1000)
      },
      JWT_SECRET
    );

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        tokens: 100
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Validación básica
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email y password son requeridos' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password debe tener al menos 8 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUser = mockUsers.find(u => u.username === username || u.email === email);

    if (existingUser) {
      return res.status(409).json({ error: 'Username o email ya existe' });
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: mockUsers.length + 1,
      username,
      email,
      password: hashedPassword,
      full_name: full_name || username,
      role: 'user',
      is_active: true
    };

    mockUsers.push(newUser);

    // Generar token
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        exp: Math.floor(Date.now() / 1000) + (86400000 / 1000)
      },
      JWT_SECRET
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        ...newUser,
        password: undefined,
        role: 'user'
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint de perfil
app.get('/api/auth/profile', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }

      const userData = mockUsers.find(u => u.id === user.id);
      if (!userData) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          tokens: 100
        }
      });
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint de health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mock',
    database: { status: 'Mock' },
    model: { status: 'available' },
    uptime: process.uptime()
  });
});

// Endpoint raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Sheily AI Mock Backend',
    version: '1.0.0-mock',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/',
      chat: '/api/chat/'
    }
  });
});

// Endpoint de chat básico (mock)
app.post('/api/chat/4bit', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Se requiere el mensaje' });
  }

  // Respuesta mock
  const responses = [
    '¡Hola! Soy Sheily AI, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
    'Entiendo tu consulta. Déjame pensar en la mejor respuesta para ti.',
    'Gracias por tu mensaje. Estoy aquí para ayudarte con cualquier pregunta que tengas.',
    '¡Excelente pregunta! Como IA avanzada, puedo proporcionarte información detallada sobre diversos temas.',
    'Me alegra poder asistirte. ¿Hay algo específico en lo que necesites ayuda?'
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  res.json({
    response: randomResponse,
    model: 'mock-llama-3.2-3b',
    quantization: 'mock',
    timestamp: new Date().toISOString(),
    response_time: Math.random() * 1000 + 500
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sheily AI Mock Backend ejecutándose en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/`);
  console.log('');
  console.log('👤 Usuarios disponibles para testing:');
  console.log('  - user@sheily.ai / password');
  console.log('  - sergiobalma.gomez@gmail.com / password');
  console.log('');
  console.log('🛑 Presiona Ctrl+C para detener');
});

// Manejo de señales
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor mock...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor mock...');
  process.exit(0);
});
