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
          PopupMenuButton<String>(
            onSelected: (String value) async {
              switch (value) {
                case 'link_google':
                  await ref.read(authControllerProvider.notifier).linkWithGoogle();
                  break;
                case 'link_apple':
                  await ref.read(authControllerProvider.notifier).linkWithApple();
                  break;
                case 'logout':
                  await ref.read(authControllerProvider.notifier).logout();
                  break;
              }
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(
                value: 'link_google',
                child: Text('Привязать Google'),
              ),
              const PopupMenuItem<String>(
                value: 'link_apple',
                child: Text('Привязать Apple'),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'logout',
                child: Text('Выход'),
              ),
            ],
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

