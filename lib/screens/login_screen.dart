import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/app_theme.dart';
import 'register_screen.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      final success = await authProvider.login(
        username: _usernameController.text.trim(),
        password: _passwordController.text,
      );

      if (success && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const HomeScreen()),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'Помилка входу'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const ClampingScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.paddingLarge),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 60),
                    
                    // Logo/Title Section
                    StyledContainer(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: AppTheme.borderRadiusXLarge,
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(AppTheme.paddingMedium),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(AppTheme.borderRadiusLarge),
                            ),
                            child: const Icon(
                              Icons.quiz,
                              size: 60,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: AppTheme.paddingMedium),
                          const Text(
                            'QuizApp',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: AppTheme.paddingSmall),
                          Text(
                            'Увійдіть до свого акаунту',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.white.withOpacity(0.9),
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppTheme.paddingXLarge),
                    
                    // Form Section
                    StyledContainer(
                      child: Column(
                        children: [

                          // Email field
                          TextFormField(
                            controller: _usernameController,
                            decoration: const InputDecoration(
                              labelText: 'Логін',
                              hintText: 'Введіть логін',
                              prefixIcon: Icon(Icons.person),
                              border: OutlineInputBorder(),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Будь ласка, введіть логін';
                              }
                              if (value.length < 3) {
                                return 'Логін повинен містити принаймні 3 символи';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: AppTheme.paddingMedium),

                          // Password field
                          TextFormField(
                            controller: _passwordController,
                            decoration: InputDecoration(
                              labelText: 'Пароль',
                              hintText: 'Введіть пароль',
                              prefixIcon: const Icon(Icons.lock),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword ? Icons.visibility : Icons.visibility_off,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                              border: const OutlineInputBorder(),
                            ),
                            obscureText: _obscurePassword,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Будь ласка, введіть пароль';
                              }
                              if (value.length < 6) {
                                return 'Пароль повинен містити принаймні 6 символів';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: AppTheme.paddingLarge),

                          // Login button
                          Consumer<AuthProvider>(
                            builder: (context, authProvider, child) {
                              return GradientButton(
                                text: 'Увійти',
                                onPressed: authProvider.isLoading ? null : _login,
                                gradient: AppTheme.primaryGradient,
                                isLoading: authProvider.isLoading,
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppTheme.paddingLarge),

                    // Register link
                    StyledContainer(
                      color: AppTheme.primaryColor.withValues(alpha: 0.1),
                      child: TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const RegisterScreen()),
                          );
                        },
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.person_add,
                              color: AppTheme.primaryColor,
                              size: 20,
                            ),
                            const SizedBox(width: AppTheme.paddingSmall),
                            Text(
                              'Немає акаунту? Зареєструватися',
                              style: TextStyle(
                                color: AppTheme.primaryColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                     const SizedBox(height: AppTheme.paddingXLarge),
                   ],
                 ),
               ),
             ),
           ),
         ),
       ),
     );
   }
}