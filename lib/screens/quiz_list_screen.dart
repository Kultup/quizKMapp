import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/quiz_provider.dart';
import '../models/category.dart';
import '../models/quiz.dart';
import 'quiz_screen.dart';

class QuizListScreen extends StatefulWidget {
  final Category category;

  const QuizListScreen({
    super.key,
    required this.category,
  });

  @override
  State<QuizListScreen> createState() => _QuizListScreenState();
}

class _QuizListScreenState extends State<QuizListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<QuizProvider>(context, listen: false)
          .loadQuizzesByCategory(widget.category.name);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.category.name),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Consumer<QuizProvider>(
        builder: (context, quizProvider, child) {
          return RefreshIndicator(
            onRefresh: () => quizProvider.loadQuizzesByCategory(widget.category.name),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category description
                  if (widget.category.description.isNotEmpty) ...[
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            Icon(
                              _getCategoryIcon(widget.category.name),
                              size: 32,
                              color: Colors.blue,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                widget.category.description,
                                style: const TextStyle(fontSize: 16),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Quizzes list
                  Expanded(
                    child: quizProvider.isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : quizProvider.error != null
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(
                                      Icons.error_outline,
                                      size: 64,
                                      color: Colors.red,
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Помилка: ${quizProvider.error}',
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                    const SizedBox(height: 16),
                                    ElevatedButton(
                                      onPressed: () => quizProvider
                                          .loadQuizzesByCategory(widget.category.name),
                                      child: const Text('Спробувати знову'),
                                    ),
                                  ],
                                ),
                              )
                            : quizProvider.quizzes.isEmpty
                                ? const Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.quiz_outlined,
                                          size: 64,
                                          color: Colors.grey,
                                        ),
                                        SizedBox(height: 16),
                                        Text(
                                          'Квізи не знайдено',
                                          style: TextStyle(fontSize: 16),
                                        ),
                                      ],
                                    ),
                                  )
                                : ListView.builder(
                                    physics: const ClampingScrollPhysics(),
                                    itemCount: quizProvider.quizzes.length,
                                    itemBuilder: (context, index) {
                                      final quiz = quizProvider.quizzes[index];
                                      return _QuizCard(
                                        quiz: quiz,
                                        onTap: () {
                                          Navigator.of(context).push(
                                            MaterialPageRoute(
                                              builder: (context) => QuizScreen(
                                                quiz: quiz,
                                              ),
                                            ),
                                          );
                                        },
                                      );
                                    },
                                  ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  IconData _getCategoryIcon(String categoryName) {
    switch (categoryName.toLowerCase()) {
      case 'наука':
      case 'science':
        return Icons.science;
      case 'історія':
      case 'history':
        return Icons.history_edu;
      case 'спорт':
      case 'sport':
        return Icons.sports_soccer;
      case 'технології':
      case 'technology':
        return Icons.computer;
      case 'мистецтво':
      case 'art':
        return Icons.palette;
      case 'географія':
      case 'geography':
        return Icons.public;
      case 'математика':
      case 'math':
        return Icons.calculate;
      case 'література':
      case 'literature':
        return Icons.menu_book;
      default:
        return Icons.quiz;
    }
  }
}

class _QuizCard extends StatelessWidget {
  final Quiz quiz;
  final VoidCallback onTap;

  const _QuizCard({
    required this.quiz,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      quiz.title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getDifficultyColor(quiz.difficulty),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _getDifficultyText(quiz.difficulty),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              if (quiz.description.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  quiz.description,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.quiz,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${quiz.questionCount} питань',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.timer,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${(quiz.estimatedTime / 60).round()} хв',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const Spacer(),
                  const Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: Colors.blue,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
      case 'легкий':
        return Colors.green;
      case 'medium':
      case 'середній':
        return Colors.orange;
      case 'hard':
      case 'важкий':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getDifficultyText(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'Легкий';
      case 'medium':
        return 'Середній';
      case 'hard':
        return 'Важкий';
      default:
        return difficulty;
    }
  }
}