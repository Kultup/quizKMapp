import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import '../providers/quiz_provider.dart';
import '../models/quiz.dart';
import 'quiz_result_screen.dart';

class QuizScreen extends StatefulWidget {
  final Quiz quiz;

  const QuizScreen({super.key, required this.quiz});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _currentQuestionIndex = 0;
  Map<int, String> _answers = {};
  Timer? _timer;
  int _remainingSeconds = 0;
  bool _isQuizCompleted = false;
  DateTime? _startTime;

  @override
  void initState() {
    super.initState();
    print('🎯 QuizScreen: initState викликано для квізу ${widget.quiz.id}');
    _startTime = DateTime.now();
    _remainingSeconds = widget.quiz.estimatedTime; // Already in seconds
    _startTimer();
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      print('🎯 QuizScreen: Викликаємо loadQuizQuestions для ${widget.quiz.id}');
      Provider.of<QuizProvider>(context, listen: false)
          .loadQuizQuestions(widget.quiz.id);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0 && !_isQuizCompleted) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        _submitQuiz();
      }
    });
  }

  void _selectAnswer(String answer) {
    setState(() {
      _answers[_currentQuestionIndex] = answer;
    });
  }

  void _nextQuestion() {
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    
    if (_currentQuestionIndex < quizProvider.currentQuizQuestions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
    } else {
      _submitQuiz();
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
    }
  }

  Future<void> _submitQuiz() async {
    if (_isQuizCompleted) return;
    
    setState(() {
      _isQuizCompleted = true;
    });
    
    _timer?.cancel();
    
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    final questions = quizProvider.currentQuizQuestions;
    
    // Prepare answers for submission
    List<Map<String, dynamic>> answers = [];
    
    for (int i = 0; i < questions.length; i++) {
      final userAnswer = _answers[i] ?? '';
      final question = questions[i];
      
      answers.add({
        'questionId': question.id,
        'selectedAnswer': userAnswer,
        'timeSpent': 30, // Default time per question, can be improved
      });
    }
    
    // Submit result to backend
    final result = await quizProvider.submitQuizResult(
      quizId: widget.quiz.id,
      answers: answers,
    );
    
    if (mounted) {
      if (result != null) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => QuizResultScreen(
              quiz: widget.quiz,
              quizResult: result,
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Помилка збереження результату: ${quizProvider.error}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (_isQuizCompleted) return true;
        
        final shouldExit = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Вийти з квізу?'),
            content: const Text('Ваш прогрес буде втрачено. Ви впевнені?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Скасувати'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Вийти'),
              ),
            ],
          ),
        );
        return shouldExit ?? false;
      },
      child: Scaffold(
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(kToolbarHeight),
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              title: Text(
                widget.quiz.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 20,
                ),
              ),
              iconTheme: const IconThemeData(color: Colors.white),
              actions: [
                Container(
                  margin: const EdgeInsets.all(8.0),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.timer,
                        color: Colors.white,
                        size: 18,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _formatTime(_remainingSeconds),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.grey[50]!,
                Colors.grey[100]!,
              ],
            ),
          ),
          child: Consumer<QuizProvider>(
            builder: (context, quizProvider, child) {
              if (quizProvider.isLoading) {
                return const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF667eea)),
                  ),
                );
              }
            
            if (quizProvider.error != null) {
              return Center(
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
                      onPressed: () => quizProvider.loadQuizQuestions(widget.quiz.id),
                      child: const Text('Спробувати знову'),
                    ),
                  ],
                ),
              );
            }
            
            if (quizProvider.currentQuizQuestions.isEmpty) {
              return const Center(
                child: Text('Питання не знайдено'),
              );
            }
            
            final question = quizProvider.currentQuizQuestions[_currentQuestionIndex];
            final progress = (_currentQuestionIndex + 1) / quizProvider.currentQuizQuestions.length;
            
            return Column(
              children: [
                // Progress bar
                Container(
                  height: 8,
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(4),
                    color: Colors.grey[200],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: MediaQuery.of(context).size.width * progress,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                      ),
                    ),
                  ),
                ),
                
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Question counter
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'Питання ${_currentQuestionIndex + 1} з ${quizProvider.currentQuizQuestions.length}',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        
                        // Question text
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(24.0),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.1),
                                spreadRadius: 0,
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                            border: Border.all(
                              color: Colors.grey.withOpacity(0.1),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            question.questionText ?? '',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF2D3748),
                              height: 1.4,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        // Answer options
                        Expanded(
                          child: ListView(
                            physics: const ClampingScrollPhysics(),
                            children: question.options.asMap().entries.map((entry) {
                              final index = entry.key;
                              final option = entry.value;
                              final isSelected = _answers[_currentQuestionIndex] == option;
                              final optionLabels = ['A', 'B', 'C', 'D'];
                              
                              return AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                margin: const EdgeInsets.only(bottom: 16),
                                child: Material(
                                  elevation: isSelected ? 8 : 2,
                                  borderRadius: BorderRadius.circular(16),
                                  shadowColor: isSelected 
                                      ? const Color(0xFF667eea).withOpacity(0.3)
                                      : Colors.grey.withOpacity(0.1),
                                  child: InkWell(
                                    onTap: () => _selectAnswer(option),
                                    borderRadius: BorderRadius.circular(16),
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      padding: const EdgeInsets.all(20.0),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(16),
                                        gradient: isSelected 
                                            ? const LinearGradient(
                                                colors: [Color(0xFF6B73FF), Color(0xFF9BB5FF)],
                                                begin: Alignment.centerLeft,
                                                end: Alignment.centerRight,
                                              )
                                            : null,
                                        color: isSelected ? null : Colors.white,
                                        border: Border.all(
                                          color: isSelected 
                                              ? Colors.transparent 
                                              : Colors.grey.withOpacity(0.2),
                                          width: 1.5,
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 32,
                                            height: 32,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: isSelected 
                                                  ? Colors.white.withOpacity(0.2)
                                                  : const Color(0xFF6B73FF).withOpacity(0.1),
                                              border: Border.all(
                                                color: isSelected 
                                                    ? Colors.white
                                                    : const Color(0xFF667eea),
                                                width: 2,
                                              ),
                                            ),
                                            child: Center(
                                              child: Text(
                                                optionLabels[index],
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                  color: isSelected 
                                                      ? Colors.white
                                                      : const Color(0xFF667eea),
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Expanded(
                                            child: Text(
                                              option,
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w500,
                                                color: isSelected 
                                                    ? Colors.white
                                                    : const Color(0xFF2D3748),
                                                height: 1.3,
                                              ),
                                            ),
                                          ),
                                          if (isSelected)
                                            const Icon(
                                              Icons.check_circle,
                                              color: Colors.white,
                                              size: 24,
                                            ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Navigation buttons
                Container(
                  padding: const EdgeInsets.all(20.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.1),
                        spreadRadius: 0,
                        blurRadius: 10,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      if (_currentQuestionIndex > 0)
                        Expanded(
                          child: Container(
                            height: 56,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: const Color(0xFF6B73FF),
                                width: 2,
                              ),
                            ),
                            child: Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: _previousQuestion,
                                borderRadius: BorderRadius.circular(16),
                                child: const Center(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.arrow_back_ios,
                                        color: Color(0xFF6B73FF),
                                        size: 20,
                                      ),
                                      SizedBox(width: 8),
                                      Text(
                                        'Назад',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF667eea),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      if (_currentQuestionIndex > 0) const SizedBox(width: 16),
                      Expanded(
                        child: Container(
                          height: 56,
                          decoration: BoxDecoration(
                            gradient: _answers.containsKey(_currentQuestionIndex)
                                ? const LinearGradient(
                                    colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                  )
                                : null,
                            color: _answers.containsKey(_currentQuestionIndex)
                                ? null
                                : Colors.grey[300],
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: _answers.containsKey(_currentQuestionIndex)
                                  ? _nextQuestion
                                  : null,
                              borderRadius: BorderRadius.circular(16),
                              child: Center(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      _currentQuestionIndex == quizProvider.currentQuizQuestions.length - 1
                                          ? 'Завершити'
                                          : 'Далі',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: _answers.containsKey(_currentQuestionIndex)
                                            ? Colors.white
                                            : Colors.grey[600],
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Icon(
                                      _currentQuestionIndex == quizProvider.currentQuizQuestions.length - 1
                                          ? Icons.check_circle
                                          : Icons.arrow_forward_ios,
                                      color: _answers.containsKey(_currentQuestionIndex)
                                          ? Colors.white
                                          : Colors.grey[600],
                                      size: 20,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );
            },
          ),
        ),
      ),
    );
  }
}