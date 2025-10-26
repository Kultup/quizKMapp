import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/user_stats.dart';
import '../services/api_service.dart';
import '../utils/app_theme.dart';
import '../widgets/dashboard_widgets.dart';
import 'quiz_results_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  UserStats? _userStats;
  bool _isLoadingStats = false;
  String? _statsError;

  @override
  void initState() {
    super.initState();
    print('🏠 HomeScreen: initState викликано');
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadUserStats();
    });
  }

  Future<void> _loadUserStats() async {
    setState(() {
      _isLoadingStats = true;
      _statsError = null;
    });

    try {
      final apiService = ApiService();
      final statsData = await apiService.getUserStats();
      setState(() {
        _userStats = UserStats.fromJson(statsData);
        _isLoadingStats = false;
      });
    } catch (e) {
      setState(() {
        _statsError = e.toString();
        _isLoadingStats = false;
      });
      print('❌ HomeScreen: Помилка завантаження статистики: $e');
    }
  }

  Future<void> _logout() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.logout();
    
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/quiz'),
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(
          Icons.quiz,
          color: Colors.white,
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              return RefreshIndicator(
                onRefresh: _loadUserStats,
                child: SingleChildScrollView(
                  physics: const ClampingScrollPhysics(),
                  child: Column(
                    children: [
                      // Header Section
                      Container(
                        padding: const EdgeInsets.all(AppTheme.paddingLarge),
                        child: Column(
                          children: [
                            // App Bar з градієнтом
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(AppTheme.borderRadiusLarge),
                                boxShadow: AppTheme.elevatedShadow,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Привіт! 👋',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                          color: Colors.white.withOpacity(0.9),
                                        ),
                                      ),
                                      Text(
                                        'Дашборд',
                                        style: TextStyle(
                                          fontSize: 28,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Row(
                                    children: [
                                      Container(
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: IconButton(
                                          onPressed: () {
                                            Navigator.of(context).push(
                                              MaterialPageRoute(
                                                builder: (context) => const QuizResultsScreen(),
                                              ),
                                            );
                                          },
                                          icon: Container(
                                            padding: const EdgeInsets.all(AppTheme.paddingSmall),
                                            decoration: BoxDecoration(
                                              color: Colors.white.withOpacity(0.2),
                                              borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                                            ),
                                            child: const Icon(
                                              Icons.history,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                      ),
                                      IconButton(
                                        onPressed: _logout,
                                        icon: Container(
                                          padding: const EdgeInsets.all(AppTheme.paddingSmall),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withOpacity(0.2),
                                            borderRadius: BorderRadius.circular(AppTheme.borderRadiusMedium),
                                          ),
                                          child: const Icon(
                                            Icons.logout,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: AppTheme.paddingLarge),
                            
                            // Welcome Card
                            StyledContainer(
                              gradient: AppTheme.primaryGradient,
                              borderRadius: AppTheme.borderRadiusLarge,
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(AppTheme.paddingMedium),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(AppTheme.borderRadiusLarge),
                                    ),
                                    child: const Icon(
                                      Icons.person,
                                      color: Colors.white,
                                      size: 40,
                                    ),
                                  ),
                                  const SizedBox(width: AppTheme.paddingMedium),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Привіт, ${authProvider.user?.firstName ?? 'Користувач'}!',
                                          style: const TextStyle(
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(height: AppTheme.paddingSmall),
                                        Text(
                                          'Готовий до нових викликів?',
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Colors.white.withOpacity(0.9),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      // Content Section
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: AppTheme.paddingLarge),
                        child: Column(
                          children: [
                            // Quick Actions Section
                            Container(
                              margin: const EdgeInsets.only(bottom: AppTheme.paddingLarge),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 20,
                                      vertical: 12,
                                    ),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                        colors: [
                                          Color(0xFF6B73FF),
                                          Color(0xFF9BB5FF),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(15),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Color(0xFF6B73FF).withOpacity(0.3),
                                          blurRadius: 15,
                                          offset: Offset(0, 8),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.flash_on,
                                          color: Colors.white,
                                          size: 20,
                                        ),
                                        SizedBox(width: 8),
                                        Text(
                                          'Швидкі дії',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                            shadows: [
                                              Shadow(
                                                color: Colors.black.withOpacity(0.3),
                                                offset: Offset(0, 2),
                                                blurRadius: 4,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildQuickActionButton(
                                          'Почати квіз',
                                          Icons.play_arrow,
                                          [Color(0xFF6B73FF), Color(0xFF9BB5FF)],
                                          () => Navigator.pushNamed(context, '/quiz'),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: _buildQuickActionButton(
                                          'Результати',
                                          Icons.analytics,
                                          [Color(0xFF4FD1C7), Color(0xFF81E6D9)],
                                          () => Navigator.pushNamed(context, '/quiz-results'),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildQuickActionButton(
                                          'Налаштування',
                                          Icons.settings,
                                          [Color(0xFFED8936), Color(0xFFFBD38D)],
                                          () => Navigator.pushNamed(context, '/settings'),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: _buildQuickActionButton(
                                          'Профіль',
                                          Icons.person,
                                          [Color(0xFF9F7AEA), Color(0xFFD6BCFA)],
                                          () => Navigator.pushNamed(context, '/profile'),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            // Dashboard section
                            if (_isLoadingStats)
                              StyledContainer(
                                child: const Padding(
                                  padding: EdgeInsets.all(AppTheme.paddingXLarge),
                                  child: Center(
                                    child: CircularProgressIndicator(),
                                  ),
                                ),
                              )
                            else if (_statsError != null)
                              StyledContainer(
                                color: Colors.red.shade50,
                                child: Padding(
                                  padding: const EdgeInsets.all(AppTheme.paddingLarge),
                                  child: Column(
                                    children: [
                                      Icon(
                                        Icons.error_outline,
                                        color: Colors.red.shade400,
                                        size: 48,
                                      ),
                                      const SizedBox(height: AppTheme.paddingMedium),
                                      const Text(
                                        'Не вдалося завантажити статистику',
                                        style: TextStyle(fontSize: 16),
                                      ),
                                      const SizedBox(height: AppTheme.paddingMedium),
                                      ElevatedButton(
                                        onPressed: _loadUserStats,
                                        child: const Text('Спробувати знову'),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            else if (_userStats != null)
                              DashboardSection(stats: _userStats!),
                            
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionButton(
    String title,
    IconData icon,
    List<Color> gradientColors,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: gradientColors.first.withOpacity(0.4),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}