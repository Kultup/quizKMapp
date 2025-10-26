import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/pin_settings.dart';

class PinService {
  static const String _pinKey = 'pin_settings';
  static const String _salt = 'quizapp_pin_salt_2024';

  // Сохранить настройки PIN-кода
  static Future<void> savePinSettings(PinSettings settings) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(settings.toJson());
    await prefs.setString(_pinKey, jsonString);
  }

  // Получить настройки PIN-кода
  static Future<PinSettings> getPinSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_pinKey);
    
    if (jsonString == null) {
      return PinSettings(isEnabled: false);
    }
    
    try {
      final json = jsonDecode(jsonString) as Map<String, dynamic>;
      return PinSettings.fromJson(json);
    } catch (e) {
      print('❌ PinService: Ошибка парсинга настроек PIN: $e');
      return PinSettings(isEnabled: false);
    }
  }

  // Установить PIN-код
  static Future<bool> setPin(String pin) async {
    if (pin.length < 4) {
      return false;
    }

    try {
      final pinHash = _hashPin(pin);
      final settings = PinSettings(
        isEnabled: true,
        pinHash: pinHash,
        createdAt: DateTime.now(),
      );
      
      await savePinSettings(settings);
      print('✅ PinService: PIN-код установлен успешно');
      return true;
    } catch (e) {
      print('❌ PinService: Ошибка установки PIN: $e');
      return false;
    }
  }

  // Проверить PIN-код
  static Future<bool> verifyPin(String pin) async {
    try {
      final settings = await getPinSettings();
      
      if (!settings.isEnabled || settings.pinHash == null) {
        return false;
      }

      final inputHash = _hashPin(pin);
      final isValid = inputHash == settings.pinHash;
      
      if (isValid) {
        // Обновляем время последнего использования
        final updatedSettings = settings.copyWith(lastUsed: DateTime.now());
        await savePinSettings(updatedSettings);
        print('✅ PinService: PIN-код проверен успешно');
      }
      
      return isValid;
    } catch (e) {
      print('❌ PinService: Ошибка проверки PIN: $e');
      return false;
    }
  }

  // Отключить PIN-код
  static Future<void> disablePin() async {
    try {
      final settings = PinSettings(isEnabled: false);
      await savePinSettings(settings);
      print('✅ PinService: PIN-код отключен');
    } catch (e) {
      print('❌ PinService: Ошибка отключения PIN: $e');
    }
  }

  // Изменить PIN-код
  static Future<bool> changePin(String oldPin, String newPin) async {
    try {
      // Проверяем старый PIN
      final isOldPinValid = await verifyPin(oldPin);
      if (!isOldPinValid) {
        return false;
      }

      // Устанавливаем новый PIN
      return await setPin(newPin);
    } catch (e) {
      print('❌ PinService: Ошибка изменения PIN: $e');
      return false;
    }
  }

  // Хеширование PIN-кода
  static String _hashPin(String pin) {
    final bytes = utf8.encode(pin + _salt);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Проверить, включен ли PIN-код
  static Future<bool> isPinEnabled() async {
    final settings = await getPinSettings();
    return settings.isEnabled;
  }

  // Получить информацию о PIN-коде
  static Future<PinSettings> getPinInfo() async {
    return await getPinSettings();
  }
}
