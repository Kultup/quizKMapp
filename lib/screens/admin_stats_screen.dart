import 'package:flutter/material.dart';
import '../models/user_stats.dart';
import '../services/api_service.dart';
import '../utils/app_theme.dart';

class AdminStatsScreen extends StatefulWidget {
  const AdminStatsScreen({super.key});

  @override
  State<AdminStatsScreen> createState() => _AdminStatsScreenState();
}

class _AdminStatsScreenState extends State<AdminStatsScreen> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _usersStats = [];
  bool _isLoading = true;
  String? _error;
  String _selectedPeriod = 'all';
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    _loadUsersStats();
  }

  Future<void> _loadUsersStats() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final stats = await _apiService.getAdminUsersStats(
        period: _selectedPeriod,
        category: _selectedCategory,
      );
      setState(() {
        _usersStats = List<Map<String, dynamic>>.from(stats);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Статистика гравців'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadUsersStats,
          ),
        ],
      ),
      body: Column(
        children: [
          // Фильтры
          Container(
            padding: const EdgeInsets.all(AppTheme.paddingMedium),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: DropdownButton<String>(
                    value: _selectedPeriod,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(value: 'all', child: Text('Весь час')),
                      DropdownMenuItem(value: 'week', child: Text('Тиждень')),
                      DropdownMenuItem(value: 'month', child: Text('Місяць')),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _selectedPeriod = value!;
                      });
                      _loadUsersStats();
                    },
                  ),
                ),
                const SizedBox(width: AppTheme.paddingMedium),
                Expanded(
                  child: DropdownButton<String>(
                    value: _selectedCategory,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(value: 'all', child: Text('Всі категорії')),
                      DropdownMenuItem(value: 'Історія', child: Text('Історія')),
                      DropdownMenuItem(value: 'Географія', child: Text('Географія')),
                      DropdownMenuItem(value: 'Математика', child: Text('Математика')),
                      DropdownMenuItem(value: 'Наука', child: Text('Наука')),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _selectedCategory = value!;
                      });
                      _loadUsersStats();
                    },
                  ),
                ),
              ],
            ),
          ),
          
          // Контент
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 64,
                              color: Colors.red[300],
                            ),
                            const SizedBox(height: AppTheme.paddingMedium),
                            Text(
                              'Помилка завантаження: $_error',
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.red),
                            ),
                            const SizedBox(height: AppTheme.paddingMedium),
                            ElevatedButton(
                              onPressed: _loadUsersStats,
                              child: const Text('Спробувати знову'),
                            ),
                          ],
                        ),
                      )
                    : _usersStats.isEmpty
                        ? const Center(
                            child: Text(
                              'Немає даних для відображення',
                              style: TextStyle(fontSize: 16),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(AppTheme.paddingMedium),
                            itemCount: _usersStats.length,
                            itemBuilder: (context, index) {
                              final userStats = _usersStats[index];
                              return _buildUserStatsCard(userStats, index + 1);
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserStatsCard(Map<String, dynamic> userStats, int rank) {
    final user = userStats['user'];
    final stats = userStats['stats'];
    
    return Card(
      margin: const EdgeInsets.only(bottom: AppTheme.paddingMedium),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Заголовок с рейтингом
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: _getRankColor(rank),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text(
                      '#$rank',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: AppTheme.paddingMedium),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${user['firstName']} ${user['lastName']}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                    ],
                  ),
                ),
                Text(
                  '${stats['total_score']} балів',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppTheme.paddingMedium),
            
            // Статистика
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    'Тестів',
                    stats['tests_completed'].toString(),
                    Icons.quiz,
                    Colors.blue,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    'Середній бал',
                    '${stats['avg_score'].toStringAsFixed(1)}%',
                    Icons.trending_up,
                    Colors.green,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    'Точність',
                    '${stats['accuracy_rate'].toStringAsFixed(1)}%',
                    Icons.track_changes,
                    Colors.purple,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppTheme.paddingMedium),
            
            // Дополнительная информация
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Місто: ${user['city']}',
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    'Посада: ${user['position']}',
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            
            if (stats['last_quiz_date'] != null) ...[
              const SizedBox(height: AppTheme.paddingSmall),
              Text(
                'Останній квіз: ${_formatDate(DateTime.parse(stats['last_quiz_date']))}',
                style: const TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  Color _getRankColor(int rank) {
    if (rank == 1) return Colors.amber[700]!;
    if (rank == 2) return Colors.grey[400]!;
    if (rank == 3) return Colors.orange[600]!;
    return AppTheme.primaryColor;
  }

  String _formatDate(DateTime date) {
    return '${date.day}.${date.month}.${date.year}';
  }
}
