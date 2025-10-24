import 'package:client_app/features/address/models/address.dart';
import 'package:flutter/material.dart';

class AddressListItem extends StatelessWidget {
  const AddressListItem({super.key, required this.address, required this.onEdit, required this.onDelete, required this.onMakePrimary});

  final Address address;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onMakePrimary;

  @override
  Widget build(BuildContext context) {
    // Preserve visuals: simple ListTile-like layout with badges/texts
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
      child: ListTile(
        title: Text(address.label?.isNotEmpty == true ? address.label! : address.fullText),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(address.fullText),
            if (address.deliveryNote != null && address.deliveryNote!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  address.deliveryNote!,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            if (address.isPrimary)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text('По умолчанию', style: Theme.of(context).textTheme.labelSmall),
              ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (String value) {
            switch (value) {
              case 'edit':
                onEdit();
                break;
              case 'delete':
                onDelete();
                break;
              case 'primary':
                onMakePrimary();
                break;
            }
          },
          itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
            const PopupMenuItem<String>(value: 'edit', child: Text('Редактировать')),
            const PopupMenuItem<String>(value: 'delete', child: Text('Удалить')),
            const PopupMenuItem<String>(value: 'primary', child: Text('Сделать основным')),
          ],
        ),
      ),
    );
  }
}
