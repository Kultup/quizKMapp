import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/quiz_provider.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation_screen.dart';
import 'screens/pin_input_screen.dart';
import 'services/logging_service.dart';
import 'services/pin_service.dart';
import 'utils/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Ініціалізуємо систему логування
  await LoggingService.instance.initialize();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => QuizProvider()),
      ],
      child: MaterialApp(
        title: 'QuizApp',
        theme: AppTheme.lightTheme,
        home: const AuthWrapper(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _isCheckingPin = true;
  bool _shouldShowPin = false;

  @override
  void initState() {
    super.initState();
    print('🔐 AuthWrapper: initState викликано');
    WidgetsBinding.instance.addPostFrameCallback((_) {
      print('🔐 AuthWrapper: Завантажуємо дані користувача');
      Provider.of<AuthProvider>(context, listen: false).loadUserData();
      _checkPinStatus();
    });
  }

  Future<void> _checkPinStatus() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final isPinEnabled = await PinService.isPinEnabled();
      
      setState(() {
        _isCheckingPin = false;
        _shouldShowPin = authProvider.user != null && isPinEnabled;
      });
      
      print('🔐 AuthWrapper: PIN статус - enabled: $isPinEnabled, user: ${authProvider.user?.fullName ?? 'null'}');
    } catch (e) {
      print('🔐 AuthWrapper: Помилка перевірки PIN: $e');
      setState(() {
        _isCheckingPin = false;
        _shouldShowPin = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        print('🔐 AuthWrapper: build викликано. isLoading: ${authProvider.isLoading}, user: ${authProvider.user?.fullName ?? 'null'}, checkingPin: $_isCheckingPin, showPin: $_shouldShowPin');
        
        if (authProvider.isLoading || _isCheckingPin) {
          print('🔐 AuthWrapper: Показуємо індикатор завантаження');
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (authProvider.user != null) {
          if (_shouldShowPin) {
            print('🔐 AuthWrapper: Показуємо PIN екран');
            return const PinInputScreen();
          } else {
            print('🔐 AuthWrapper: Користувач автентифікований, показуємо MainNavigationScreen');
            return const MainNavigationScreen();
          }
        } else {
          print('🔐 AuthWrapper: Користувач не автентифікований, показуємо LoginScreen');
          return const LoginScreen();
        }
      },
    );
  }
}
