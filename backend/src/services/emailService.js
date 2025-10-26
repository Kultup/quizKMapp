const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  async sendQuizNotification(userEmail, userName, quizData) {
    if (!this.transporter) {
      console.log('Email service not configured, skipping email notification');
      return;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Щоденний квіз готовий!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Привіт, ${userName}!</h2>
            <p>Сьогоднішній квіз готовий до проходження. У вас є питання з ${quizData.questions.length} питань різних категорій.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Категорії питань:</h3>
              <ul>
                ${quizData.questions.map(q => `<li>${q.categoryName}</li>`).join('')}
              </ul>
            </div>
            
            <p><strong>Важливо:</strong> Квіз доступний до 00:00. Не забудьте пройти його вчасно!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/quiz" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Пройти квіз
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">
              Якщо у вас виникли питання, зверніться до адміністратора.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Quiz notification sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending quiz notification:', error);
    }
  }

  async sendQuizReminder(userEmail, userName, hoursLeft) {
    if (!this.transporter) {
      console.log('Email service not configured, skipping email reminder');
      return;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Нагадування: Квіз закінчується через ${hoursLeft} годин`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Нагадування про квіз</h2>
            <p>Привіт, ${userName}!</p>
            <p>Ви ще не пройшли сьогоднішній квіз. До завершення залишилося <strong>${hoursLeft} годин</strong>.</p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⏰ Дедлайн:</strong> 00:00 сьогодні
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/quiz" 
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Пройти квіз зараз
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">
              Якщо ви вже пройшли квіз, проігноруйте це повідомлення.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Quiz reminder sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending quiz reminder:', error);
    }
  }

  async sendQuizResult(userEmail, userName, result) {
    if (!this.transporter) {
      console.log('Email service not configured, skipping result email');
      return;
    }

    try {
      const percentage = Math.round((result.score / result.totalQuestions) * 100);
      const isGoodResult = percentage >= 80;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Результат квізу: ${result.score}/${result.totalQuestions}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${isGoodResult ? '#28a745' : '#dc3545'};">
              ${isGoodResult ? '🎉 Відмінний результат!' : '📚 Є над чим попрацювати'}
            </h2>
            <p>Привіт, ${userName}!</p>
            <p>Ось результати вашого квізу:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span><strong>Правильних відповідей:</strong></span>
                <span style="color: ${isGoodResult ? '#28a745' : '#dc3545'}; font-weight: bold;">
                  ${result.score}/${result.totalQuestions}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span><strong>Відсоток:</strong></span>
                <span style="color: ${isGoodResult ? '#28a745' : '#dc3545'}; font-weight: bold;">
                  ${percentage}%
                </span>
              </div>
            </div>
            
            ${!isGoodResult ? `
              <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #0c5460;">
                  <strong>💡 Порада:</strong> Перегляньте базу знань для покращення результатів у майбутньому.
                </p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/knowledge-base" 
                 style="background-color: #6c757d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                База знань
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">
              Дякуємо за участь у квізі! Завтра очікуйте нові питання.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Quiz result sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending quiz result:', error);
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    if (!this.transporter) {
      console.log('Email service not configured, skipping welcome email');
      return;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Ласкаво просимо до Quiz App!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Ласкаво просимо, ${userName}!</h2>
            <p>Дякуємо за реєстрацію в Quiz App. Тепер ви можете:</p>
            
            <ul style="color: #495057;">
              <li>Проходити щоденні квізи з питань різних категорій</li>
              <li>Переглядати базу знань для підготовки</li>
              <li>Відстежувати свій прогрес та рейтинг</li>
              <li>Отримувати нагадування про квізи</li>
            </ul>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>📅 Розклад квізів:</strong><br>
                • Квізи відправляються щодня о 12:00<br>
                • Дедлайн для проходження - 00:00<br>
                • Нагадування надсилаються кожні 2 години
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:8080'}" 
                 style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Почати використання
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">
              Якщо у вас виникли питання, зверніться до адміністратора.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
}

module.exports = new EmailService();
