const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
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

async function testLogin() {
  try {
    console.log('🔐 Тестуємо вхід в систему...');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = {
      email: 'gorodok048@gmail.com',
      password: 'Qa123456'
    };
    
    const response = await makeRequest(loginOptions, loginData);
    
    if (response.statusCode === 200) {
      console.log('✅ Вхід успішний!');
      console.log('📄 Відповідь:', response.data);
      console.log('🔑 Токен:', response.data.token);
      
      // Тестуємо запит квізів з токеном
      console.log('\n🧪 Тестуємо запит квізів з токеном...');
      const quizzesOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/quizzes?category=' + encodeURIComponent('Географія'),
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      };
      
      const quizzesResponse = await makeRequest(quizzesOptions);
      
      if (quizzesResponse.statusCode === 200) {
        console.log('✅ Квізи завантажено успішно!');
        console.log('📊 Кількість квізів:', quizzesResponse.data.length);
      } else {
        console.log('❌ Помилка завантаження квізів:', quizzesResponse.statusCode, quizzesResponse.data);
      }
    } else {
      console.log('❌ Помилка входу:', response.statusCode, response.data);
    }
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
  }
}

testLogin();