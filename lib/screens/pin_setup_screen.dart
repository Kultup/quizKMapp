import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/pin_service.dart';
import '../utils/app_theme.dart';

class PinSetupScreen extends StatefulWidget {
  const PinSetupScreen({super.key});

  @override
  State<PinSetupScreen> createState() => _PinSetupScreenState();
}

class _PinSetupScreenState extends State<PinSetupScreen> {
  final List<String> _firstPin = [];
  final List<String> _confirmPin = [];
  bool _isConfirming = false;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Налаштування PIN-коду'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      backgroundColor: Colors.grey[50],
      body: Padding(
        padding: const EdgeInsets.all(AppTheme.paddingXLarge),
        child: Column(
          children: [
            // Instructions
            Container(
              padding: const EdgeInsets.all(AppTheme.paddingLarge),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppTheme.borderRadiusLarge),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(40),
                    ),
                    child: Icon(
                      Icons.security,
                      size: 40,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: AppTheme.paddingMedium),
                  Text(
                    _isConfirming 
                        ? 'Підтвердіть PIN-код'
                        : 'Встановіть PIN-код',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppTheme.paddingSmall),
                  Text(
                    _isConfirming
                        ? 'Введіть PIN-код ще раз для підтвердження'
                        : 'PIN-код повинен містити 4 цифри',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: AppTheme.paddingXLarge),
            
            // PIN Dots
            Container(
              padding: const EdgeInsets.symmetric(vertical: AppTheme.paddingLarge),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) {
                  final currentPin = _isConfirming ? _confirmPin : _firstPin;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 12),
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: index < currentPin.length 
                          ? AppTheme.primaryColor 
                          : Colors.grey[300],
                      border: Border.all(
                        color: index < currentPin.length 
                            ? AppTheme.primaryColor 
                            : Colors.grey[400]!,
                        width: 2,
                      ),
                    ),
                  );
                }),
              ),
            ),
            
            const SizedBox(height: AppTheme.paddingLarge),
            
            // Messages
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(AppTheme.paddingMedium),
                margin: const EdgeInsets.only(bottom: AppTheme.paddingLarge),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                  border: Border.all(color: Colors.red.withOpacity(0.3)),
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
              
            if (_successMessage != null)
              Container(
                padding: const EdgeInsets.all(AppTheme.paddingMedium),
                margin: const EdgeInsets.only(bottom: AppTheme.paddingLarge),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                  border: Border.all(color: Colors.green.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle_outline, color: Colors.green, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _successMessage!,
                        style: const TextStyle(
                          color: Colors.green,
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
            
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isLoading ? null : _cancelSetup,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: AppTheme.paddingMedium),
                      side: BorderSide(color: AppTheme.primaryColor),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                      ),
                    ),
                    child: const Text(
                      'Скасувати',
                      style: TextStyle(fontSize: 16),
                    ),
                  ),
                ),
                const SizedBox(width: AppTheme.paddingMedium),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _confirmSetup,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      padding: const EdgeInsets.symmetric(vertical: AppTheme.paddingMedium),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text(
                            'Підтвердити',
                            style: TextStyle(fontSize: 16),
                          ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNumberButton(String number) {
    return GestureDetector(
      onTap: () => _addDigit(number),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(AppTheme.borderRadiusLarge),
          border: Border.all(
            color: AppTheme.primaryColor.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Center(
          child: Text(
            number,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryColor,
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
          color: AppTheme.primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(AppTheme.borderRadiusLarge),
          border: Border.all(
            color: AppTheme.primaryColor.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Center(
          child: Icon(
            icon,
            size: 24,
            color: AppTheme.primaryColor,
          ),
        ),
      ),
    );
  }

  void _addDigit(String digit) {
    final currentPin = _isConfirming ? _confirmPin : _firstPin;
    
    if (currentPin.length < 4) {
      setState(() {
        currentPin.add(digit);
        _errorMessage = null;
        _successMessage = null;
      });
      
      // Haptic feedback
      HapticFeedback.lightImpact();
      
      // Auto-confirm when PIN is complete
      if (currentPin.length == 4) {
        if (_isConfirming) {
          _confirmSetup();
        } else {
          // Move to confirmation after a short delay
          Future.delayed(const Duration(milliseconds: 500), () {
            if (mounted) {
              setState(() {
                _isConfirming = true;
              });
            }
          });
        }
      }
    }
  }

  void _removeLastDigit() {
    final currentPin = _isConfirming ? _confirmPin : _firstPin;
    
    if (currentPin.isNotEmpty) {
      setState(() {
        currentPin.removeLast();
        _errorMessage = null;
        _successMessage = null;
      });
      
      // Haptic feedback
      HapticFeedback.lightImpact();
    }
  }

  Future<void> _confirmSetup() async {
    if (_firstPin.length != 4) {
      setState(() {
        _errorMessage = 'PIN-код повинен містити 4 цифри';
      });
      return;
    }

    if (!_isConfirming) {
      setState(() {
        _isConfirming = true;
      });
      return;
    }

    if (_confirmPin.length != 4) {
      setState(() {
        _errorMessage = 'Підтвердіть PIN-код';
      });
      return;
    }

    if (_firstPin.join() != _confirmPin.join()) {
      setState(() {
        _errorMessage = 'PIN-коди не співпадають';
        _confirmPin.clear();
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final pin = _firstPin.join();
      final success = await PinService.setPin(pin);
      
      if (success) {
        setState(() {
          _successMessage = 'PIN-код успішно встановлено!';
        });
        
        // Navigate back after success
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            Navigator.of(context).pop(true);
          }
        });
      } else {
        setState(() {
          _errorMessage = 'Помилка встановлення PIN-коду';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Помилка: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _cancelSetup() {
    Navigator.of(context).pop(false);
  }
}
