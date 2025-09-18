// Script para probar el login desde el frontend
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Probando login con credenciales de prueba...');

    const response = await axios.post('http://localhost:8000/api/auth/login', {
      username: 'user@sheily.ai',
      password: 'password'
    });

    console.log('✅ Login exitoso!');
    console.log('📊 Respuesta:', {
      message: response.data.message,
      user: {
        username: response.data.user.username,
        email: response.data.user.email,
        tokens: response.data.user.tokens
      },
      tokenLength: response.data.token ? response.data.token.length : 0
    });

    return response.data;

  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return null;
  }
}

async function testHealth() {
  try {
    console.log('📊 Probando health check...');

    const response = await axios.get('http://localhost:8000/api/health');

    console.log('✅ Health check exitoso!');
    console.log('📊 Estado:', response.data);

    return response.data;

  } catch (error) {
    console.error('❌ Error en health check:', error.message);
    return null;
  }
}

// Ejecutar pruebas
async function main() {
  console.log('🚀 Iniciando pruebas del backend...\n');

  // Probar health check
  await testHealth();
  console.log('');

  // Probar login
  const loginResult = await testLogin();

  if (loginResult) {
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('💡 El frontend debería poder conectarse ahora sin problemas.');
    console.log('🔑 Credenciales de prueba: user@sheily.ai / password');
  } else {
    console.log('\n❌ Algunas pruebas fallaron.');
  }
}

main().catch(console.error);
