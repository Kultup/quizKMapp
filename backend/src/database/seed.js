const { connectToDatabase } = require('./connection');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Question = require('../models/Question');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    await User.createUser({
      firstName: 'Admin',
      lastName: 'User',
      city: 'Kyiv',
      position: 'System Administrator',
      email: 'admin@quizapp.com',
      passwordHash: adminPasswordHash,
      isAdmin: true
    });

    // Create test categories
    const categories = [
      { name: 'Безпека праці', description: 'Питання з безпеки праці та охорони здоров\'я' },
      { name: 'Пожежна безпека', description: 'Правила пожежної безпеки та евакуації' },
      { name: 'Екологічна безпека', description: 'Екологічні норми та правила' },
      { name: 'Інформаційна безпека', description: 'Захист інформації та кібербезпека' },
      { name: 'Електробезпека', description: 'Правила роботи з електроустаткуванням' }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const createdCategory = await Category.createCategory(category);
      createdCategories.push(createdCategory);
    }

    // Create category map for questions
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Create sample questions
    const questions = [
      {
        categoryId: categoryMap['Безпека праці'],
        questionText: 'Який колір має знак заборонного сигналу?',
        optionA: 'Червоний',
        optionB: 'Жовтий',
        optionC: 'Зелений',
        optionD: 'Синій',
        correctAnswer: 'A',
        explanation: 'Червоний колір використовується для заборонних сигналів згідно з міжнародними стандартами безпеки.',
        difficultyLevel: 1
      },
      {
        categoryId: categoryMap['Пожежна безпека'],
        questionText: 'Що потрібно робити при виявленні пожежі?',
        optionA: 'Сховатися в кутку',
        optionB: 'Викликати пожежну службу за номером 101',
        optionC: 'Продовжити роботу',
        optionD: 'Закрити двері та чекати',
        correctAnswer: 'B',
        explanation: 'При виявленні пожежі необхідно негайно викликати пожежну службу за номером 101.',
        difficultyLevel: 1
      },
      {
        categoryId: categoryMap['Екологічна безпека'],
        questionText: 'Який газ є основним компонентом парникового ефекту?',
        optionA: 'Кисень',
        optionB: 'Вуглекислий газ',
        optionC: 'Азот',
        optionD: 'Водень',
        correctAnswer: 'B',
        explanation: 'Вуглекислий газ (CO2) є основним парниковим газом, що сприяє глобальному потеплінню.',
        difficultyLevel: 2
      },
      {
        categoryId: categoryMap['Інформаційна безпека'],
        questionText: 'Що таке фішинг?',
        optionA: 'Вид риболовлі',
        optionB: 'Метод крадіжки особистих даних через підроблені сайти',
        optionC: 'Програма для редагування фото',
        optionD: 'Тип комп\'ютерного вірусу',
        correctAnswer: 'B',
        explanation: 'Фішинг - це метод шахрайства, коли зловмисники створюють підроблені сайти для крадіжки особистих даних.',
        difficultyLevel: 2
      },
      {
        categoryId: categoryMap['Електробезпека'],
        questionText: 'Яка мінімальна відстань від ліній електропередач при роботі з висоти?',
        optionA: '1 метр',
        optionB: '3 метри',
        optionC: '5 метрів',
        optionD: '10 метрів',
        correctAnswer: 'B',
        explanation: 'Мінімальна безпечна відстань від ліній електропередач становить 3 метри.',
        difficultyLevel: 3
      },
      {
        categoryId: categoryMap['Безпека праці'],
        questionText: 'Коли потрібно проводити інструктаж з безпеки праці?',
        optionA: 'Тільки при прийомі на роботу',
        optionB: 'При прийомі на роботу та щорічно',
        optionC: 'Тільки при зміні посади',
        optionD: 'За бажанням працівника',
        correctAnswer: 'B',
        explanation: 'Інструктаж з безпеки праці проводиться при прийомі на роботу та щорічно для всіх працівників.',
        difficultyLevel: 2
      },
      {
        categoryId: categoryMap['Пожежна безпека'],
        questionText: 'Який тип вогнегасника використовується для гасіння електроустаткування?',
        optionA: 'Водяний',
        optionB: 'Пінистий',
        optionC: 'Вуглекислий',
        optionD: 'Порошковий',
        correctAnswer: 'C',
        explanation: 'Вуглекислий вогнегасник безпечний для гасіння електроустаткування під напругою.',
        difficultyLevel: 2
      },
      {
        categoryId: categoryMap['Екологічна безпека'],
        questionText: 'Що означає абревіатура ISO 14001?',
        optionA: 'Міжнародний стандарт якості',
        optionB: 'Міжнародний стандарт екологічного менеджменту',
        optionC: 'Міжнародний стандарт безпеки праці',
        optionD: 'Міжнародний стандарт інформаційної безпеки',
        correctAnswer: 'B',
        explanation: 'ISO 14001 - це міжнародний стандарт системи екологічного менеджменту.',
        difficultyLevel: 3
      },
      {
        categoryId: categoryMap['Інформаційна безпека'],
        questionText: 'Що таке двофакторна автентифікація?',
        optionA: 'Використання двох паролів',
        optionB: 'Використання пароля та SMS-коду',
        optionC: 'Використання двох різних програм',
        optionD: 'Використання двох комп\'ютерів',
        correctAnswer: 'B',
        explanation: 'Двофакторна автентифікація передбачає використання двох різних методів підтвердження особи (наприклад, пароль + SMS-код).',
        difficultyLevel: 2
      },
      {
        categoryId: categoryMap['Електробезпека'],
        questionText: 'Яка напруга вважається небезпечною для людини?',
        optionA: '12 В',
        optionB: '24 В',
        optionC: '50 В',
        optionD: '100 В',
        correctAnswer: 'C',
        explanation: 'Напруга понад 50 В вважається небезпечною для людини і може призвести до електротравми.',
        difficultyLevel: 2
      }
    ];

    for (const question of questions) {
      await Question.createQuestion(question);
    }

    console.log('Database seeded successfully!');
    console.log('Admin credentials: admin@quizapp.com / admin123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  connectToDatabase()
    .then(() => seedDatabase())
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };