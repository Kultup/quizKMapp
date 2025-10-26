const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Question = require('./src/models/Question');
const { DailyQuiz, UserQuizAttempt, UserAnswer } = require('./src/models/Quiz');

async function createTestData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp');
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await UserAnswer.deleteMany({});
        await UserQuizAttempt.deleteMany({});
        await DailyQuiz.deleteMany({});
        await Question.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});
        console.log('Existing data cleared');

        // Create test categories
        const categories = await Category.insertMany([
            {
                name: 'Математика',
                description: 'Питання з математики',
                isActive: true
            },
            {
                name: 'Історія',
                description: 'Питання з історії України',
                isActive: true
            },
            {
                name: 'Географія',
                description: 'Питання з географії',
                isActive: true
            },
            {
                name: 'Наука',
                description: 'Питання з природничих наук',
                isActive: true
            }
        ]);
        console.log('Created categories:', categories.length);

        // Create test questions
        const questions = [];
        const mathCategory = categories[0]._id;
        const historyCategory = categories[1]._id;
        const geoCategory = categories[2]._id;
        const scienceCategory = categories[3]._id;

        // Math questions (20 questions)
        questions.push(
            {
                categoryId: mathCategory,
                questionText: 'Скільки буде 2 + 2?',
                optionA: '3',
                optionB: '4',
                optionC: '5',
                optionD: '6',
                correctAnswer: 'B',
                explanation: '2 + 2 = 4',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює квадратний корінь з 16?',
                optionA: '2',
                optionB: '3',
                optionC: '4',
                optionD: '8',
                correctAnswer: 'C',
                explanation: '√16 = 4',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки буде 5 × 7?',
                optionA: '30',
                optionB: '35',
                optionC: '40',
                optionD: '45',
                correctAnswer: 'B',
                explanation: '5 × 7 = 35',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює 100 ÷ 4?',
                optionA: '20',
                optionB: '25',
                optionC: '30',
                optionD: '35',
                correctAnswer: 'B',
                explanation: '100 ÷ 4 = 25',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки відсотків становить 1/4?',
                optionA: '20%',
                optionB: '25%',
                optionC: '30%',
                optionD: '40%',
                correctAnswer: 'B',
                explanation: '1/4 = 0.25 = 25%',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює площа квадрата зі стороною 6 см?',
                optionA: '24 см²',
                optionB: '30 см²',
                optionC: '36 см²',
                optionD: '42 см²',
                correctAnswer: 'C',
                explanation: 'Площа квадрата = сторона² = 6² = 36 см²',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки буде 15 - 8 + 3?',
                optionA: '8',
                optionB: '9',
                optionC: '10',
                optionD: '11',
                correctAnswer: 'C',
                explanation: '15 - 8 + 3 = 7 + 3 = 10',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює периметр прямокутника 4×6 см?',
                optionA: '18 см',
                optionB: '20 см',
                optionC: '22 см',
                optionD: '24 см',
                correctAnswer: 'B',
                explanation: 'Периметр = 2(4 + 6) = 2 × 10 = 20 см',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки буде 3³?',
                optionA: '9',
                optionB: '18',
                optionC: '27',
                optionD: '36',
                correctAnswer: 'C',
                explanation: '3³ = 3 × 3 × 3 = 27',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює 0.5 + 0.25?',
                optionA: '0.65',
                optionB: '0.70',
                optionC: '0.75',
                optionD: '0.80',
                correctAnswer: 'C',
                explanation: '0.5 + 0.25 = 0.75',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки градусів у прямому куті?',
                optionA: '45°',
                optionB: '60°',
                optionC: '90°',
                optionD: '180°',
                correctAnswer: 'C',
                explanation: 'Прямий кут дорівнює 90°',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює квадратний корінь з 25?',
                optionA: '4',
                optionB: '5',
                optionC: '6',
                optionD: '7',
                correctAnswer: 'B',
                explanation: '√25 = 5',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки буде 12 × 8?',
                optionA: '84',
                optionB: '88',
                optionC: '92',
                optionD: '96',
                correctAnswer: 'D',
                explanation: '12 × 8 = 96',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює 2/3 від 18?',
                optionA: '10',
                optionB: '12',
                optionC: '14',
                optionD: '16',
                correctAnswer: 'B',
                explanation: '2/3 × 18 = 36/3 = 12',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки сторін у восьмикутнику?',
                optionA: '6',
                optionB: '7',
                optionC: '8',
                optionD: '9',
                correctAnswer: 'C',
                explanation: 'Восьмикутник має 8 сторін',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює 144 ÷ 12?',
                optionA: '10',
                optionB: '11',
                optionC: '12',
                optionD: '13',
                correctAnswer: 'C',
                explanation: '144 ÷ 12 = 12',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки буде 7² - 3²?',
                optionA: '36',
                optionB: '40',
                optionC: '44',
                optionD: '48',
                correctAnswer: 'B',
                explanation: '7² - 3² = 49 - 9 = 40',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює об\'єм куба зі стороною 3 см?',
                optionA: '9 см³',
                optionB: '18 см³',
                optionC: '27 см³',
                optionD: '36 см³',
                correctAnswer: 'C',
                explanation: 'Об\'єм куба = сторона³ = 3³ = 27 см³',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Скільки буде 15% від 200?',
                optionA: '25',
                optionB: '30',
                optionC: '35',
                optionD: '40',
                correctAnswer: 'B',
                explanation: '15% від 200 = 0.15 × 200 = 30',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: mathCategory,
                questionText: 'Чому дорівнює сума кутів трикутника?',
                optionA: '90°',
                optionB: '120°',
                optionC: '180°',
                optionD: '360°',
                correctAnswer: 'C',
                explanation: 'Сума кутів трикутника завжди дорівнює 180°',
                difficultyLevel: 2,
                isActive: true
            }
        );

        // History questions (20 questions)
        questions.push(
            {
                categoryId: historyCategory,
                questionText: 'В якому році Україна проголосила незалежність?',
                optionA: '1990',
                optionB: '1991',
                optionC: '1992',
                optionD: '1993',
                correctAnswer: 'B',
                explanation: 'Україна проголосила незалежність 24 серпня 1991 року',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Хто був першим президентом України?',
                optionA: 'Леонід Кравчук',
                optionB: 'Леонід Кучма',
                optionC: 'Віктор Ющенко',
                optionD: 'Петро Порошенко',
                correctAnswer: 'A',
                explanation: 'Леонід Кравчук був першим президентом незалежної України',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'В якому році відбулася Помаранчева революція?',
                optionA: '2003',
                optionB: '2004',
                optionC: '2005',
                optionD: '2006',
                correctAnswer: 'B',
                explanation: 'Помаранчева революція відбулася в 2004 році',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Хто був гетьманом України в 1648-1657 роках?',
                optionA: 'Іван Мазепа',
                optionB: 'Петро Сагайдачний',
                optionC: 'Богдан Хмельницький',
                optionD: 'Іван Виговський',
                correctAnswer: 'C',
                explanation: 'Богдан Хмельницький був гетьманом України в 1648-1657 роках',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'В якому році відбулася Чорнобильська катастрофа?',
                optionA: '1985',
                optionB: '1986',
                optionC: '1987',
                optionD: '1988',
                correctAnswer: 'B',
                explanation: 'Чорнобильська катастрофа відбулася 26 квітня 1986 року',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Яка битва відбулася під Полтавою в 1709 році?',
                optionA: 'Битва з турками',
                optionB: 'Битва з поляками',
                optionC: 'Битва зі шведами',
                optionD: 'Битва з татарами',
                correctAnswer: 'C',
                explanation: 'Полтавська битва 1709 року - битва між російськими та шведськими військами',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Хто написав "Енеїду"?',
                optionA: 'Тарас Шевченко',
                optionB: 'Іван Котляревський',
                optionC: 'Леся Українка',
                optionD: 'Іван Франко',
                correctAnswer: 'B',
                explanation: 'Іван Котляревський написав "Енеїду" - першу українську літературну поему',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'В якому році було створено Київську Русь?',
                optionA: '862',
                optionB: '882',
                optionC: '912',
                optionD: '945',
                correctAnswer: 'B',
                explanation: 'Київська Русь була створена в 882 році князем Олегом',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Хто був князем Київської Русі під час хрещення?',
                optionA: 'Олег',
                optionB: 'Ігор',
                optionC: 'Святослав',
                optionD: 'Володимир',
                correctAnswer: 'D',
                explanation: 'Князь Володимир Великий хрестив Київську Русь у 988 році',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'В якому році відбулася Революція Гідності?',
                optionA: '2013',
                optionB: '2014',
                optionC: '2015',
                optionD: '2016',
                correctAnswer: 'B',
                explanation: 'Революція Гідності відбулася в 2013-2014 роках',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Яке місто було столицею Галицько-Волинського князівства?',
                optionA: 'Львів',
                optionB: 'Галич',
                optionC: 'Володимир',
                optionD: 'Луцьк',
                correctAnswer: 'B',
                explanation: 'Галич був столицею Галицько-Волинського князівства',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Хто був останнім гетьманом України?',
                optionA: 'Іван Мазепа',
                optionB: 'Кирило Розумовський',
                optionC: 'Данило Апостол',
                optionD: 'Павло Полуботок',
                correctAnswer: 'B',
                explanation: 'Кирило Розумовський був останнім гетьманом України (1750-1764)',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'В якому році було підписано Переяславську угоду?',
                optionA: '1648',
                optionB: '1654',
                optionC: '1657',
                optionD: '1667',
                correctAnswer: 'B',
                explanation: 'Переяславська угода була підписана в 1654 році',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Хто очолював УПА?',
                optionA: 'Степан Бандера',
                optionB: 'Роман Шухевич',
                optionC: 'Євген Коновалець',
                optionD: 'Андрій Мельник',
                correctAnswer: 'B',
                explanation: 'Роман Шухевич очолював УПА під псевдонімом Тарас Чупринка',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'В якому році було створено Запорізьку Січ?',
                optionA: '1552',
                optionB: '1556',
                optionC: '1564',
                optionD: '1570',
                correctAnswer: 'B',
                explanation: 'Запорізька Січ була створена близько 1556 року',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Хто був автором "Кобзаря"?',
                optionA: 'Іван Франко',
                optionB: 'Леся Українка',
                optionC: 'Тарас Шевченко',
                optionD: 'Панас Мирний',
                correctAnswer: 'C',
                explanation: 'Тарас Шевченко написав збірку "Кобзар"',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'В якому році відбулася битва під Берестечком?',
                optionA: '1648',
                optionB: '1649',
                optionC: '1651',
                optionD: '1654',
                correctAnswer: 'C',
                explanation: 'Битва під Берестечком відбулася в 1651 році',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Хто був першим президентом незалежної України?',
                optionA: 'Леонід Кравчук',
                optionB: 'Леонід Кучма',
                optionC: 'Віктор Ющенко',
                optionD: 'Віктор Янукович',
                correctAnswer: 'A',
                explanation: 'Леонід Кравчук був першим президентом незалежної України',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'В якому році Україна стала членом ООН?',
                optionA: '1945',
                optionB: '1991',
                optionC: '1992',
                optionD: '1993',
                correctAnswer: 'A',
                explanation: 'Україна стала членом ООН в 1945 році як Українська РСР',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: historyCategory,
                questionText: 'Яка подія відбулася 9 травня 1945 року?',
                optionA: 'Початок війни',
                optionB: 'Капітуляція Німеччини',
                optionC: 'Звільнення Києва',
                optionD: 'Битва за Берлін',
                correctAnswer: 'B',
                explanation: '9 травня 1945 року - день капітуляції нацистської Німеччини',
                difficultyLevel: 2,
                isActive: true
            }
        );

        // Geography questions (20 questions)
        questions.push(
            {
                categoryId: geoCategory,
                questionText: 'Яка столиця України?',
                optionA: 'Харків',
                optionB: 'Львів',
                optionC: 'Київ',
                optionD: 'Одеса',
                correctAnswer: 'C',
                explanation: 'Київ є столицею України',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яка найвища гора в Україні?',
                optionA: 'Говерла',
                optionB: 'Петрос',
                optionC: 'Піп Іван',
                optionD: 'Роман-Кош',
                correctAnswer: 'A',
                explanation: 'Говерла (2061 м) - найвища гора України',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яка найдовша річка в Україні?',
                optionA: 'Дністер',
                optionB: 'Дніпро',
                optionC: 'Південний Буг',
                optionD: 'Сіверський Донець',
                correctAnswer: 'B',
                explanation: 'Дніпро - найдовша річка України (981 км в межах країни)',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яке найбільше озеро в Україні?',
                optionA: 'Світязь',
                optionB: 'Ялпуг',
                optionC: 'Кагул',
                optionD: 'Синевир',
                correctAnswer: 'B',
                explanation: 'Ялпуг - найбільше природне озеро України',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'В якій області знаходиться місто Чернівці?',
                optionA: 'Івано-Франківська',
                optionB: 'Тернопільська',
                optionC: 'Чернівецька',
                optionD: 'Хмельницька',
                correctAnswer: 'C',
                explanation: 'Чернівці - обласний центр Чернівецької області',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яке море омиває Україну з півдня?',
                optionA: 'Балтійське',
                optionB: 'Чорне',
                optionC: 'Каспійське',
                optionD: 'Азовське',
                correctAnswer: 'B',
                explanation: 'Чорне море омиває Україну з півдня',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Скільки областей в Україні?',
                optionA: '22',
                optionB: '23',
                optionC: '24',
                optionD: '25',
                correctAnswer: 'C',
                explanation: 'В Україні 24 області',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яка область має найбільшу площу?',
                optionA: 'Одеська',
                optionB: 'Харківська',
                optionC: 'Дніпропетровська',
                optionD: 'Київська',
                correctAnswer: 'A',
                explanation: 'Одеська область має найбільшу площу серед областей України',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'З якою країною Україна має найдовший кордон?',
                optionA: 'Польща',
                optionB: 'Росія',
                optionC: 'Білорусь',
                optionD: 'Румунія',
                correctAnswer: 'B',
                explanation: 'Україна має найдовший кордон з Росією',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'В якій частині України розташовані Карпати?',
                optionA: 'Північній',
                optionB: 'Південній',
                optionC: 'Західній',
                optionD: 'Східній',
                correctAnswer: 'C',
                explanation: 'Карпати розташовані в західній частині України',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яке місто є найбільшим портом України?',
                optionA: 'Маріуполь',
                optionB: 'Одеса',
                optionC: 'Миколаїв',
                optionD: 'Херсон',
                correctAnswer: 'B',
                explanation: 'Одеса - найбільший морський порт України',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яка річка протікає через Львів?',
                optionA: 'Дністер',
                optionB: 'Західний Буг',
                optionC: 'Полтва',
                optionD: 'Стрий',
                correctAnswer: 'C',
                explanation: 'Річка Полтва протікає через Львів',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'В якій області знаходиться Чорнобиль?',
                optionA: 'Житомирська',
                optionB: 'Київська',
                optionC: 'Чернігівська',
                optionD: 'Рівненська',
                correctAnswer: 'B',
                explanation: 'Чорнобиль знаходиться в Київській області',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яка найпівденніша точка України?',
                optionA: 'Мис Сарич',
                optionB: 'Мис Тарханкут',
                optionC: 'Мис Херсонес',
                optionD: 'Мис Фіолент',
                correctAnswer: 'A',
                explanation: 'Мис Сарич - найпівденніша точка України',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яке місто називають "Північною Венецією"?',
                optionA: 'Київ',
                optionB: 'Харків',
                optionC: 'Санкт-Петербург',
                optionD: 'Львів',
                correctAnswer: 'C',
                explanation: 'Санкт-Петербург називають "Північною Венецією"',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яка столиця Закарпатської області?',
                optionA: 'Мукачево',
                optionB: 'Ужгород',
                optionC: 'Берегове',
                optionD: 'Хуст',
                correctAnswer: 'B',
                explanation: 'Ужгород - столиця Закарпатської області',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яка найвища точка Кримських гір?',
                optionA: 'Роман-Кош',
                optionB: 'Ай-Петрі',
                optionC: 'Чатир-Даг',
                optionD: 'Демерджі',
                correctAnswer: 'A',
                explanation: 'Роман-Кош (1545 м) - найвища точка Кримських гір',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яке місто є центром Полтавської області?',
                optionA: 'Кременчук',
                optionB: 'Полтава',
                optionC: 'Лубни',
                optionD: 'Миргород',
                correctAnswer: 'B',
                explanation: 'Полтава - обласний центр Полтавської області',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'Яка річка є притокою Дніпра?',
                optionA: 'Дністер',
                optionB: 'Південний Буг',
                optionC: 'Десна',
                optionD: 'Прут',
                correctAnswer: 'C',
                explanation: 'Десна - найбільша притока Дніпра',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: geoCategory,
                questionText: 'В якій області знаходиться місто Кривий Ріг?',
                optionA: 'Дніпропетровська',
                optionB: 'Запорізька',
                optionC: 'Кіровоградська',
                optionD: 'Херсонська',
                correctAnswer: 'A',
                explanation: 'Кривий Ріг знаходиться в Дніпропетровській області',
                difficultyLevel: 2,
                isActive: true
            }
        );

        // Science questions (20 questions)
        questions.push(
            {
                categoryId: scienceCategory,
                questionText: 'Скільки планет у Сонячній системі?',
                optionA: '7',
                optionB: '8',
                optionC: '9',
                optionD: '10',
                correctAnswer: 'B',
                explanation: 'У Сонячній системі 8 планет',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Який хімічний символ у води?',
                optionA: 'H2O',
                optionB: 'CO2',
                optionC: 'O2',
                optionD: 'H2',
                correctAnswer: 'A',
                explanation: 'Вода має хімічну формулу H2O',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Яка швидкість світла у вакуумі?',
                optionA: '300 000 км/с',
                optionB: '299 792 458 м/с',
                optionC: '150 000 км/с',
                optionD: '500 000 км/с',
                correctAnswer: 'B',
                explanation: 'Швидкість світла у вакуумі дорівнює 299 792 458 м/с',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Який газ найбільше у земній атмосфері?',
                optionA: 'Кисень',
                optionB: 'Вуглекислий газ',
                optionC: 'Азот',
                optionD: 'Аргон',
                correctAnswer: 'C',
                explanation: 'Азот становить близько 78% земної атмосфери',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Скільки хромосом у людини?',
                optionA: '44',
                optionB: '46',
                optionC: '48',
                optionD: '50',
                correctAnswer: 'B',
                explanation: 'У людини 46 хромосом (23 пари)',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Який найтвердіший природний мінерал?',
                optionA: 'Кварц',
                optionB: 'Алмаз',
                optionC: 'Топаз',
                optionD: 'Корунд',
                correctAnswer: 'B',
                explanation: 'Алмаз - найтвердіший природний мінерал',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'При якій температурі кипить вода?',
                optionA: '90°C',
                optionB: '95°C',
                optionC: '100°C',
                optionD: '105°C',
                correctAnswer: 'C',
                explanation: 'Вода кипить при 100°C за нормального атмосферного тиску',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Який орган виробляє інсулін?',
                optionA: 'Печінка',
                optionB: 'Нирки',
                optionC: 'Підшлункова залоза',
                optionD: 'Селезінка',
                correctAnswer: 'C',
                explanation: 'Інсулін виробляється підшлунковою залозою',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Яка найближча до Землі зірка?',
                optionA: 'Альфа Центавра',
                optionB: 'Сіріус',
                optionC: 'Сонце',
                optionD: 'Проксима Центавра',
                correctAnswer: 'C',
                explanation: 'Сонце - найближча до Землі зірка',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Скільки кісток у дорослої людини?',
                optionA: '196',
                optionB: '206',
                optionC: '216',
                optionD: '226',
                correctAnswer: 'B',
                explanation: 'У дорослої людини 206 кісток',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Який хімічний елемент має символ Au?',
                optionA: 'Срібло',
                optionB: 'Алюміній',
                optionC: 'Золото',
                optionD: 'Мідь',
                correctAnswer: 'C',
                explanation: 'Au - хімічний символ золота (від латинського aurum)',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Яка найбільша планета Сонячної системи?',
                optionA: 'Сатурн',
                optionB: 'Юпітер',
                optionC: 'Нептун',
                optionD: 'Уран',
                correctAnswer: 'B',
                explanation: 'Юпітер - найбільша планета Сонячної системи',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Що таке ДНК?',
                optionA: 'Дезоксирибонуклеїнова кислота',
                optionB: 'Дигідроксинуклеїнова кислота',
                optionC: 'Динітронуклеїнова кислота',
                optionD: 'Дихлорнуклеїнова кислота',
                correctAnswer: 'A',
                explanation: 'ДНК - дезоксирибонуклеїнова кислота',
                difficultyLevel: 3,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Скільки камер у серці людини?',
                optionA: '2',
                optionB: '3',
                optionC: '4',
                optionD: '5',
                correctAnswer: 'C',
                explanation: 'Серце людини має 4 камери: 2 передсердя і 2 шлуночки',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Який газ рослини поглинають під час фотосинтезу?',
                optionA: 'Кисень',
                optionB: 'Азот',
                optionC: 'Вуглекислий газ',
                optionD: 'Водень',
                correctAnswer: 'C',
                explanation: 'Рослини поглинають вуглекислий газ під час фотосинтезу',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'При якій температурі замерзає вода?',
                optionA: '-5°C',
                optionB: '0°C',
                optionC: '5°C',
                optionD: '10°C',
                correctAnswer: 'B',
                explanation: 'Вода замерзає при 0°C за нормального атмосферного тиску',
                difficultyLevel: 1,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Яка одиниця вимірювання електричного струму?',
                optionA: 'Вольт',
                optionB: 'Ампер',
                optionC: 'Ом',
                optionD: 'Ват',
                correctAnswer: 'B',
                explanation: 'Ампер - одиниця вимірювання електричного струму',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Скільки зубів у дорослої людини?',
                optionA: '28',
                optionB: '30',
                optionC: '32',
                optionD: '34',
                correctAnswer: 'C',
                explanation: 'У дорослої людини 32 зуби (включаючи зуби мудрості)',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Який найлегший хімічний елемент?',
                optionA: 'Гелій',
                optionB: 'Водень',
                optionC: 'Літій',
                optionD: 'Берилій',
                correctAnswer: 'B',
                explanation: 'Водень - найлегший хімічний елемент',
                difficultyLevel: 2,
                isActive: true
            },
            {
                categoryId: scienceCategory,
                questionText: 'Яка нормальна температура тіла людини?',
                optionA: '35.5°C',
                optionB: '36.6°C',
                optionC: '37.5°C',
                optionD: '38.0°C',
                correctAnswer: 'B',
                explanation: 'Нормальна температура тіла людини 36.6°C',
                difficultyLevel: 1,
                isActive: true
            }
        );

        const createdQuestions = await Question.insertMany(questions);
        console.log('Created questions:', createdQuestions.length);

        // Create test users
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash('password123', saltRounds);

        const users = await User.insertMany([
            {
                firstName: 'Іван',
                lastName: 'Петренко',
                city: 'Київ',
                position: 'Розробник',
                email: 'ivan@example.com',
                passwordHash: hashedPassword,
                isActive: true,
                isAdmin: false,
                totalScore: 85,
                testsCompleted: 3,
                registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
                lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                firstName: 'Марія',
                lastName: 'Коваленко',
                city: 'Львів',
                position: 'Дизайнер',
                email: 'maria@example.com',
                passwordHash: hashedPassword,
                isActive: true,
                isAdmin: false,
                totalScore: 92,
                testsCompleted: 5,
                registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
                lastLogin: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
            },
            {
                firstName: 'Олександр',
                lastName: 'Сидоренко',
                city: 'Одеса',
                position: 'Менеджер',
                email: 'alex@example.com',
                passwordHash: hashedPassword,
                isActive: true,
                isAdmin: false,
                totalScore: 78,
                testsCompleted: 2,
                registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
                lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            },
            {
                firstName: 'Анна',
                lastName: 'Мельник',
                city: 'Харків',
                position: 'Аналітик',
                email: 'anna@example.com',
                passwordHash: hashedPassword,
                isActive: true,
                isAdmin: false,
                totalScore: 95,
                testsCompleted: 7,
                registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21), // 21 days ago
                lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
            }
        ]);
        console.log('Created users:', users.length);

        // Create test daily quizzes
        const quizzes = [];
        for (let i = 0; i < 7; i++) {
            const quizDate = new Date();
            quizDate.setDate(quizDate.getDate() - i);
            
            const quiz = await DailyQuiz.create({
                quizDate: quizDate,
                questions: createdQuestions.slice(i * 3, (i + 1) * 3).map(q => ({
                    questionId: q._id,
                    question: q.questionText,
                    options: [q.optionA, q.optionB, q.optionC, q.optionD],
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation
                })),
                isSent: true,
                sentAt: quizDate
            });
            quizzes.push(quiz);
        }
        console.log('Created daily quizzes:', quizzes.length);

        // Create test quiz attempts
        const attempts = [];
        for (let i = 0; i < 15; i++) {
            const user = users[i % users.length];
            const quiz = quizzes[i % quizzes.length];
            
            const attempt = await UserQuizAttempt.create({
                userId: user._id,
                quizId: quiz._id,
                answers: quiz.questions.map((q, index) => ({
                    questionId: q.questionId,
                    selectedAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
                    isCorrect: Math.random() > 0.3
                })),
                score: Math.floor(Math.random() * 100),
                completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                isCompleted: true
            });
            attempts.push(attempt);
        }
        console.log('Created quiz attempts:', attempts.length);

        console.log('\n✅ Test data created successfully!');
        console.log('📊 Summary:');
        console.log(`   - Categories: ${categories.length}`);
        console.log(`   - Questions: ${createdQuestions.length}`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Daily Quizzes: ${quizzes.length}`);
        console.log(`   - Quiz Attempts: ${attempts.length}`);

    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
createTestData();