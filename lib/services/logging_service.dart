import 'dart:io';
import 'package:logger/logger.dart';
import 'package:path_provider/path_provider.dart';

class LoggingService {
  static LoggingService? _instance;
  static LoggingService get instance => _instance ??= LoggingService._();
  
  LoggingService._();
  
  Logger? _logger;
  File? _logFile;
  
  /// Ініціалізація сервісу логування
  Future<void> initialize() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final logDirectory = Directory('${directory.path}/logs');
      
      // Створюємо папку для логів якщо її немає
      if (!await logDirectory.exists()) {
        await logDirectory.create(recursive: true);
      }
      
      // Створюємо файл логів з поточною датою
      final now = DateTime.now();
      final dateString = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      _logFile = File('${logDirectory.path}/quizapp_$dateString.log');
      
      // Налаштовуємо logger
      _logger = Logger(
        printer: PrettyPrinter(
          methodCount: 2,
          errorMethodCount: 8,
          lineLength: 120,
          colors: false, // Вимикаємо кольори для файлу
          printEmojis: false,
          printTime: true,
        ),
        output: _FileOutput(_logFile!),
      );
      
      // Записуємо початкове повідомлення
      info('Система логування ініціалізована');
      
    } catch (e) {
      print('Помилка ініціалізації логування: $e');
    }
  }
  
  /// Логування інформаційних повідомлень
  void info(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger?.i('[ІНФО] $message', error: error, stackTrace: stackTrace);
  }
  
  /// Логування попереджень
  void warning(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger?.w('[ПОПЕРЕДЖЕННЯ] $message', error: error, stackTrace: stackTrace);
  }
  
  /// Логування помилок
  void error(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger?.e('[ПОМИЛКА] $message', error: error, stackTrace: stackTrace);
  }
  
  /// Логування налагодження
  void debug(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger?.d('[НАЛАГОДЖЕННЯ] $message', error: error, stackTrace: stackTrace);
  }
  
  /// Логування дій користувача
  void userAction(String action, {Map<String, dynamic>? details}) {
    final detailsStr = details != null ? ' Деталі: $details' : '';
    info('Дія користувача: $action$detailsStr');
  }
  
  /// Логування API запитів
  void apiRequest(String method, String url, {int? statusCode, String? error}) {
    if (error != null) {
      this.error('API запит не вдався: $method $url - $error');
    } else {
      info('API запит: $method $url - Статус: ${statusCode ?? 'невідомо'}');
    }
  }
  
  /// Логування аутентифікації
  void auth(String action, {String? userId, bool success = true}) {
    final result = success ? 'успішно' : 'невдало';
    final userInfo = userId != null ? ' (ID: $userId)' : '';
    info('Аутентифікація: $action $result$userInfo');
  }
  
  /// Логування роботи з квізами
  void quiz(String action, {String? quizId, String? userId, Map<String, dynamic>? details}) {
    final quizInfo = quizId != null ? ' (Квіз ID: $quizId)' : '';
    final userInfo = userId != null ? ' (Користувач ID: $userId)' : '';
    final detailsStr = details != null ? ' Деталі: $details' : '';
    info('Квіз: $action$quizInfo$userInfo$detailsStr');
  }
  
  /// Отримання шляху до файлу логів
  String? get logFilePath => _logFile?.path;
  
  /// Очищення старих логів (старше 7 днів)
  Future<void> cleanOldLogs() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final logDirectory = Directory('${directory.path}/logs');
      
      if (await logDirectory.exists()) {
        final files = await logDirectory.list().toList();
        final now = DateTime.now();
        
        for (final file in files) {
          if (file is File && file.path.endsWith('.log')) {
            final stat = await file.stat();
            final age = now.difference(stat.modified).inDays;
            
            if (age > 7) {
              await file.delete();
              info('Видалено старий лог файл: ${file.path}');
            }
          }
        }
      }
    } catch (e) {
      error('Помилка очищення старих логів', e);
    }
  }
}

/// Кастомний output для запису в файл
class _FileOutput extends LogOutput {
  final File file;
  
  _FileOutput(this.file);
  
  @override
  void output(OutputEvent event) {
    try {
      final timestamp = DateTime.now().toIso8601String();
      final lines = event.lines.map((line) => '[$timestamp] $line').join('\n');
      file.writeAsStringSync('$lines\n', mode: FileMode.append);
    } catch (e) {
      print('Помилка запису в лог файл: $e');
    }
  }
}