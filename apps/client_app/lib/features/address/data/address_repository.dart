import 'package:client_app/features/address/models/address.dart';

abstract class AddressRepository {
  Future<List<Address>> list({required String userId});
  Future<String> create({required String userId, required Address address});
  Future<void> update({required String userId, required Address address});
  Future<void> remove({required String userId, required String id});
  Future<void> setPrimary({required String userId, required String id});
}
