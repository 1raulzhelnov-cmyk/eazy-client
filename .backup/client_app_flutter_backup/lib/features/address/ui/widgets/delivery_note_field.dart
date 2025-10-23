import 'package:flutter/material.dart';

class DeliveryNoteField extends StatelessWidget {
  const DeliveryNoteField({super.key, required this.controller, this.maxLength = 200});

  final TextEditingController controller;
  final int maxLength;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLength: maxLength,
      maxLines: 3,
      decoration: const InputDecoration(labelText: 'Инструкции для доставки'),
      validator: (value) {
        if (value != null && value.length > maxLength) {
          return 'Максимум $maxLength символов';
        }
        return null;
      },
    );
  }
}
