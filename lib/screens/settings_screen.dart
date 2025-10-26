import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/pin_service.dart';
import '../utils/app_theme.dart';
import 'pin_setup_screen.dart';
import 'admin_stats_screen.dart';
import 'profile_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isPinEnabled = false;
  bool _isLoadingPin = true;

  @override
  void initState() {
    super.initState();
    _loadPinStatus();
  }

  Future<void> _loadPinStatus() async {
    try {
      final isEnabled = await PinService.isPinEnabled();
      setState(() {
        _isPinEnabled = isEnabled;
        _isLoadingPin = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingPin = false;
      });
    }
  }

  Future<void> _togglePin() async {
    if (_isPinEnabled) {
      // Disable PIN
      final shouldDisable = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Відключити PIN-код'),
          content: const Text('Ви впевнені, що хочете відключити PIN-код?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Скасувати'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Відключити'),
            ),
          ],
        ),
      );

      if (shouldDisable == true) {
        await PinService.disablePin();
        setState(() {
          _isPinEnabled = false;
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('PIN-код відключено')),
          );
        }
      }
    } else {
      // Enable PIN
      final result = await Navigator.push<bool>(
        context,
        MaterialPageRoute(builder: (context) => const PinSetupScreen()),
      );

      if (result == true) {
        setState(() {
          _isPinEnabled = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Налаштування'),
        automaticallyImplyLeading: false,
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          return ListView(
            physics: const ClampingScrollPhysics(),
            padding: const EdgeInsets.all(16),
            children: [
              // Профіль користувача
              Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.primaryColor,
                    child: Text(
                      authProvider.user?.firstName.isNotEmpty == true 
                          ? authProvider.user!.firstName[0].toUpperCase()
                          : 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(authProvider.user?.fullName ?? 'Користувач'),
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => const ProfileScreen(),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              
              // Налаштування
              const Text(
                'Налаштування',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              
              Card(
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.notifications),
                      title: const Text('Сповіщення'),
                      trailing: Switch(
                        value: true,
                        onChanged: (value) {
                          // TODO: Змінити налаштування сповіщень
                        },
                      ),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.dark_mode),
                      title: const Text('Темна тема'),
                      trailing: Switch(
                        value: false,
                        onChanged: (value) {
                          // TODO: Змінити тему
                        },
                      ),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.language),
                      title: const Text('Мова'),
                      subtitle: const Text('Українська'),
                      trailing: const Icon(Icons.arrow_forward_ios),
                      onTap: () {
                        // TODO: Відкрити вибір мови
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.security),
                      title: const Text('PIN-код'),
                      subtitle: Text(_isPinEnabled ? 'Увімкнено' : 'Вимкнено'),
                      trailing: _isLoadingPin
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Switch(
                              value: _isPinEnabled,
                              onChanged: _isLoadingPin ? null : (_) => _togglePin(),
                            ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Админ панель (только для админов)
              if (authProvider.user?.role == 'admin') ...[
                const Text(
                  'Адміністративна панель',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                
                Card(
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.analytics, color: Colors.blue),
                        title: const Text('Статистика гравців'),
                        subtitle: const Text('Перегляд статистики всіх користувачів'),
                        trailing: const Icon(Icons.arrow_forward_ios),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const AdminStatsScreen(),
                            ),
                          );
                        },
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.admin_panel_settings, color: Colors.green),
                        title: const Text('Адмін панель'),
                        subtitle: const Text('Відкрити веб-адмін панель'),
                        trailing: const Icon(Icons.arrow_forward_ios),
                        onTap: () {
                          // TODO: Відкрити веб-адмін панель
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Веб-адмін панель доступна за адресою: http://localhost:3000/admin'),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
              
              // Інше
              const Text(
                'Інше',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              
              Card(
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.help),
                      title: const Text('Допомога'),
                      trailing: const Icon(Icons.arrow_forward_ios),
                      onTap: () {
                        // TODO: Відкрити допомогу
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.info),
                      title: const Text('Про додаток'),
                      trailing: const Icon(Icons.arrow_forward_ios),
                      onTap: () {
                        // TODO: Відкрити інформацію про додаток
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.logout, color: Colors.red),
                      title: const Text(
                        'Вийти',
                        style: TextStyle(color: Colors.red),
                      ),
                      onTap: () async {
                        final shouldLogout = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Підтвердження'),
                            content: const Text('Ви впевнені, що хочете вийти?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context, false),
                                child: const Text('Скасувати'),
                              ),
                              TextButton(
                                onPressed: () => Navigator.pop(context, true),
                                child: const Text('Вийти'),
                              ),
                            ],
                          ),
                        );
                        
                        if (shouldLogout == true) {
                          await authProvider.logout();
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}