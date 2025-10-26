import 'package:flutter/material.dart';
import '../models/quiz_result.dart';
import '../models/question.dart';
import '../models/quiz.dart';
import 'home_screen.dart';

class QuizResultScreen extends StatelessWidget {
  final Quiz quiz;
  final QuizResult quizResult;

  const QuizResultScreen({
    super.key,
    required this.quiz,
    required this.quizResult,
  });

  double get percentage => quizResult.percentage;

  String get grade {
    if (percentage >= 90) return 'Відмінно';
    if (percentage >= 80) return 'Добре';
    if (percentage >= 70) return 'Задовільно';
    if (percentage >= 60) return 'Достатньо';
    return 'Незадовільно';
  }

  Color get gradeColor {
    if (percentage >= 90) return Colors.green;
    if (percentage >= 80) return Colors.lightGreen;
    if (percentage >= 70) return Colors.orange;
    if (percentage >= 60) return Colors.deepOrange;
    return Colors.red;
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes}хв ${remainingSeconds}с';
  }

  String _formatPoints(int points) {
    if (points > 0) return '+$points';
    if (points < 0) return '$points';
    return '0';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Результати квізу'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        physics: const ClampingScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Result summary card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    Icon(
                      percentage >= 70 ? Icons.celebration : Icons.sentiment_neutral,
                      size: 64,
                      color: gradeColor,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      grade,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: gradeColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${percentage.toStringAsFixed(1)}%',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _StatItem(
                          icon: Icons.check_circle,
                          label: 'Правильно',
                          value: '${quizResult.correctAnswers}',
                          color: Colors.green,
                        ),
                        _StatItem(
                          icon: Icons.cancel,
                          label: 'Неправильно',
                          value: '${quizResult.incorrectAnswers}',
                          color: Colors.red,
                        ),
                        _StatItem(
                          icon: Icons.timer,
                          label: 'Час',
                          value: _formatTime(quizResult.timeTaken),
                          color: Colors.blue,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // New scoring system display
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: quizResult.totalPoints >= 0 
                            ? Colors.green.withOpacity(0.1)
                            : Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: quizResult.totalPoints >= 0 
                              ? Colors.green
                              : Colors.red,
                          width: 2,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            quizResult.totalPoints >= 0 
                                ? Icons.trending_up
                                : Icons.trending_down,
                            color: quizResult.totalPoints >= 0 
                                ? Colors.green
                                : Colors.red,
                            size: 24,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Очки: ${_formatPoints(quizResult.totalPoints)}',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: quizResult.totalPoints >= 0 
                                  ? Colors.green
                                  : Colors.red,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Quiz details
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quiz.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Категорія: ${quiz.category}',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.grey,
                      ),
                    ),
                    Text(
                      'Рівень складності: ${quiz.difficulty}',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Detailed answers
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Детальні результати',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...(quiz.questions ?? []).asMap().entries.map((entry) {
                      final index = entry.key;
                      final question = entry.value;
                      final userAnswer = quizResult.answers[index];
                      final isCorrect = userAnswer.isCorrect;
                      final userAnswerText = userAnswer.selectedAnswer;
                      
                      return _QuestionResult(
                        questionNumber: index + 1,
                        question: question,
                        userAnswer: userAnswerText,
                        isCorrect: isCorrect,
                      );
                    }).toList(),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(
                          builder: (context) => const HomeScreen(),
                        ),
                        (route) => false,
                      );
                    },
                    child: const Text('На головну'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).pop();
                    },
                    child: const Text('Спробувати знову'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 32),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }
}

class _QuestionResult extends StatelessWidget {
  final int questionNumber;
  final Question question;
  final String? userAnswer;
  final bool isCorrect;

  const _QuestionResult({
    required this.questionNumber,
    required this.question,
    required this.userAnswer,
    required this.isCorrect,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(
          color: isCorrect ? Colors.green : Colors.red,
          width: 1,
        ),
        borderRadius: BorderRadius.circular(8),
        color: (isCorrect ? Colors.green : Colors.red).withOpacity(0.05),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isCorrect ? Icons.check_circle : Icons.cancel,
                color: isCorrect ? Colors.green : Colors.red,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Питання $questionNumber',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            question.questionText ?? '',
            style: const TextStyle(fontSize: 14),
          ),
          const SizedBox(height: 8),
          if (userAnswer != null) ...[
            Text(
              'Ваша відповідь: $userAnswer',
              style: TextStyle(
                fontSize: 14,
                color: isCorrect ? Colors.green : Colors.red,
                fontWeight: FontWeight.w500,
              ),
            ),
          ] else ...[
            const Text(
              'Відповідь не надана',
              style: TextStyle(
                fontSize: 14,
                color: Colors.red,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
          if (!isCorrect) ...[
            Text(
              'Правильна відповідь: ${question.correctAnswer}',
              style: const TextStyle(
                fontSize: 14,
                color: Colors.green,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}