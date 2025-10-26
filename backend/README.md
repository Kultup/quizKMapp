# Quiz App Backend

Серверна частина для додатку Quiz App - системи щоденних тестів з автоматичною розсилкою питань.

## Функціонал

### Основні можливості:
- ✅ Автоматична розсилка питань о 12:00 щодня
- ✅ Система авторизації через ПІБ, місто та посаду
- ✅ Щоденні тести з 5 питань різних категорій
- ✅ Ведення рейтингу користувачів
- ✅ Статистика користувачів
- ✅ База знань за категоріями
- ✅ Система зворотного зв'язку
- ✅ Адміністративна панель

### Адміністративні функції:
- ✅ Управління питаннями та категоріями
- ✅ Перегляд статистики користувачів
- ✅ Експорт звітів у Excel
- ✅ Управління користувачами
- ✅ Налаштування часу розсилки

## Технології

- **Node.js** + **Express.js** - веб-сервер
- **PostgreSQL** - база даних
- **JWT** - авторизація
- **bcryptjs** - хешування паролів
- **node-cron** - планувальник завдань
- **XLSX** - експорт звітів
- **express-validator** - валідація даних

## Встановлення

### 1. Вимоги
- Node.js 16+ 
- PostgreSQL 12+
- npm або yarn

### 2. Клонування та встановлення залежностей
```bash
cd backend
npm install
```

### 3. Налаштування бази даних
Створіть базу даних PostgreSQL:
```sql
CREATE DATABASE quizapp;
CREATE USER quizapp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE quizapp TO quizapp_user;
```

### 4. Налаштування змінних середовища
Скопіюйте файл `env.example` в `.env` та налаштуйте:
```bash
cp env.example .env
```

Відредагуйте `.env`:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quizapp
DB_USER=quizapp_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Quiz Configuration
QUIZ_SEND_TIME=12:00
QUIZ_DEADLINE_TIME=00:00
QUIZ_QUESTIONS_COUNT=5
REMINDER_HOURS=6
```

### 5. Ініціалізація бази даних
```bash
npm run migrate
npm run seed
```

### 6. Запуск сервера
```bash
# Розробка
npm run dev

# Продакшн
npm start
```

## API Документація

### Авторизація
- `POST /api/auth/register` - Реєстрація користувача
- `POST /api/auth/login` - Вхід в систему
- `GET /api/auth/profile` - Отримання профілю
- `PUT /api/auth/profile` - Оновлення профілю

### Квізи
- `GET /api/quiz/today` - Отримання сьогоднішнього квізу
- `POST /api/quiz/submit` - Відправка відповідей
- `GET /api/quiz/result/:quizId` - Результат квізу
- `GET /api/quiz/history` - Історія квізів користувача
- `GET /api/quiz/leaderboard` - Рейтинг користувачів

### Категорії
- `GET /api/categories` - Список категорій
- `GET /api/categories/:id/questions` - Питання категорії

### Питання (База знань)
- `GET /api/questions` - Список питань
- `GET /api/questions/:id` - Конкретне питання

### Користувач
- `POST /api/user/feedback` - Відправка зворотного зв'язку
- `GET /api/user/notifications` - Сповіщення
- `PUT /api/user/notifications/:id/read` - Позначити як прочитане
- `GET /api/user/stats` - Статистика користувача

### Адміністративна панель
- `GET /api/admin/dashboard` - Статистика дашборду
- `POST /api/admin/questions` - Створення питання
- `GET /api/admin/questions` - Список питань
- `PUT /api/admin/questions/:id` - Оновлення питання
- `DELETE /api/admin/questions/:id` - Видалення питання
- `POST /api/admin/categories` - Створення категорії
- `GET /api/admin/categories` - Список категорій
- `PUT /api/admin/categories/:id` - Оновлення категорії
- `DELETE /api/admin/categories/:id` - Видалення категорії
- `GET /api/admin/users` - Список користувачів
- `PUT /api/admin/users/:id/deactivate` - Деактивація користувача
- `GET /api/admin/users/:userId/stats` - Статистика користувача
- `GET /api/admin/reports/users` - Експорт користувачів
- `GET /api/admin/reports/quiz` - Експорт квізів

## Автоматизація

Система автоматично:
- Генерує щоденні квізи о 12:00
- Відправляє нагадування кожні 2 години (14:00, 16:00, 18:00, 20:00, 22:00)
- Очищає прострочені спроби о 00:00

## Тестові дані

Після запуску `npm run seed` буде створено:
- Адміністратора: `admin@quizapp.com` / `admin123`
- 5 категорій питань
- 10 тестових питань

## Структура проекту

```
backend/
├── src/
│   ├── controllers/     # Контролери
│   ├── models/         # Моделі даних
│   ├── routes/         # Маршрути API
│   ├── middleware/     # Проміжне ПЗ
│   ├── services/       # Сервіси (планувальник)
│   └── database/       # Підключення до БД
├── package.json
├── env.example
└── README.md
```

## Безпека

- JWT токени для авторизації
- Хешування паролів з bcrypt
- Rate limiting для API
- Валідація всіх вхідних даних
- CORS налаштування
- Helmet для безпеки заголовків

## Логування

Всі важливі події логуються в консоль:
- Підключення до БД
- Генерація квізів
- Відправка нагадувань
- Помилки API

## Розробка

Для розробки використовуйте:
```bash
npm run dev
```

Це запустить сервер з nodemon для автоматичного перезапуску при змінах.
