import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/logging_service.dart';
import '../services/pin_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _loadUserFromStorage();
  }

  Future<void> _loadUserFromStorage() async {
    print('🔐 AuthProvider: Завантажуємо дані користувача з локального сховища');
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    final userJson = prefs.getString('user_data');
    
    print('🔐 AuthProvider: token: ${token != null ? 'є' : 'немає'}, userJson: ${userJson != null ? 'є' : 'немає'}');
    
    if (token != null && userJson != null) {
      try {
        print('🔐 AuthProvider: Встановлюємо токен та парсимо дані користувача');
        _apiService.setToken(token);
        final userData = jsonDecode(userJson);
        _user = User.fromJson(userData);
        print('🔐 AuthProvider: Користувач завантажений: ${_user?.fullName}');
        notifyListeners();
        // Note: In a real app, you'd want to validate the token with the server
        // For now, we'll just trust the stored data
      } catch (e) {
        print('🔐 AuthProvider: Помилка парсингу збережених даних: $e');
        // If there's an error parsing stored data, clear it
        await prefs.remove('auth_token');
        await prefs.remove('user_data');
      }
    } else {
      print('🔐 AuthProvider: Немає збережених даних користувача');
    }
  }

  Future<void> loadUserData() async {
    await _loadUserFromStorage();
  }

  Future<bool> register({
    required String username,
    required String password,
    required String firstName,
    required String lastName,
    required String city,
    required String position,
    required String institution,
    required String gender,
  }) async {
    _setLoading(true);
    _clearError();

    LoggingService.instance.userAction('Спроба реєстрації', details: {
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'city': city,
      'position': position,
      'institution': institution,
      'gender': gender,
    });

    try {
      final response = await _apiService.register(
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        city: city,
        position: position,
        institution: institution,
        gender: gender,
      );

      final token = response['token'];
      final userData = response['user'];
      
      _user = User.fromJson(userData);
      _apiService.setToken(token);
      
      await _saveUserToStorage(token, userData);
      
      LoggingService.instance.auth('Реєстрація', userId: _user?.id.toString(), success: true);
      
      _setLoading(false);
      return true;
    } catch (e) {
      LoggingService.instance.auth('Реєстрація', success: false);
      LoggingService.instance.error('Помилка реєстрації', e);
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<bool> login({
    required String username,
    required String password,
  }) async {
    _setLoading(true);
    _clearError();

    LoggingService.instance.userAction('Спроба входу', details: {'username': username});

    try {
      final response = await _apiService.login(
        username: username,
        password: password,
      );

      final token = response['token'];
      final userData = response['user'];
      
      _user = User.fromJson(userData);
      _apiService.setToken(token);
      
      await _saveUserToStorage(token, userData);
      
      LoggingService.instance.auth('Вхід', userId: _user?.id.toString(), success: true);
      
      _setLoading(false);
      return true;
    } catch (e) {
      LoggingService.instance.auth('Вхід', success: false);
      LoggingService.instance.error('Помилка входу', e);
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    final userId = _user?.id.toString();
    
    LoggingService.instance.auth('Вихід', userId: userId, success: true);
    
    _user = null;
    _apiService.clearToken();
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
    
    notifyListeners();
  }

  Future<void> _saveUserToStorage(String token, Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('user_data', jsonEncode(userData));
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

  // PIN-код методы
  Future<bool> isPinEnabled() async {
    return await PinService.isPinEnabled();
  }

  Future<bool> verifyPin(String pin) async {
    return await PinService.verifyPin(pin);
  }

  Future<bool> setPin(String pin) async {
    return await PinService.setPin(pin);
  }

  Future<bool> changePin(String oldPin, String newPin) async {
    return await PinService.changePin(oldPin, newPin);
  }

  Future<void> disablePin() async {
    await PinService.disablePin();
  }

  Future<Map<String, dynamic>> getPinInfo() async {
    final settings = await PinService.getPinInfo();
    return {
      'isEnabled': settings.isEnabled,
      'createdAt': settings.createdAt,
      'lastUsed': settings.lastUsed,
    };
  }

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    _setLoading(true);
    _clearError();

    LoggingService.instance.userAction('Зміна пароля');

    try {
      final success = await _apiService.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );

      if (success) {
        LoggingService.instance.userAction('Пароль успішно змінено');
        _setLoading(false);
        return true;
      } else {
        _setError('Помилка зміни пароля');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      LoggingService.instance.error('Помилка зміни пароля', e);
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }
}