import 'package:client_app/features/auth/domain/auth_state.dart';
import 'package:client_app/features/auth/presentation/auth_controller.dart';
import 'package:client_app/features/profile/domain/user_profile.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  late final FirebaseFirestore _firestore;
  UserProfile? _profile;
  bool _loading = true;
  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _phoneCtrl = TextEditingController();
  bool _notif = true;

  @override
  void initState() {
    super.initState();
    _firestore = FirebaseFirestore.instance;
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final auth = ref.read(authControllerProvider);
    final String userId = auth is Authenticated ? auth.userId : 'anonymous';
    final DocumentSnapshot<Map<String, dynamic>> doc = await _firestore.collection('users').doc(userId).get();
    if (doc.exists) {
      _profile = UserProfile.fromMap(doc.id, doc.data() ?? <String, dynamic>{});
      _nameCtrl.text = _profile!.name ?? '';
      _phoneCtrl.text = _profile!.phone ?? '';
      _notif = _profile!.notificationsEnabled;
    } else {
      _profile = UserProfile(id: userId, email: '');
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _save() async {
    final auth = ref.read(authControllerProvider);
    final String userId = auth is Authenticated ? auth.userId : 'anonymous';
    final UserProfile updated = (_profile ?? UserProfile(id: userId, email: '')).copyWith(
      name: _nameCtrl.text.trim().isEmpty ? null : _nameCtrl.text.trim(),
      phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
      notificationsEnabled: _notif,
    );
    await _firestore.collection('users').doc(userId).set(updated.toMap(), SetOptions(merge: true));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Профиль сохранён')));
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Профиль')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Text('Статус: ${state.runtimeType}'),
                  const SizedBox(height: 12),
                  TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Имя')),
                  const SizedBox(height: 8),
                  TextField(controller: _phoneCtrl, decoration: const InputDecoration(labelText: 'Телефон')),
                  const SizedBox(height: 8),
                  SwitchListTile(
                    value: _notif,
                    onChanged: (v) => setState(() => _notif = v),
                    title: const Text('Уведомления о заказах'),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(onPressed: _save, child: const Text('Сохранить')),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => ref.read(authControllerProvider.notifier).logout(),
                    child: const Text('Выход'),
                  ),
                ],
              ),
            ),
    );
  }
}
