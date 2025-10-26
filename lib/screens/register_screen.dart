import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/position.dart';
import '../utils/app_theme.dart';
import 'home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _cityController = TextEditingController();
  final _positionController = TextEditingController();
  final _institutionController = TextEditingController();
  String? _selectedGender;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  // Wizard state
  final PageController _pageController = PageController();
  int _currentPage = 0;
  final List<GlobalKey<FormState>> _pageKeys = List.generate(9, (_) => GlobalKey<FormState>());

  // Dropdown data from API
  List<Map<String, dynamic>> _cities = [];
  List<Position> _positions = [];
  List<Map<String, dynamic>> _institutions = [];
  bool _loadingCities = false;
  bool _loadingPositions = false;
  bool _loadingInstitutions = false;

  String? _selectedCityId;
  String? _selectedCityName;
  Position? _selectedPosition;
  String? _selectedInstitutionName;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _cityController.dispose();
    _positionController.dispose();
    _institutionController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    setState(() {
      _loadingCities = true;
      _loadingPositions = true;
    });
    try {
      final api = ApiService();
      print('🏙️ RegisterScreen: Завантажуємо міста...');
      final cities = await api.getCities();
      print('🏙️ RegisterScreen: Отримано ${cities.length} міст: $cities');
      
      print('💼 RegisterScreen: Завантажуємо посади...');
      final positions = await api.getPositions();
      print('💼 RegisterScreen: Отримано ${positions.length} посад: $positions');
      
      setState(() {
        _cities = List<Map<String, dynamic>>.from(cities);
        _positions = positions;
        _loadingCities = false;
        _loadingPositions = false;
      });
    } catch (e) {
      print('❌ RegisterScreen: Помилка завантаження даних: $e');
      setState(() {
        _loadingCities = false;
        _loadingPositions = false;
      });
    }
  }

  Future<void> _loadInstitutionsForCity() async {
    setState(() { _loadingInstitutions = true; });
    try {
      final api = ApiService();
      print('🏫 RegisterScreen: Завантажуємо заклади для міста $_selectedCityId...');
      final insts = await api.getInstitutions(cityId: _selectedCityId);
      print('🏫 RegisterScreen: Отримано ${insts.length} закладів: $insts');
      setState(() {
        _institutions = List<Map<String, dynamic>>.from(insts);
        _loadingInstitutions = false;
      });
    } catch (e) {
      print('❌ RegisterScreen: Помилка завантаження закладів: $e');
      setState(() { _loadingInstitutions = false; });
    }
  }



  String _extractName(Map<String, dynamic> item) {
    return (item['name'] ?? item['title'] ?? item['label'] ?? item['value'] ?? item['city'] ?? '').toString();
  }

  String? _extractId(Map<String, dynamic> item) {
    final id = item['id'] ?? item['_id'] ?? item['uuid'];
    return id?.toString();
  }

  void _goNext() {
    final key = _pageKeys[_currentPage];
    if (key.currentState?.validate() ?? false) {
      if (_currentPage < _pageKeys.length - 1) {
        setState(() { _currentPage++; });
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      } else {
        _register();
      }
    }
  }

  void _goBack() {
    if (_currentPage > 0) {
      setState(() { _currentPage--; });
      _pageController.animateToPage(
        _currentPage,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _register() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.register(
      username: _usernameController.text.trim(),
      password: _passwordController.text,
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      city: _selectedCityName ?? _cityController.text.trim(),
      position: _selectedPosition?.id ?? '',
      institution: _selectedInstitutionName ?? _institutionController.text.trim(),
      gender: _selectedGender ?? 'інше',
    );

    if (success && mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const HomeScreen()),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Помилка реєстрації'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header Section
              Container(
                padding: const EdgeInsets.all(AppTheme.paddingLarge),
                child: Column(
                  children: [
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: Container(
                            padding: const EdgeInsets.all(AppTheme.paddingSmall),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                            ),
                            child: const Icon(
                              Icons.arrow_back,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            'Реєстрація',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(width: 48), // Balance the back button
                      ],
                    ),
                    const SizedBox(height: AppTheme.paddingMedium),
                    
                    // Progress indicator
                    StyledContainer(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: AppTheme.borderRadiusLarge,
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(AppTheme.paddingMedium),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                            ),
                            child: const Icon(
                              Icons.person_add,
                              size: 48,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: AppTheme.paddingSmall),
                          const Text(
                            'Створити акаунт',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: AppTheme.paddingSmall),
                          Text(
                            'Крок ${_currentPage + 1} з 9',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.8),
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: AppTheme.paddingMedium),
                          
                          // Progress bar
                          Container(
                            height: 6,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: (_currentPage + 1) / 9,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Form Section
              Expanded(
                child: Container(
                  margin: const EdgeInsets.all(AppTheme.paddingLarge),
                  child: StyledContainer(
                    child: AnimatedPadding(
                      duration: const Duration(milliseconds: 200),
                      curve: Curves.easeOut,
                      padding: EdgeInsets.fromLTRB(
                        AppTheme.paddingLarge,
                        AppTheme.paddingLarge,
                        AppTheme.paddingLarge,
                        AppTheme.paddingLarge + MediaQuery.of(context).viewInsets.bottom,
                      ),
                      child: SingleChildScrollView(
                        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                        physics: const ClampingScrollPhysics(),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 600),
                            child: SizedBox(
                              height: MediaQuery.of(context).size.height * 0.6,
                              child: PageView(
                                controller: _pageController,
                                physics: const NeverScrollableScrollPhysics(),
                                children: [
                          // 0: First Name
                          Form(
                            key: _pageKeys[0],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.person,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "Як вас звати?",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                TextFormField(
                                  controller: _firstNameController,
                                  decoration: const InputDecoration(
                                    labelText: "Ім'я",
                                    hintText: "Введіть ім'я",
                                    prefixIcon: Icon(Icons.person),
                                    border: OutlineInputBorder(),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return "Введіть ім'я";
                                    }
                                    if (value.length < 2) {
                                      return "Ім'я повинно містити мінімум 2 символи";
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),

                          // 1: Last Name
                          Form(
                            key: _pageKeys[1],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.person_outline,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "Ваше прізвище?",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                TextFormField(
                                  controller: _lastNameController,
                                  decoration: const InputDecoration(
                                    labelText: 'Прізвище',
                                    prefixIcon: Icon(Icons.person_outline),
                                    border: OutlineInputBorder(),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Введіть прізвище';
                                    }
                                    if (value.length < 2) {
                                      return 'Прізвище повинно містити мінімум 2 символи';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),

                          // 2: City (from DB)
                          Form(
                            key: _pageKeys[2],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.location_city,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "З якого ви міста?",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                _loadingCities
                                     ? const CircularProgressIndicator()
                                     : (_cities.isEmpty
                                        ? TextFormField(
                                            controller: _cityController,
                                            decoration: InputDecoration(
                                              labelText: 'Місто',
                                              prefixIcon: const Icon(Icons.location_city),
                                              suffixIcon: IconButton(
                                                icon: const Icon(Icons.refresh),
                                                tooltip: 'Оновити список міст',
                                                onPressed: _loadInitialData,
                                              ),
                                              border: const OutlineInputBorder(),
                                              helperText: 'Не знайдено міст. Введіть вручну або спробуйте оновити.'
                                            ),
                                            validator: (value) {
                                              if (value == null || value.trim().isEmpty) {
                                                return 'Введіть або оберіть місто';
                                              }
                                              return null;
                                            },
                                          )
                                        : DropdownButtonFormField<String>(
                                            value: (_selectedCityName != null && _cities.any((c) => _extractName(c) == _selectedCityName))
                                                ? _selectedCityName
                                                : null,
                                            items: _cities.map((c) {
                                              final name = _extractName(c);
                                              return DropdownMenuItem(
                                                value: name,
                                                child: Text(name),
                                              );
                                            }).toList(),
                                            onChanged: (val) {
                                              setState(() {
                                                _selectedCityName = val;
                                                try {
                                                  final match = _cities.firstWhere(
                                                    (c) => _extractName(c) == val,
                                                  );
                                                  _selectedCityId = _extractId(match);
                                                } catch (_) {
                                                  _selectedCityId = null;
                                                }
                                              });
                                              _loadInstitutionsForCity();
                                            },
                                            decoration: const InputDecoration(
                                              labelText: 'Місто',
                                              prefixIcon: Icon(Icons.location_city),
                                              border: OutlineInputBorder(),
                                            ),
                                            validator: (value) {
                                              if ((_cities.isEmpty && (_cityController.text.isEmpty)) || (value == null || value.isEmpty)) {
                                                return 'Оберіть або введіть місто';
                                              }
                                              return null;
                                            },
                                          ))
                              ],
                            ),
                          ),

                          // 3: Institution (from DB)
                          Form(
                            key: _pageKeys[3],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.school,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "Де ви працюєте?",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                _loadingInstitutions
                                     ? const CircularProgressIndicator()
                                     : DropdownButtonFormField<String>(
                                        value: _selectedInstitutionName,
                                        items: _institutions.map((i) {
                                          final name = _extractName(i);
                                          return DropdownMenuItem(
                                            value: name,
                                            child: Text(name),
                                          );
                                        }).toList(),
                                        onChanged: (val) {
                                          setState(() {
                                            _selectedInstitutionName = val;
                                          });
                                        },
                                        decoration: const InputDecoration(
                                          labelText: 'Заклад/установа',
                                          prefixIcon: Icon(Icons.school),
                                          border: OutlineInputBorder(),
                                        ),
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return 'Оберіть заклад/установу';
                                          }
                                          return null;
                                        },
                                      ),
                              ],
                            ),
                          ),

                          // 4: Position (from DB)
                          Form(
                            key: _pageKeys[4],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.work,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "Яка ваша посада?",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                _loadingPositions
                                     ? const CircularProgressIndicator()
                                     : DropdownButtonFormField<Position>(
                                        value: _selectedPosition,
                                        items: _positions.map((position) {
                                          return DropdownMenuItem(
                                            value: position,
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text(
                                                  position.displayName,
                                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                                ),
                                                Text(
                                                  position.descriptionText,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        }).toList(),
                                        onChanged: (position) {
                                          setState(() {
                                            _selectedPosition = position;
                                          });
                                        },
                                        decoration: const InputDecoration(
                                          labelText: 'Посада',
                                          prefixIcon: Icon(Icons.work),
                                          border: OutlineInputBorder(),
                                        ),
                                        validator: (value) {
                                          if (value == null) {
                                            return 'Оберіть посаду';
                                          }
                                          return null;
                                        },
                                      ),
                              ],
                            ),
                          ),

                          // 5: Gender
                          Form(
                            key: _pageKeys[5],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.person_outline,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "Вкажіть вашу стать",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                DropdownButtonFormField<String>(
                                  value: _selectedGender,
                                  items: const [
                                    DropdownMenuItem(value: 'чоловіча', child: Text('Чоловіча')),
                                    DropdownMenuItem(value: 'жіноча', child: Text('Жіноча')),
                                    DropdownMenuItem(value: 'інше', child: Text('Інше')),
                                  ],
                                  onChanged: (val) => setState(() => _selectedGender = val),
                                  decoration: const InputDecoration(
                                    labelText: 'Стать',
                                    prefixIcon: Icon(Icons.person_outline),
                                    border: OutlineInputBorder(),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Оберіть стать';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),

                          // 6: Username
                          Form(
                            key: _pageKeys[6],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.person,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "Введіть логін",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                // Username field
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
                                      return 'Введіть логін';
                                    }
                                    if (value.length < 3) {
                                      return 'Логін повинен містити принаймні 3 символи';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),

                          // 7: Password
                          Form(
                            key: _pageKeys[7],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.lock,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "Створіть пароль",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                TextFormField(
                                  controller: _passwordController,
                                  obscureText: _obscurePassword,
                                  decoration: InputDecoration(
                                    labelText: 'Пароль',
                                    prefixIcon: const Icon(Icons.lock),
                                    suffixIcon: IconButton(
                                      icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                                      onPressed: () {
                                        setState(() { _obscurePassword = !_obscurePassword; });
                                      },
                                    ),
                                    border: const OutlineInputBorder(),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Введіть пароль';
                                    }
                                    if (value.length < 6) {
                                      return 'Пароль повинен містити мінімум 6 символів';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),

                          // 8: Confirm Password
                          Form(
                            key: _pageKeys[8],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.lock_outline,
                                  size: 60,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                Text(
                                  "Підтвердіть пароль",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimaryColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppTheme.paddingLarge),
                                TextFormField(
                                  controller: _confirmPasswordController,
                                  obscureText: _obscureConfirmPassword,
                                  decoration: InputDecoration(
                                    labelText: 'Підтвердіть пароль',
                                    prefixIcon: const Icon(Icons.lock_outline),
                                    suffixIcon: IconButton(
                                      icon: Icon(_obscureConfirmPassword ? Icons.visibility : Icons.visibility_off),
                                      onPressed: () {
                                        setState(() { _obscureConfirmPassword = !_obscureConfirmPassword; });
                                      },
                                    ),
                                    border: const OutlineInputBorder(),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Підтвердіть пароль';
                                    }
                                    if (value != _passwordController.text) {
                                      return 'Паролі не співпадають';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        ),
            // Navigation buttons
            Padding(
              padding: const EdgeInsets.all(AppTheme.paddingLarge),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _currentPage == 0 ? null : _goBack,
                          child: const Text('Назад'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _goNext,
                          child: Text(_currentPage == _pageKeys.length - 1 ? 'Зареєструватися' : 'Далі'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: const Text('Вже маєте акаунт? Увійти'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
    );
  }
}