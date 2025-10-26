const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Question = require('./src/models/Question');
const { DailyQuiz, UserQuizAttempt, UserAnswer } = require('./src/models/Quiz');

async function addMissingData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp');
        console.log('Connected to MongoDB');

        // Get existing data
        const existingUsers = await User.find({});
        const existingQuestions = await Question.find({});
        const existingQuizzes = await DailyQuiz.find({});

        console.log(`Existing users: ${existingUsers.length}`);
        console.log(`Existing questions: ${existingQuestions.length}`);
        console.log(`Existing quizzes: ${existingQuizzes.length}`);

        // Add more users if needed
        if (existingUsers.length < 5) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const newUsers = [];
            
            const userTemplates = [
                { firstName: 'Олександр', lastName: 'Петренко', city: 'Київ', position: 'Розробник', email: 'oleksandr@example.com' },
                { firstName: 'Марія', lastName: 'Іваненко', city: 'Львів', position: 'Дизайнер', email: 'maria@example.com' },
                { firstName: 'Дмитро', lastName: 'Коваленко', city: 'Одеса', position: 'Менеджер', email: 'dmytro@example.com' },
                { firstName: 'Анна', lastName: 'Сидоренко', city: 'Харків', position: 'Аналітик', email: 'anna@example.com' },
                { firstName: 'Віктор', lastName: 'Мельник', city: 'Дніпро', position: 'Тестувальник', email: 'viktor@example.com' }
            ];

            for (let i = existingUsers.length; i < 5; i++) {
                const template = userTemplates[i];
                try {
                    const user = await User.create({
                        ...template,
                        passwordHash: hashedPassword,
                        isActive: true,
                        totalScore: Math.floor(Math.random() * 1000),
                        testsCompleted: Math.floor(Math.random() * 20),
                        registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                    });
                    newUsers.push(user);
                } catch (error) {
                    if (error.code !== 11000) { // Ignore duplicate key errors
                        console.error(`Error creating user ${template.email}:`, error.message);
                    }
                }
            }
            console.log(`Added ${newUsers.length} new users`);
        }

        // Create daily quizzes if needed
        if (existingQuizzes.length < 7 && existingQuestions.length >= 3) {
            const newQuizzes = [];
            
            for (let i = 0; i < 7; i++) {
                const quizDate = new Date();
                quizDate.setDate(quizDate.getDate() - i);
                
                // Check if quiz for this date already exists
                const existingQuiz = await DailyQuiz.findOne({
                    quizDate: {
                        $gte: new Date(quizDate.getFullYear(), quizDate.getMonth(), quizDate.getDate()),
                        $lt: new Date(quizDate.getFullYear(), quizDate.getMonth(), quizDate.getDate() + 1)
                    }
                });

                if (!existingQuiz) {
                    const questionsForQuiz = existingQuestions.slice(i * 3, (i + 1) * 3);
                    if (questionsForQuiz.length >= 3) {
                        try {
                            const quiz = await DailyQuiz.create({
                                quizDate: quizDate,
                                questions: questionsForQuiz.map(q => ({
                                    questionId: q._id,
                                    question: q.questionText,
                                    options: [q.optionA, q.optionB, q.optionC, q.optionD],
                                    correctAnswer: q.correctAnswer,
                                    explanation: q.explanation || 'Пояснення відсутнє'
                                })),
                                isSent: true,
                                sentAt: quizDate
                            });
                            newQuizzes.push(quiz);
                        } catch (error) {
                            console.error(`Error creating quiz for ${quizDate}:`, error.message);
                        }
                    }
                }
            }
            console.log(`Added ${newQuizzes.length} new daily quizzes`);
        }

        // Get all users and quizzes for creating attempts
        const allUsers = await User.find({});
        const allQuizzes = await DailyQuiz.find({});

        // Create quiz attempts if needed
        const existingAttempts = await UserQuizAttempt.find({});
        if (existingAttempts.length < 15 && allUsers.length > 0 && allQuizzes.length > 0) {
            const newAttempts = [];
            
            for (let i = 0; i < 15; i++) {
                const user = allUsers[i % allUsers.length];
                const quiz = allQuizzes[i % allQuizzes.length];
                
                // Check if attempt already exists
                const existingAttempt = await UserQuizAttempt.findOne({
                    userId: user._id,
                    quizId: quiz._id
                });

                if (!existingAttempt && quiz.questions.length > 0) {
                    try {
                        const correctAnswers = Math.floor(Math.random() * quiz.questions.length);
                        const score = Math.round((correctAnswers / quiz.questions.length) * 100);
                        
                        const attempt = await UserQuizAttempt.create({
                            userId: user._id,
                            quizId: quiz._id,
                            answers: quiz.questions.map((q, index) => ({
                                questionId: q.questionId,
                                selectedAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
                                isCorrect: index < correctAnswers
                            })),
                            score: score,
                            completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                            isCompleted: true
                        });
                        newAttempts.push(attempt);
                    } catch (error) {
                        console.error(`Error creating attempt for user ${user.email}:`, error.message);
                    }
                }
            }
            console.log(`Added ${newAttempts.length} new quiz attempts`);
        }

        console.log('\n=== Data Summary ===');
        const finalUsers = await User.find({});
        const finalQuestions = await Question.find({});
        const finalQuizzes = await DailyQuiz.find({});
        const finalAttempts = await UserQuizAttempt.find({});
        
        console.log(`Total users: ${finalUsers.length}`);
        console.log(`Total questions: ${finalQuestions.length}`);
        console.log(`Total daily quizzes: ${finalQuizzes.length}`);
        console.log(`Total quiz attempts: ${finalAttempts.length}`);

    } catch (error) {
        console.error('Error adding missing data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addMissingData();