import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Корзина')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text('Количество: $_count'),
            const SizedBox(height: 12),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                IconButton(
                  onPressed: () async {
                    setState(() => _count++);
                    await FirebaseAnalytics.instance.logAddToCart(parameters: <String, Object?>{
                      'items_count': _count,
                    });
                    final SharedPreferences prefs = await SharedPreferences.getInstance();
                    await prefs.setInt('cart_count', _count);
                  },
                  icon: const Icon(Icons.add_circle_outline),
                ),
                const SizedBox(width: 8),
                IconButton(onPressed: () => setState(() => _count = _count > 0 ? _count - 1 : 0), icon: const Icon(Icons.remove_circle_outline)),
              ],
            )
          ],
        ),
      ),
    );
  }
}
