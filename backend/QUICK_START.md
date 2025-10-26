# 🚀 Швидкий запуск Quiz App з веб адмін панеллю

## ⚡ Миттєвий старт (5 хвилин)

### 1. Встановлення залежностей
```bash
cd backend
npm install
```

### 2. Налаштування бази даних (Docker)
```bash
# Запуск PostgreSQL
docker run --name quizapp-postgres \
  -e POSTGRES_DB=quizapp \
  -e POSTGRES_USER=quizapp_user \
  -e POSTGRES_PASSWORD=quizapp_password \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 3. Налаштування змінних середовища
```bash
cp env.example .env
```

Відредагуйте `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quizapp
DB_USER=quizapp_user
DB_PASSWORD=quizapp_password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Ініціалізація бази даних
```bash
npm run migrate
npm run seed
```

### 5. Запуск сервера
```bash
npm run dev
```

### 6. Доступ до адмін панелі
Відкрийте браузер: **http://localhost:3000/admin**

**Вхід:**
- Email: `admin@quizapp.com`
- Пароль: `admin123`

## 🎯 Що ви отримаєте

### ✅ Повнофункціональна адмін панель
- 📊 **Дашборд** з статистикою та графіками
- ❓ **Управління питаннями** (додавання, редагування, видалення)
- 🏷️ **Управління категоріями** 
- 👥 **Управління користувачами**
- 📋 **Управління квізами**
- 📈 **Звіти та експорт** в Excel
- ⚙️ **Налаштування системи**

### ✅ Автоматизація
- 🕐 **Автоматична генерація** квізів о 12:00
- 📧 **Email повідомлення** користувачам
- ⏰ **Нагадування** кожні 2 години
- 🧹 **Очищення** прострочених спроб о 00:00

### ✅ API для мобільного додатку
- 🔐 **Авторизація** користувачів
- 📱 **API для квізів** та статистики
- 📊 **Рейтинг** користувачів
- 📚 **База знань** за категоріями

## 🎨 Особливості адмін панелі

### Сучасний дизайн
- 🌟 **Адаптивний інтерфейс** для всіх пристроїв
- 🎨 **Сучасний дизайн** з градієнтами та анімаціями
- 📊 **Інтерактивні графіки** Chart.js
- 🔔 **Toast повідомлення** для зворотного зв'язку

### Функціональність
- 🔍 **Пошук та фільтрація** даних
- 📋 **Таблиці з сортуванням** та пагінацією
- 📤 **Експорт звітів** в Excel
- ⚡ **Швидкі операції** CRUD

## 📱 Тестування API

### Реєстрація користувача
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Тест",
    "lastName": "Користувач",
    "city": "Київ",
    "position": "Тестер",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Отримання сьогоднішнього квізу
```bash
curl -X GET http://localhost:3000/api/quiz/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Перевірка здоров'я сервера
```bash
curl http://localhost:3000/api/health
```

## 🔧 Налаштування для продакшну

### 1. Змініть JWT секрет
```env
JWT_SECRET=your-very-long-and-secure-secret-key-at-least-32-characters
```

### 2. Налаштуйте email
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Використовуйте HTTPS
```env
NODE_ENV=production
```

### 4. Налаштуйте CORS
```env
CORS_ORIGIN=https://yourdomain.com
```

## 🐳 Docker Deployment

### Повний стек
```bash
docker-compose up -d
```

### Тільки backend
```bash
docker build -t quizapp-backend .
docker run -d -p 3000:3000 quizapp-backend
```

## 📊 Структура проекту

```
backend/
├── src/
│   ├── controllers/     # Контролери API
│   ├── models/         # Моделі даних
│   ├── routes/         # Маршрути API
│   ├── services/       # Сервіси (email, scheduler)
│   └── database/       # Підключення до БД
├── admin/              # Веб адмін панель
│   ├── index.html      # Головна сторінка
│   ├── css/admin.css   # Стилі
│   └── js/admin.js     # JavaScript
├── package.json
└── README.md
```

## 🚨 Вирішення проблем

### Помилка підключення до БД
```bash
# Перевірте статус PostgreSQL
docker ps | grep postgres

# Перезапустіть контейнер
docker restart quizapp-postgres
```

### Помилка авторизації
- Перевірте JWT_SECRET в .env
- Переконайтеся, що токен не прострочений
- Перевірте права адміністратора

### Помилка email
- Налаштуйте EMAIL_* змінні в .env
- Перевірте пароль додатку Gmail
- Система працюватиме без email

## 📈 Моніторинг

### Логи сервера
```bash
# Розробка
npm run dev

# Продакшн
npm start

# Docker
docker logs quizapp-backend -f
```

### Метрики
- **API статус:** http://localhost:3000/api/health
- **Адмін панель:** http://localhost:3000/admin
- **Логи:** консоль сервера

## 🎉 Готово!

Тепер у вас є:
- ✅ **Повнофункціональна адмін панель**
- ✅ **API для мобільного додатку**
- ✅ **Автоматизація квізів**
- ✅ **Email повідомлення**
- ✅ **Система звітів**

**Наступні кроки:**
1. Налаштуйте email для повідомлень
2. Додайте більше питань через адмін панель
3. Налаштуйте домен для продакшну
4. Інтегруйте з мобільним додатком Flutter

**Підтримка:** admin@quizapp.com

