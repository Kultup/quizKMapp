import 'package:flutter/foundation.dart' hide Category;
import '../models/category.dart';
import '../models/quiz.dart';
import '../models/question.dart';
import '../models/quiz_result.dart';
import '../services/api_service.dart';
import '../services/logging_service.dart';

class QuizProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Category> _categories = [];
  List<Quiz> _quizzes = [];
  List<Question> _currentQuizQuestions = [];
  Quiz? _currentQuiz;
  List<QuizResult> _userResults = [];
  
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Category> get categories => _categories;
  List<Quiz> get quizzes => _quizzes;
  List<Question> get currentQuizQuestions => _currentQuizQuestions;
  Quiz? get currentQuiz => _currentQuiz;
  List<QuizResult> get userResults => _userResults;
  List<QuizResult> get results => _userResults; // Alias for userResults
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load categories
  Future<void> loadCategories() async {
    print('🔄 QuizProvider: Початок завантаження категорій');
    _setLoading(true);
    _clearError();

    LoggingService.instance.userAction('Завантаження категорій');

    try {
      print('🌐 QuizProvider: Викликаємо API для отримання категорій');
      _categories = await _apiService.getCategories();
      print('✅ QuizProvider: Категорії завантажено успішно. Кількість: ${_categories.length}');
      LoggingService.instance.info('Категорії завантажено успішно', null, null);
      _setLoading(false);
    } catch (e) {
      print('❌ QuizProvider: Помилка завантаження категорій: $e');
      LoggingService.instance.error('Помилка завантаження категорій', e);
      _setError(e.toString());
      _setLoading(false);
    }
  }

  // Load quizzes
  Future<void> loadQuizzes({String? categoryName}) async {
    _setLoading(true);
    _clearError();

    LoggingService.instance.userAction('Завантаження квізів', details: {
      'categoryName': categoryName ?? 'всі категорії'
    });

    try {
      _quizzes = await _apiService.getQuizzes(categoryName: categoryName);
      LoggingService.instance.info('Квізи завантажено успішно', null, null);
      _setLoading(false);
    } catch (e) {
      LoggingService.instance.error('Помилка завантаження квізів', e);
      _setError(e.toString());
      _setLoading(false);
    }
  }

  // Load quiz with questions
  Future<void> loadQuizWithQuestions(String quizId) async {
    _setLoading(true);
    _clearError();

    LoggingService.instance.quiz('Завантаження квізу з питаннями', quizId: quizId);

    try {
      LoggingService.instance.quiz('🔄 Завантажуємо деталі квізу...', quizId: quizId);
      _currentQuiz = await _apiService.getQuizById(quizId);
      LoggingService.instance.quiz('✅ Деталі квізу завантажено', quizId: quizId);
      
      LoggingService.instance.quiz('🔄 Завантажуємо питання квізу...', quizId: quizId);
      _currentQuizQuestions = await _apiService.getQuizQuestions(quizId);
      LoggingService.instance.quiz('✅ Питання квізу завантажено', quizId: quizId, details: {
        'questionsCount': _currentQuizQuestions.length
      });
      
      LoggingService.instance.quiz('Квіз з питаннями завантажено успішно', quizId: quizId, details: {
        'questionsCount': _currentQuizQuestions.length
      });
      _setLoading(false);
    } catch (e) {
      LoggingService.instance.error('Помилка завантаження квізу з питаннями', e);
      _setError(e.toString());
      _setLoading(false);
    }
  }

  // Load quizzes by category (alias for loadQuizzes)
  Future<void> loadQuizzesByCategory(String categoryName) async {
    await loadQuizzes(categoryName: categoryName);
  }

  // Load quiz questions (alias for loadQuizWithQuestions)
  Future<void> loadQuizQuestions(String quizId) async {
    await loadQuizWithQuestions(quizId);
  }

  // Submit quiz result
  Future<QuizResult?> submitQuizResult({
    required String quizId,
    required List<Map<String, dynamic>> answers,
    int? timeTaken,
    bool isDailyQuiz = false,
  }) async {
    _setLoading(true);
    _clearError();

    LoggingService.instance.quiz('Відправка результату квізу', quizId: quizId, details: {
      'answersCount': answers.length,
    });

    try {
      // Get current quiz details
      final quiz = _currentQuiz ?? _quizzes.firstWhere((q) => q.id == quizId, orElse: () => Quiz(
        id: quizId,
        title: 'Невідомий квіз',
        description: '',
        categoryId: '',
        category: '',
        difficulty: 'medium',
        questionsCount: 0,
        estimatedTime: 0,
        createdAt: DateTime.now(),
        questions: const [],
      ));

      final result = await _apiService.submitQuizResult(
        quizId: quizId,
        quizTitle: quiz.title,
        categoryId: quiz.categoryId,
        categoryName: quiz.category,
        answers: answers,
        timeTaken: timeTaken ?? 0,
        isDailyQuiz: isDailyQuiz,
      );
      
      _userResults.insert(0, result); // Add to beginning of list
      LoggingService.instance.quiz('Результат квізу збережено успішно', quizId: quizId, details: {
        'resultId': result.id.toString(),
        'totalPoints': result.totalPoints,
        'correctAnswers': result.correctAnswers,
        'incorrectAnswers': result.incorrectAnswers,
        'accuracy': result.accuracy,
      });
      _setLoading(false);
      return result;
    } catch (e) {
      LoggingService.instance.error('Помилка збереження результату квізу', e);
      _setError(e.toString());
      _setLoading(false);
      return null;
    }
  }

  // Load user results
  Future<void> loadUserResults() async {
    _setLoading(true);
    _clearError();

    LoggingService.instance.userAction('Завантаження результатів користувача');

    try {
      _userResults = await _apiService.getUserResults();
      LoggingService.instance.info('Результати користувача завантажено успішно', null, null);
      _setLoading(false);
    } catch (e) {
      LoggingService.instance.error('Помилка завантаження результатів користувача', e);
      _setError(e.toString());
      _setLoading(false);
    }
  }

  // Clear current quiz
  void clearCurrentQuiz() {
    _currentQuiz = null;
    _currentQuizQuestions = [];
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }
}