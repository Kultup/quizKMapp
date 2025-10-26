import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;
import '../models/user.dart';
import '../models/position.dart';
import '../models/category.dart';
import '../models/quiz.dart';
import '../models/question.dart';
import '../models/quiz_result.dart';
import 'logging_service.dart';

class ApiService {
  static final String baseUrl = kIsWeb
      ? 'http://localhost:3000/api'
      : 'http://10.0.2.2:3000/api';
  
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();
  
  String? _token;
  
  void setToken(String token) {
    _token = token;
  }

  void clearToken() {
    _token = null;
  }
  
  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    
    return headers;
  }

  // Auth methods
  Future<Map<String, dynamic>> register({
    required String username,
    required String password,
    required String firstName,
    required String lastName,
    required String city,
    required String position,
    required String institution,
    required String gender,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'username': username,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        'city': city,
        'position': position,
        'institution': institution,
        'gender': gender,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _token = data['token'];
      return data;
    } else {
      throw Exception('Failed to login: ${response.body}');
    }
  }



  // Dropdown data for registration
  Future<List<Map<String, dynamic>>> getCities() async {
    final response = await http.get(
      Uri.parse('$baseUrl/cities'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final rawList = (data is Map && data.containsKey('data')) ? data['data'] : data;

      final List<Map<String, dynamic>> list = [];
      if (rawList is List) {
        for (final item in rawList) {
          if (item is Map<String, dynamic>) {
            // Ensure we have a proper name field
            if (!item.containsKey('name') || item['name'] == null || item['name'].toString().isEmpty) {
              final name = item['title'] ?? item['label'] ?? item['shortName'] ?? item['value'] ?? item['city'] ?? 'Невідоме місто';
              item['name'] = name.toString();
            }
            list.add(item);
          } else if (item is String) {
            list.add({'name': item, '_id': item});
          } else if (item is num) {
            list.add({'name': item.toString(), '_id': item.toString()});
          } else {
            list.add({'name': item.toString(), '_id': item.toString()});
          }
        }
      }
      return list;
    } else {
      throw Exception('Failed to load cities: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> getInstitutions({String? cityId}) async {
    final uri = cityId != null
        ? Uri.parse('$baseUrl/institutions/by-city/$cityId')
        : Uri.parse('$baseUrl/institutions');
    final response = await http.get(uri, headers: _headers);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final rawList = (data is Map && data.containsKey('data')) ? data['data'] : data;

      final List<Map<String, dynamic>> list = [];
      if (rawList is List) {
        for (final item in rawList) {
          if (item is Map<String, dynamic>) {
            // normalize name field
            if (!item.containsKey('name') || item['name'] == null || item['name'].toString().isEmpty) {
              final name = item['title'] ?? item['label'] ?? item['shortName'] ?? item['value'] ?? item['institution'] ?? 'Невідомий заклад';
              item['name'] = name.toString();
            }
            list.add(item);
          } else if (item is String) {
            list.add({'name': item, '_id': item});
          } else if (item is num) {
            list.add({'name': item.toString(), '_id': item.toString()});
          } else {
            list.add({'name': item.toString(), '_id': item.toString()});
          }
        }
      }
      return list;
    } else {
      throw Exception('Failed to load institutions: ${response.body}');
    }
  }

  // Removed duplicate getPositions method - using the one that returns List<Position>
  // Categories
  Future<List<Category>> getCategories() async {
    try {
      print('🌐 ApiService: Відправляємо запит на $baseUrl/categories');
      final response = await http.get(
        Uri.parse('$baseUrl/categories'),
        headers: _headers,
      );

      print('📡 ApiService: Отримано відповідь зі статусом ${response.statusCode}');
      
      if (response.statusCode == 200) {
         print('📄 ApiService: Тіло відповіді: ${response.body}');
         final Map<String, dynamic> responseData = jsonDecode(response.body);
         final List<dynamic> data = responseData['categories'] ?? [];
         final categories = data.map((json) => Category.fromJson(json)).toList();
         print('✅ ApiService: Парсинг успішний. Категорій: ${categories.length}');
         return categories;
      } else {
        print('❌ ApiService: Помилка статусу: ${response.statusCode}');
        throw Exception('Failed to load categories: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 ApiService: Мережева помилка: $e');
      throw Exception('Network error: $e');
    }
  }

  // Quizzes
  Future<List<Quiz>> getQuizzes({String? categoryName}) async {
    String url = '$baseUrl/quizzes';
    if (categoryName != null) {
      url += '?category=${Uri.encodeComponent(categoryName)}';
    }
    
    try {
      print('🌐 ApiService: Відправляємо запит на $url');
      print('🔑 ApiService: Токен: ${_token != null ? 'є' : 'немає'}');
      print('📋 ApiService: Заголовки: $_headers');
      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );

      print('📡 ApiService: Отримано відповідь зі статусом ${response.statusCode}');
      
      if (response.statusCode == 200) {
        print('📄 ApiService: Тіло відповіді: ${response.body}');
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final List<dynamic> data = responseData['quizzes'];
        final quizzes = data.map((json) => Quiz.fromJson(json)).toList();
        print('✅ ApiService: Парсинг успішний. Квізів: ${quizzes.length}');
        return quizzes;
      } else {
        print('❌ ApiService: Помилка статусу: ${response.statusCode}');
        throw Exception('Failed to load quizzes: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 ApiService: Мережева помилка: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<Quiz> getQuizById(String quizId) async {
    try {
      print('🌐 ApiService: Відправляємо запит на $baseUrl/quizzes/$quizId');
      print('🔑 ApiService: Токен: ${_token != null ? 'є' : 'немає'}');
      final response = await http.get(
        Uri.parse('$baseUrl/quizzes/$quizId'),
        headers: _headers,
      );

      print('📡 ApiService: Отримано відповідь зі статусом ${response.statusCode}');
      
      if (response.statusCode == 200) {
        print('📄 ApiService: Тіло відповіді: ${response.body}');
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final quiz = Quiz.fromJson(responseData['quiz']);
        print('✅ ApiService: Парсинг квізу успішний');
        return quiz;
      } else {
        print('❌ ApiService: Помилка статусу: ${response.statusCode}');
        throw Exception('Failed to load quiz: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 ApiService: Мережева помилка: $e');
      throw Exception('Network error: $e');
    }
  }

  // Questions
  Future<List<Question>> getQuizQuestions(String quizId) async {
    try {
      print('🌐 ApiService: Відправляємо запит на $baseUrl/quizzes/$quizId/questions');
      print('🔑 ApiService: Токен: ${_token != null ? 'є' : 'немає'}');
      final response = await http.get(
        Uri.parse('$baseUrl/quizzes/$quizId/questions'),
        headers: _headers,
      );

      print('📡 ApiService: Отримано відповідь зі статусом ${response.statusCode}');
      
      if (response.statusCode == 200) {
        print('📄 ApiService: Тіло відповіді: ${response.body}');
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final List<dynamic> data = responseData['questions'] ?? [];
        final questions = data.map((json) => Question.fromJson(json)).toList();
        print('✅ ApiService: Парсинг успішний. Питань: ${questions.length}');
        return questions;
      } else {
        print('❌ ApiService: Помилка статусу: ${response.statusCode}');
        throw Exception('Failed to load questions: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 ApiService: Мережева помилка: $e');
      throw Exception('Network error: $e');
    }
  }

  // Quiz Results
  Future<QuizResult> submitQuizResult({
    required String quizId,
    required String quizTitle,
    required String? categoryId,
    required String? categoryName,
    required List<Map<String, dynamic>> answers,
    required int timeTaken,
    required bool isDailyQuiz,
  }) async {
    try {
      final requestBody = {
        'quiz_id': quizId,
        'quiz_title': quizTitle,
        'category_id': categoryId,
        'category_name': categoryName,
        'answers': answers,
        'time_taken': timeTaken,
        'is_daily_quiz': isDailyQuiz,
      };
      
      print('🌐 ApiService: Відправляємо запит на $baseUrl/quiz/submit');
      print('🔑 ApiService: Токен: ${_token != null ? 'є' : 'немає'}');
      print('📋 ApiService: Заголовки: $_headers');
      print('📄 ApiService: Тіло запиту: ${jsonEncode(requestBody)}');
      
      final response = await http.post(
        Uri.parse('$baseUrl/quiz/submit'),
        headers: _headers,
        body: jsonEncode(requestBody),
      );

      print('📡 ApiService: Отримано відповідь зі статусом ${response.statusCode}');
      print('📄 ApiService: Тіло відповіді: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final resultData = responseData['result'];
        
        // Create QuizResult from the new API response format
        final quizResult = QuizResult(
          id: resultData['id']?.toString() ?? '',
          userId: resultData['userId']?.toString() ?? '',
          quizId: resultData['quizId']?.toString() ?? quizId,
          score: resultData['score'] ?? 0,
          totalPoints: resultData['totalPoints'] ?? 0,
          correctAnswers: resultData['correctAnswers'] ?? 0,
          incorrectAnswers: resultData['incorrectAnswers'] ?? 0,
          accuracy: resultData['accuracy'] ?? 0,
          totalQuestions: resultData['totalQuestions'] ?? answers.length,
          timeTaken: resultData['timeTaken'] ?? 0,
          completedAt: DateTime.now(),
          answers: [],
          detailedAnswers: (resultData['detailedAnswers'] as List?)
              ?.map((answer) => DetailedAnswer.fromJson(answer))
              .toList(),
        );
        
        print('✅ ApiService: Успішно створено QuizResult');
        return quizResult;
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception('Server error: ${errorData['error'] ?? 'Unknown error'}');
      }
    } catch (e) {
      print('💥 ApiService: Мережева помилка при збереженні результату: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<List<QuizResult>> getUserResults() async {
    final response = await http.get(
      Uri.parse('$baseUrl/quiz-results/user'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => QuizResult.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load user results');
    }
  }

  // Position methods
  Future<List<Position>> getPositions() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/positions'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final List<dynamic> positionsData = responseData['positions'];
        
        // Convert _id to id for all positions
        final List<Position> positions = positionsData.map((json) {
          // Convert _id to id
          final jsonWithId = Map<String, dynamic>.from(json);
          if (jsonWithId.containsKey('_id')) {
            jsonWithId['id'] = jsonWithId['_id'].toString();
            jsonWithId.remove('_id');
          }
          return Position.fromJson(jsonWithId);
        }).toList();
        
        return positions;
      } else {
        throw Exception('Failed to load positions');
      }
    } catch (e) {
      print('💥 ApiService: Помилка завантаження посад: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<Position> getPositionById(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/positions/$id'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final positionData = jsonDecode(response.body);
        
        // Convert _id to id
        final jsonWithId = Map<String, dynamic>.from(positionData);
        if (jsonWithId.containsKey('_id')) {
          jsonWithId['id'] = jsonWithId['_id'].toString();
          jsonWithId.remove('_id');
        }
        
        return Position.fromJson(jsonWithId);
      } else {
        throw Exception('Failed to load position');
      }
    } catch (e) {
      print('💥 ApiService: Помилка завантаження посади: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<List<Question>> getQuestionsByPosition(String positionId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/positions/$positionId/questions'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final List<dynamic> questionsData = responseData['questions'];
        return questionsData.map((json) => Question.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load questions for position');
      }
    } catch (e) {
      print('💥 ApiService: Помилка завантаження питань для посади: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<List<Question>> getRandomQuestionsForPosition(String positionId, {int count = 5}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/positions/$positionId/questions/random?count=$count'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final List<dynamic> questionsData = responseData['questions'];
        return questionsData.map((json) => Question.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load random questions for position');
      }
    } catch (e) {
      print('💥 ApiService: Помилка завантаження випадкових питань: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> getUserPositionAndQuestions() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/positions/user/position'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        
        // Convert _id to id for position
        final positionData = Map<String, dynamic>.from(responseData['position']);
        if (positionData.containsKey('_id')) {
          positionData['id'] = positionData['_id'].toString();
          positionData.remove('_id');
        }
        
        return {
          'position': Position.fromJson(positionData),
          'availableQuestions': responseData['availableQuestions'],
          'questions': (responseData['questions'] as List)
              .map((json) => Question.fromJson(json))
              .toList(),
        };
      } else {
        throw Exception('Failed to load user position and questions');
      }
    } catch (e) {
      print('💥 ApiService: Помилка завантаження посади користувача: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final requestBody = {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      };
      
      print('🌐 ApiService: Відправляємо запит на зміну пароля');
      
      final response = await http.post(
        Uri.parse('$baseUrl/auth/change-password'),
        headers: _headers,
        body: jsonEncode(requestBody),
      );

      print('📡 ApiService: Отримано відповідь зі статусом ${response.statusCode}');

      if (response.statusCode == 200) {
        print('✅ ApiService: Пароль успішно змінено');
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception('Server error: ${errorData['error'] ?? 'Unknown error'}');
      }
    } catch (e) {
      print('💥 ApiService: Помилка зміни пароля: $e');
      throw Exception('Network error: $e');
    }
  }

  // Admin methods
  Future<List<Map<String, dynamic>>> getAdminUsersStats({
    String period = 'all',
    String category = 'all',
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/admin/users/stats?period=$period&category=$category'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load admin users stats: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 ApiService: Помилка завантаження статистики адміна: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> getAdminDashboardStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/admin/dashboard'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load admin dashboard stats: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 ApiService: Помилка завантаження дашборду адміна: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> getUserStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/stats'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to get user stats: ${response.body}');
      }
    } catch (e) {
      print('❌ ApiService: Помилка отримання статистики користувача: $e');
      rethrow;
    }
  }

  // Універсальний метод для обробки HTTP запитів з логуванням
  Future<http.Response> _makeRequest(
    String method,
    String url, {
    Map<String, String>? headers,
    String? body,
  }) async {
    final uri = Uri.parse(url);
    
    LoggingService.instance.apiRequest(method, url);
    
    try {
      http.Response response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(uri, headers: headers ?? _headers);
          break;
        case 'POST':
          response = await http.post(uri, headers: headers ?? _headers, body: body);
          break;
        case 'PUT':
          response = await http.put(uri, headers: headers ?? _headers, body: body);
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: headers ?? _headers);
          break;
        default:
          throw Exception('Непідтримуваний HTTP метод: $method');
      }
      
      LoggingService.instance.apiRequest(method, url, statusCode: response.statusCode);
      
      if (response.statusCode >= 400) {
        final errorMessage = 'HTTP ${response.statusCode}: ${response.reasonPhrase}';
        LoggingService.instance.apiRequest(method, url, 
          statusCode: response.statusCode, 
          error: errorMessage
        );
        throw Exception(errorMessage);
      }
      
      return response;
    } catch (e) {
      LoggingService.instance.apiRequest(method, url, error: e.toString());
      rethrow;
    }
  }
}