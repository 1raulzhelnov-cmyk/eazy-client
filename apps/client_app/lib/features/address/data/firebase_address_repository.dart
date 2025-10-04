import 'package:client_app/features/address/data/address_repository.dart';
import 'package:client_app/features/address/models/address.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class FirebaseAddressRepository implements AddressRepository {
  FirebaseAddressRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> _col(String userId) {
    return _firestore.collection('users').doc(userId).collection('addresses');
  }

  @override
  Future<List<Address>> list({required String userId}) async {
    final QuerySnapshot<Map<String, dynamic>> snap = await _col(userId).orderBy('createdAt', descending: true).get();
    return snap.docs.map((d) => Address.fromMap(d.id, d.data())).toList();
  }

  @override
  Future<String> create({required String userId, required Address address}) async {
    final now = DateTime.now();
    final data = address.copyWith(createdAt: now, updatedAt: now).toMap();
    final DocumentReference<Map<String, dynamic>> ref = await _col(userId).add(data);
    // If creating as primary, clear others
    if (address.isPrimary) {
      await setPrimary(userId: userId, id: ref.id);
    }
    return ref.id;
  }

  @override
  Future<void> update({required String userId, required Address address}) async {
    final data = address.copyWith(updatedAt: DateTime.now()).toMap();
    await _col(userId).doc(address.id).update(data);
    if (address.isPrimary) {
      await setPrimary(userId: userId, id: address.id);
    }
  }

  @override
  Future<void> remove({required String userId, required String id}) async {
    await _col(userId).doc(id).delete();
  }

  @override
  Future<void> setPrimary({required String userId, required String id}) async {
    final WriteBatch batch = _firestore.batch();
    final QuerySnapshot<Map<String, dynamic>> snap = await _col(userId).get();
    for (final doc in snap.docs) {
      batch.update(doc.reference, {'isPrimary': doc.id == id});
    }
    await batch.commit();
  }
}
