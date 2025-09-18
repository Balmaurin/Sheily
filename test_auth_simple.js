const http = require('http');

console.log('🧪 Probando autenticación en Sheily AI Backend...\n');

// Función para hacer peticiones
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Probar registro
async function testAuth() {
  try {
    console.log('1. Intentando registro...');
    const registerResponse = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'testuser123',
      email: 'test123@example.com',
      password: 'TestPass123!'
    });
    
    console.log(`   Status: ${registerResponse.status}`);
    if (registerResponse.status === 201) {
      console.log('   ✅ Registro exitoso!');
      console.log('   Datos:', registerResponse.data);
      
      // Esperar un poco antes del login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('\n2. Intentando login...');
      const loginResponse = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        username: 'testuser123',
        password: 'TestPass123!'
      });
      
      console.log(`   Status: ${loginResponse.status}`);
      if (loginResponse.status === 200) {
        console.log('   ✅ Login exitoso!');
        console.log('   Token:', loginResponse.data.token ? 'Presente' : 'No presente');
      } else {
        console.log('   ❌ Login falló:', loginResponse.data);
      }
      
    } else {
      console.log('   ❌ Registro falló:', registerResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuth();
