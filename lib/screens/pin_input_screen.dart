import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/pin_service.dart';
import '../utils/app_theme.dart';
import 'main_navigation_screen.dart';

class PinInputScreen extends StatefulWidget {
  const PinInputScreen({super.key});

  @override
  State<PinInputScreen> createState() => _PinInputScreenState();
}

class _PinInputScreenState extends State<PinInputScreen> {
  final List<String> _enteredDigits = [];
  bool _isLoading = false;
  String? _errorMessage;
  int _attempts = 0;
  static const int _maxAttempts = 3;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.paddingXLarge),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // App Icon
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(60),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.lock_outline,
                  size: 60,
                  color: AppTheme.primaryColor,
                ),
              ),
              
              const SizedBox(height: AppTheme.paddingXLarge),
              
              // Title
              const Text(
                'Введіть PIN-код',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: AppTheme.paddingMedium),
              
              // Subtitle
              Text(
                _attempts > 0 
                    ? 'Залишилось спроб: ${_maxAttempts - _attempts}'
                    : 'Для швидкого доступу до додатку',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.8),
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: AppTheme.paddingXLarge),
              
              // PIN Dots
              Container(
                padding: const EdgeInsets.symmetric(vertical: AppTheme.paddingLarge),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(4, (index) {
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 12),
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: index < _enteredDigits.length 
                            ? Colors.white 
                            : Colors.white.withOpacity(0.3),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.5),
                          width: 2,
                        ),
                      ),
                    );
                  }),
                ),
              ),
              
              const SizedBox(height: AppTheme.paddingXLarge),
              
              // Error Message
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(AppTheme.paddingMedium),
                  margin: const EdgeInsets.only(bottom: AppTheme.paddingLarge),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                    border: Border.all(color: Colors.red.withOpacity(0.5)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.red, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(
                            color: Colors.red,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),
              
              // Number Pad
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(AppTheme.paddingMedium),
                  child: GridView.count(
                    crossAxisCount: 3,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 1.1,
                    children: [
                      // Numbers 1-9
                      ...List.generate(9, (index) {
                        final number = (index + 1).toString();
                        return _buildNumberButton(number);
                      }),
                      
                      // Empty space
                      const SizedBox(),
                      
                      // Number 0
                      _buildNumberButton('0'),
                      
                      // Delete button
                      _buildActionButton(
                        icon: Icons.backspace_outlined,
                        onTap: _removeLastDigit,
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: AppTheme.paddingLarge),
              
              // Alternative login button
              TextButton(
                onPressed: _showAlternativeLogin,
                child: Text(
                  'Увійти через логін',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 16,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNumberButton(String number) {
    return GestureDetector(
      onTap: () => _addDigit(number),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(AppTheme.borderRadiusLarge),
          border: Border.all(
            color: Colors.white.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Center(
          child: Text(
            number,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(AppTheme.borderRadiusLarge),
          border: Border.all(
            color: Colors.white.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Center(
          child: Icon(
            icon,
            size: 24,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  void _addDigit(String digit) {
    if (_enteredDigits.length < 4) {
      setState(() {
        _enteredDigits.add(digit);
        _errorMessage = null;
      });
      
      // Haptic feedback
      HapticFeedback.lightImpact();
      
      // Check if PIN is complete
      if (_enteredDigits.length == 4) {
        _verifyPin();
      }
    }
  }

  void _removeLastDigit() {
    if (_enteredDigits.isNotEmpty) {
      setState(() {
        _enteredDigits.removeLast();
        _errorMessage = null;
      });
      
      // Haptic feedback
      HapticFeedback.lightImpact();
    }
  }

  Future<void> _verifyPin() async {
    if (_isLoading) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      final pin = _enteredDigits.join();
      final isValid = await PinService.verifyPin(pin);
      
      if (isValid) {
        // Success - navigate to main app
        HapticFeedback.heavyImpact();
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MainNavigationScreen()),
        );
      } else {
        // Invalid PIN
        setState(() {
          _attempts++;
          _enteredDigits.clear();
          
          if (_attempts >= _maxAttempts) {
            _errorMessage = 'Перевищено кількість спроб. Спробуйте увійти через логін.';
          } else {
            _errorMessage = 'Невірний PIN-код. Спробуйте ще раз.';
          }
        });
        
        HapticFeedback.heavyImpact();
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Помилка перевірки PIN-коду. Спробуйте ще раз.';
        _enteredDigits.clear();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showAlternativeLogin() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const MainNavigationScreen()),
    );
  }
}
