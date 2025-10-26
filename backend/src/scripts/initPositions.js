const mongoose = require('mongoose');
const Position = require('../models/Position');
const Question = require('../models/Question');
const User = require('../models/User');
require('dotenv').config();

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const positions = [
  {
    name: 'Адміністратор закладу',
    category: 'адміністратор_закладу',
    description: 'Керівна посада, відповідальна за загальне управління закладом',
    level: 'керівний'
  },
  {
    name: 'Банкетний менеджер',
    category: 'банкетний_менеджер',
    description: 'Відповідає за організацію та проведення банкетів та заходів',
    level: 'старший'
  },
  {
    name: 'Шеф кухар',
    category: 'шеф_кухар',
    description: 'Керує кухонним персоналом та відповідає за якість страв',
    level: 'старший'
  },
  {
    name: 'Менеджер звязку',
    category: 'менеджер_звязку',
    description: 'Відповідає за комунікації та взаємодію з клієнтами',
    level: 'середній'
  }
];

const questions = {
  'адміністратор_закладу': [
    {
      questionText: 'Яка основна відповідальність адміністратора закладу?',
      optionA: 'Приготування страв',
      optionB: 'Загальне управління закладом',
      optionC: 'Обслуговування клієнтів',
      optionD: 'Прибирання приміщень',
      correctAnswer: 'B',
      explanation: 'Адміністратор закладу відповідає за загальне управління та координацію всіх процесів.',
      difficultyLevel: 1
    },
    {
      questionText: 'Що включає в себе планування роботи адміністратора?',
      optionA: 'Тільки складання графіків',
      optionB: 'Планування ресурсів, персоналу та операцій',
      optionC: 'Тільки контроль витрат',
      optionD: 'Тільки комунікацію з клієнтами',
      correctAnswer: 'B',
      explanation: 'Планування включає комплексний підхід до управління всіма аспектами роботи закладу.',
      difficultyLevel: 2
    },
    {
      questionText: 'Як адміністратор повинен реагувати на скарги клієнтів?',
      optionA: 'Ігнорувати їх',
      optionB: 'Вислухати, проаналізувати та вирішити проблему',
      optionC: 'Передати іншому співробітнику',
      optionD: 'Записати і забути',
      correctAnswer: 'B',
      explanation: 'Професійний підхід передбачає активне вирішення проблем клієнтів.',
      difficultyLevel: 2
    },
    {
      questionText: 'Що є найважливішим у фінансовому управлінні закладом?',
      optionA: 'Максимізація прибутку',
      optionB: 'Контроль витрат та оптимізація бюджету',
      optionC: 'Збільшення цін',
      optionD: 'Зменшення зарплат персоналу',
      correctAnswer: 'B',
      explanation: 'Ефективне фінансове управління базується на контролі витрат та оптимізації.',
      difficultyLevel: 3
    },
    {
      questionText: 'Як адміністратор повинен мотивувати персонал?',
      optionA: 'Тільки грошовими стимулами',
      optionB: 'Комплексним підходом: визнання, розвиток, справедливість',
      optionC: 'Тільки погрозами',
      optionD: 'Тільки похвалою',
      correctAnswer: 'B',
      explanation: 'Ефективна мотивація включає різні аспекти: матеріальні та нематеріальні стимули.',
      difficultyLevel: 3
    },
    {
      questionText: 'Що таке кризове управління в ресторанному бізнесі?',
      optionA: 'Планування святкових заходів',
      optionB: 'Дії у разі непередбачених ситуацій',
      optionC: 'Управління конфліктами між персоналом',
      optionD: 'Контроль якості страв',
      correctAnswer: 'B',
      explanation: 'Кризове управління - це система дій для вирішення непередбачених проблем.',
      difficultyLevel: 4
    },
    {
      questionText: 'Які документи повинен вести адміністратор закладу?',
      optionA: 'Тільки фінансові звіти',
      optionB: 'Комплексну документацію: фінансову, кадрову, операційну',
      optionC: 'Тільки графіки роботи',
      optionD: 'Тільки скарги клієнтів',
      correctAnswer: 'B',
      explanation: 'Адміністратор веде всю необхідну документацію для ефективного управління.',
      difficultyLevel: 2
    },
    {
      questionText: 'Що включає в себе контроль якості послуг?',
      optionA: 'Тільки контроль страв',
      optionB: 'Контроль всіх аспектів обслуговування',
      optionC: 'Тільки контроль персоналу',
      optionD: 'Тільки контроль приміщень',
      correctAnswer: 'B',
      explanation: 'Контроль якості охоплює всі аспекти роботи закладу.',
      difficultyLevel: 3
    },
    {
      questionText: 'Як адміністратор повинен планувати розвиток закладу?',
      optionA: 'Тільки розширенням меню',
      optionB: 'Стратегічним плануванням всіх аспектів',
      optionC: 'Тільки наймом персоналу',
      optionD: 'Тільки ремонтом приміщень',
      correctAnswer: 'B',
      explanation: 'Стратегічне планування включає комплексний розвиток закладу.',
      difficultyLevel: 4
    },
    {
      questionText: 'Що є основою ефективної комунікації адміністратора?',
      optionA: 'Авторитарний стиль',
      optionB: 'Відкритість, слухання та взаємоповага',
      optionC: 'Тільки письмові інструкції',
      optionD: 'Тільки особисті розмови',
      correctAnswer: 'B',
      explanation: 'Ефективна комунікація базується на взаємоповазі та відкритості.',
      difficultyLevel: 2
    }
  ],
  'банкетний_менеджер': [
    {
      questionText: 'Яка основна функція банкетного менеджера?',
      optionA: 'Приготування страв',
      optionB: 'Організація та проведення банкетів',
      optionC: 'Обслуговування столиків',
      optionD: 'Прибирання залу',
      correctAnswer: 'B',
      explanation: 'Банкетний менеджер спеціалізується на організації банкетних заходів.',
      difficultyLevel: 1
    },
    {
      questionText: 'Що включає в себе планування банкету?',
      optionA: 'Тільки вибір меню',
      optionB: 'Комплексне планування: меню, сервіс, декор, логістика',
      optionC: 'Тільки розрахунок вартості',
      optionD: 'Тільки бронювання залу',
      correctAnswer: 'B',
      explanation: 'Планування банкету - це комплексний процес, що включає багато аспектів.',
      difficultyLevel: 2
    },
    {
      questionText: 'Як банкетний менеджер повинен працювати з клієнтами?',
      optionA: 'Тільки приймати замовлення',
      optionB: 'Консультувати, планувати та супроводжувати весь процес',
      optionC: 'Тільки розраховувати вартість',
      optionD: 'Тільки координувати персонал',
      correctAnswer: 'B',
      explanation: 'Робота з клієнтами включає повний цикл обслуговування.',
      difficultyLevel: 2
    },
    {
      questionText: 'Що таке сервісне планування для банкету?',
      optionA: 'Тільки розстановка столів',
      optionB: 'Планування посуду, сервірування та обслуговування',
      optionC: 'Тільки прибирання після заходу',
      optionD: 'Тільки контроль персоналу',
      correctAnswer: 'B',
      explanation: 'Сервісне планування включає всі аспекти обслуговування гостей.',
      difficultyLevel: 3
    },
    {
      questionText: 'Як розраховується вартість банкету?',
      optionA: 'Тільки за продуктами',
      optionB: 'За продуктами, сервісом, персоналом та додатковими послугами',
      optionC: 'Тільки за часом',
      optionD: 'Тільки за кількістю гостей',
      correctAnswer: 'B',
      explanation: 'Вартість банкету включає всі компоненти обслуговування.',
      difficultyLevel: 3
    },
    {
      questionText: 'Що включає в себе координація персоналу під час банкету?',
      optionA: 'Тільки роздачу завдань',
      optionB: 'Планування, контроль та забезпечення якості роботи',
      optionC: 'Тільки контроль часу',
      optionD: 'Тільки розрахунок зарплат',
      correctAnswer: 'B',
      explanation: 'Координація персоналу - це комплексне управління командою.',
      difficultyLevel: 3
    },
    {
      questionText: 'Як банкетний менеджер повинен вирішувати проблеми під час заходу?',
      optionA: 'Ігнорувати їх',
      optionB: 'Швидко реагувати та знаходити рішення',
      optionC: 'Передати іншим',
      optionD: 'Відкласти на пізніше',
      correctAnswer: 'B',
      explanation: 'Ефективне вирішення проблем - ключова навичка банкетного менеджера.',
      difficultyLevel: 4
    },
    {
      questionText: 'Що таке декорування залу для банкету?',
      optionA: 'Тільки розстановка квітів',
      optionB: 'Створення атмосфери відповідно до тематики заходу',
      optionC: 'Тільки освітлення',
      optionD: 'Тільки музика',
      correctAnswer: 'B',
      explanation: 'Декорування включає створення цілісної атмосфери заходу.',
      difficultyLevel: 2
    },
    {
      questionText: 'Як банкетний менеджер повинен працювати з постачальниками?',
      optionA: 'Тільки приймати товари',
      optionB: 'Планувати поставки, контролювати якість та терміни',
      optionC: 'Тільки розраховувати вартість',
      optionD: 'Тільки скаржитися на проблеми',
      correctAnswer: 'B',
      explanation: 'Робота з постачальниками включає планування та контроль.',
      difficultyLevel: 3
    },
    {
      questionText: 'Що включає в себе післябанкетне обслуговування?',
      optionA: 'Тільки прибирання',
      optionB: 'Прибирання, розрахунок, збір відгуків та аналіз',
      optionC: 'Тільки розрахунок з клієнтом',
      optionD: 'Тільки збір чайових',
      correctAnswer: 'B',
      explanation: 'Післябанкетне обслуговування включає повний цикл завершення заходу.',
      difficultyLevel: 2
    }
  ],
  'шеф_кухар': [
    {
      questionText: 'Яка основна відповідальність шеф кухара?',
      optionA: 'Тільки приготування страв',
      optionB: 'Керівництво кухнею та контроль якості страв',
      optionC: 'Тільки планування меню',
      optionD: 'Тільки навчання персоналу',
      correctAnswer: 'B',
      explanation: 'Шеф кухар відповідає за всі аспекти роботи кухні.',
      difficultyLevel: 1
    },
    {
      questionText: 'Що включає в себе планування меню?',
      optionA: 'Тільки вибір страв',
      optionB: 'Вибір страв, розрахунок собівартості та баланс меню',
      optionC: 'Тільки ціноутворення',
      optionD: 'Тільки сезонність продуктів',
      correctAnswer: 'B',
      explanation: 'Планування меню - це комплексний процес, що враховує багато факторів.',
      difficultyLevel: 2
    },
    {
      questionText: 'Як шеф кухар повинен контролювати якість страв?',
      optionA: 'Тільки дегустацією',
      optionB: 'Контролем на всіх етапах: закупівля, зберігання, приготування',
      optionC: 'Тільки перевіркою рецептів',
      optionD: 'Тільки навчанням персоналу',
      correctAnswer: 'B',
      explanation: 'Контроль якості включає всі етапи від закупівлі до подачі.',
      difficultyLevel: 3
    },
    {
      questionText: 'Що таке управління кухонним персоналом?',
      optionA: 'Тільки роздача завдань',
      optionB: 'Планування, навчання, мотивація та контроль персоналу',
      optionC: 'Тільки складання графіків',
      optionD: 'Тільки розрахунок зарплат',
      correctAnswer: 'B',
      explanation: 'Управління персоналом включає всі аспекти роботи з командою.',
      difficultyLevel: 3
    },
    {
      questionText: 'Як шеф кухар повинен працювати з продуктами?',
      optionA: 'Тільки приготування',
      optionB: 'Закупівля, зберігання, обробка та використання',
      optionC: 'Тільки зберігання',
      optionD: 'Тільки обробка',
      correctAnswer: 'B',
      explanation: 'Робота з продуктами включає весь цикл від закупівлі до подачі.',
      difficultyLevel: 2
    },
    {
      questionText: 'Що включає в себе розробка рецептів?',
      optionA: 'Тільки запис інгредієнтів',
      optionB: 'Створення рецептів, тестування та стандартизацію',
      optionC: 'Тільки розрахунок часу',
      optionD: 'Тільки розрахунок вартості',
      correctAnswer: 'B',
      explanation: 'Розробка рецептів - це творчий та технічний процес.',
      difficultyLevel: 4
    },
    {
      questionText: 'Як шеф кухар повинен контролювати витрати на кухні?',
      optionA: 'Тільки підрахунком продуктів',
      optionB: 'Контролем закупівель, використання та зменшенням відходів',
      optionC: 'Тільки розрахунком собівартості',
      optionD: 'Тільки інвентаризацією',
      correctAnswer: 'B',
      explanation: 'Контроль витрат включає всі аспекти економіки кухні.',
      difficultyLevel: 3
    },
    {
      questionText: 'Що таке техніка безпеки на кухні?',
      optionA: 'Тільки використання рукавичок',
      optionB: 'Дотримання правил безпеки при роботі з обладнанням та продуктами',
      optionC: 'Тільки прибирання',
      optionD: 'Тільки зберігання інструментів',
      correctAnswer: 'B',
      explanation: 'Безпека на кухні включає всі аспекти безпечної роботи.',
      difficultyLevel: 2
    },
    {
      questionText: 'Як шеф кухар повинен працювати з обладнанням?',
      optionA: 'Тільки використання',
      optionB: 'Використання, догляд, ремонт та заміна обладнання',
      optionC: 'Тільки очищення',
      optionD: 'Тільки налаштування',
      correctAnswer: 'B',
      explanation: 'Робота з обладнанням включає повний цикл експлуатації.',
      difficultyLevel: 3
    },
    {
      questionText: 'Що включає в себе інновації в кулінарії?',
      optionA: 'Тільки нові рецепти',
      optionB: 'Нові техніки, продукти та підходи до приготування',
      optionC: 'Тільки нове обладнання',
      optionD: 'Тільки нові меню',
      correctAnswer: 'B',
      explanation: 'Інновації в кулінарії включають різні аспекти розвитку кухні.',
      difficultyLevel: 4
    }
  ],
  'менеджер_звязку': [
    {
      questionText: 'Яка основна функція менеджера звязку?',
      optionA: 'Тільки відповіді на телефонні дзвінки',
      optionB: 'Управління комунікаціями та взаємодією з клієнтами',
      optionC: 'Тільки ведення соціальних мереж',
      optionD: 'Тільки розсилка реклами',
      correctAnswer: 'B',
      explanation: 'Менеджер звязку відповідає за всі аспекти комунікації з клієнтами.',
      difficultyLevel: 1
    },
    {
      questionText: 'Що включає в себе клієнтський сервіс?',
      optionA: 'Тільки відповіді на запити',
      optionB: 'Комплексне обслуговування: консультації, підтримка, вирішення проблем',
      optionC: 'Тільки прийом замовлень',
      optionD: 'Тільки збір відгуків',
      correctAnswer: 'B',
      explanation: 'Клієнтський сервіс включає всі аспекти взаємодії з клієнтами.',
      difficultyLevel: 2
    },
    {
      questionText: 'Як менеджер звязку повинен працювати зі скаргами?',
      optionA: 'Ігнорувати їх',
      optionB: 'Вислухати, проаналізувати та знайти рішення',
      optionC: 'Передати іншим',
      optionD: 'Тільки записати',
      correctAnswer: 'B',
      explanation: 'Професійний підхід до скарг включає активне вирішення проблем.',
      difficultyLevel: 2
    },
    {
      questionText: 'Що таке CRM система в роботі менеджера звязку?',
      optionA: 'Тільки база даних клієнтів',
      optionB: 'Система управління взаємодією з клієнтами',
      optionC: 'Тільки система розрахунків',
      optionD: 'Тільки система бронювання',
      correctAnswer: 'B',
      explanation: 'CRM - це комплексна система управління клієнтськими відносинами.',
      difficultyLevel: 3
    },
    {
      questionText: 'Як менеджер звязку повинен працювати з соціальними мережами?',
      optionA: 'Тільки публікувати пости',
      optionB: 'Ведення сторінок, взаємодія з аудиторією та моніторинг',
      optionC: 'Тільки відповідати на коментарі',
      optionD: 'Тільки розміщувати рекламу',
      correctAnswer: 'B',
      explanation: 'Робота з соціальними мережами включає комплексний підхід.',
      difficultyLevel: 3
    },
    {
      questionText: 'Що включає в себе маркетингова комунікація?',
      optionA: 'Тільки реклама',
      optionB: 'Планування, реалізація та аналіз комунікаційних кампаній',
      optionC: 'Тільки розсилки',
      optionD: 'Тільки акції',
      correctAnswer: 'B',
      explanation: 'Маркетингова комунікація - це стратегічний підхід до спілкування з аудиторією.',
      difficultyLevel: 3
    },
    {
      questionText: 'Як менеджер звязку повинен аналізувати ефективність комунікацій?',
      optionA: 'Тільки підрахунком відгуків',
      optionB: 'Аналізом метрик, відгуків та конверсій',
      optionC: 'Тільки опитуваннями',
      optionD: 'Тільки спостереженням',
      correctAnswer: 'B',
      explanation: 'Аналіз ефективності включає різні методики вимірювання.',
      difficultyLevel: 4
    },
    {
      questionText: 'Що таке кризові комунікації?',
      optionA: 'Тільки вибачення',
      optionB: 'Управління репутацією під час кризових ситуацій',
      optionC: 'Тільки замовчування проблем',
      optionD: 'Тільки перекладання відповідальності',
      correctAnswer: 'B',
      explanation: 'Кризові комунікації - це стратегічний підхід до управління репутацією.',
      difficultyLevel: 4
    },
    {
      questionText: 'Як менеджер звязку повинен працювати з медіа?',
      optionA: 'Тільки давати інтерв\'ю',
      optionB: 'Підготовка прес-релізів, комунікація з журналістами',
      optionC: 'Тільки відповідати на запити',
      optionD: 'Тільки уникнення контактів',
      correctAnswer: 'B',
      explanation: 'Робота з медіа включає активну комунікацію та підготовку матеріалів.',
      difficultyLevel: 3
    },
    {
      questionText: 'Що включає в себе внутрішні комунікації?',
      optionA: 'Тільки розсилки персоналу',
      optionB: 'Комунікація з персоналом, передача інформації та мотивація',
      optionC: 'Тільки наради',
      optionD: 'Тільки інструкції',
      correctAnswer: 'B',
      explanation: 'Внутрішні комунікації включають всі аспекти спілкування з командою.',
      difficultyLevel: 2
    }
  ]
};

async function initPositionsAndQuestions() {
  try {
    console.log('🔄 Початок ініціалізації посад та питань...');
    
    // Очищення існуючих даних
    await Position.deleteMany({});
    await Question.deleteMany({});
    console.log('✅ Очищено існуючі дані');
    
    // Створення тестового користувача для createdBy
    const testUser = await User.findOne({ email: 'admin@test.com' });
    let createdByUserId;
    
    if (!testUser) {
      // Спочатку створимо першу посаду
      const firstPosition = await Position.createPosition({
        ...positions[0],
        createdBy: null // Тимчасово null
      });
      
      const newUser = await User.create({
        firstName: 'Admin',
        lastName: 'Test',
        email: 'admin@test.com',
        passwordHash: 'test123',
        city: 'Test City',
        position: firstPosition._id,
        isAdmin: true
      });
      
      // Оновимо посаду з правильним createdBy
      await Position.findByIdAndUpdate(firstPosition._id, {
        createdBy: newUser._id
      });
      
      createdByUserId = newUser._id;
    } else {
      createdByUserId = testUser._id;
    }
    
    // Створення решти посад
    const createdPositions = await Position.find({});
    for (let i = 1; i < positions.length; i++) {
      const position = await Position.createPosition({
        ...positions[i],
        createdBy: createdByUserId
      });
      createdPositions.push(position);
      console.log(`✅ Створено посаду: ${position.name}`);
    }
    
    // Створення питань для кожної посади
    for (const position of createdPositions) {
      const positionQuestions = questions[position.category];
      if (positionQuestions) {
        for (const questionData of positionQuestions) {
          const question = await Question.createQuestion({
            ...questionData,
            positionId: position._id
          });
          console.log(`✅ Створено питання для ${position.name}: ${question.questionText.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('🎉 Ініціалізація завершена успішно!');
    console.log(`📊 Створено ${createdPositions.length} посад`);
    
    const totalQuestions = await Question.countDocuments();
    console.log(`📊 Створено ${totalQuestions} питань`);
    
  } catch (error) {
    console.error('❌ Помилка під час ініціалізації:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Відключено від бази даних');
  }
}

initPositionsAndQuestions();
