import 'package:client_app/features/address/state/address_controller.dart';
import 'package:client_app/features/address/ui/widgets/address_list_item.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AddressesPage extends ConsumerWidget {
  const AddressesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addresses = ref.watch(addressesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Адреса')),
      body: addresses.when(
        data: (items) {
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  const Text('Нет адресов'),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => context.push('/address-form'),
                    child: const Text('Добавить адрес'),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final a = items[index];
              return AddressListItem(
                address: a,
                onEdit: () => context.push('/address-form', extra: a.id),
                onDelete: () => ref.read(addressesProvider.notifier).delete(a.id),
                onMakePrimary: () => ref.read(addressesProvider.notifier).makePrimary(a.id),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Text('Ошибка: $e'),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.read(addressesProvider.notifier).refresh(),
                child: const Text('Повторить'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/address-form'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
