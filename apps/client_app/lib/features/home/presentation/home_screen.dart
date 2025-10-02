import 'package:client_app/features/auth/presentation/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _currentIndex = 0;

  static const List<Widget> _tabs = <Widget>[
    Center(child: Text('Еда')),
    Center(child: Text('Цветы')),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: <Widget>[
          IconButton(
            onPressed: () async {
              await ref.read(authControllerProvider.notifier).logout();
              if (!mounted) return;
              // Navigation handled by guard; optionally force redirect
              // context.go('/login');
            },
            icon: const Icon(Icons.logout),
            tooltip: 'Выход',
          ),
        ],
      ),
      body: _tabs[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (int index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const <NavigationDestination>[
          NavigationDestination(icon: Icon(Icons.restaurant), label: 'Еда'),
          NavigationDestination(icon: Icon(Icons.local_florist), label: 'Цветы'),
        ],
      ),
    );
  }
}

