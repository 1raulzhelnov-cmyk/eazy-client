import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  List<Map<String, dynamic>> _items = const <Map<String, dynamic>>[];
  bool _loading = true;
  String _segment = 'food';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final String path = _segment == 'food' ? 'assets/mock/restaurants.json' : 'assets/mock/flowers.json';
      final String content = await rootBundle.loadString(path);
      final List<dynamic> list = jsonDecode(content) as List<dynamic>;
      _items = list.cast<Map<String, dynamic>>();
    } catch (_) {
      _items = const <Map<String, dynamic>>[];
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Каталог'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Row(
            children: <Widget>[
              const SizedBox(width: 16),
              ChoiceChip(
                label: const Text('Еда'),
                selected: _segment == 'food',
                onSelected: (v) {
                  setState(() => _segment = 'food');
                  _load();
                },
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('Цветы'),
                selected: _segment == 'flowers',
                onSelected: (v) {
                  setState(() => _segment = 'flowers');
                  _load();
                },
              ),
              const SizedBox(width: 16),
            ],
          ),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _items.isEmpty
              ? const Center(child: Text('Нет данных'))
              : ListView.separated(
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final item = _items[index];
                    return ListTile(
                      leading: CircleAvatar(child: Text('${index + 1}')),
                      title: Text(item['name']?.toString() ?? ''),
                      subtitle: Text(item['category']?.toString() ?? ''),
                    );
                  },
                ),
    );
  }
}
