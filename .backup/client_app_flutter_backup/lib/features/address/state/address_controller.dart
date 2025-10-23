import 'package:client_app/features/address/data/address_repository.dart';
import 'package:client_app/features/address/data/firebase_address_repository.dart';
import 'package:client_app/features/address/models/address.dart';
import 'package:client_app/features/auth/domain/auth_state.dart';
import 'package:client_app/features/auth/presentation/auth_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final addressRepositoryProvider = Provider<AddressRepository>((ref) {
  return FirebaseAddressRepository();
});

final addressesProvider = AsyncNotifierProvider<AddressController, List<Address>>(
  AddressController.new,
);

class AddressController extends AsyncNotifier<List<Address>> {
  late final AddressRepository _repo;

  @override
  Future<List<Address>> build() async {
    _repo = ref.read(addressRepositoryProvider);
    final userId = _readUserId();
    if (userId == null) return <Address>[];
    return _repo.list(userId: userId);
  }

  String? _readUserId() {
    final auth = ref.read(authControllerProvider);
    if (auth is Authenticated) return auth.userId;
    // allow anonymous user
    return 'anonymous';
  }

  Future<void> refresh() async {
    final userId = _readUserId();
    if (userId == null) return;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _repo.list(userId: userId));
  }

  Future<void> addOrUpdate(Address input) async {
    final userId = _readUserId();
    if (userId == null) return;
    if (input.id.isEmpty) {
      final String id = await _repo.create(userId: userId, address: input);
      await refresh();
      if (input.isPrimary) {
        await _repo.setPrimary(userId: userId, id: id);
        await refresh();
      }
    } else {
      await _repo.update(userId: userId, address: input);
      if (input.isPrimary) {
        await _repo.setPrimary(userId: userId, id: input.id);
      }
      await refresh();
    }
  }

  Future<void> delete(String id) async {
    final userId = _readUserId();
    if (userId == null) return;
    await _repo.remove(userId: userId, id: id);
    await refresh();
  }

  Future<void> makePrimary(String id) async {
    final userId = _readUserId();
    if (userId == null) return;
    await _repo.setPrimary(userId: userId, id: id);
    await refresh();
  }
}
