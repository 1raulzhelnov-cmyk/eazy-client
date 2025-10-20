import 'package:client_app/features/address/data/places_service.dart';
import 'package:client_app/features/address/models/address.dart';
import 'package:client_app/features/address/state/address_controller.dart';
import 'package:client_app/features/address/ui/widgets/delivery_note_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AddressFormPage extends ConsumerStatefulWidget {
  const AddressFormPage({super.key, this.addressId});
  final String? addressId;

  @override
  ConsumerState<AddressFormPage> createState() => _AddressFormPageState();
}

class _AddressFormPageState extends ConsumerState<AddressFormPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _labelCtrl = TextEditingController();
  final TextEditingController _fullTextCtrl = TextEditingController();
  final TextEditingController _countryCtrl = TextEditingController();
  final TextEditingController _cityCtrl = TextEditingController();
  final TextEditingController _streetCtrl = TextEditingController();
  final TextEditingController _houseCtrl = TextEditingController();
  final TextEditingController _apartmentCtrl = TextEditingController();
  final TextEditingController _entranceCtrl = TextEditingController();
  final TextEditingController _floorCtrl = TextEditingController();
  final TextEditingController _deliveryNoteCtrl = TextEditingController();
  bool _isPrimary = false;
  double? _lat;
  double? _lng;
  String? _placeId;

  final PlacesService _places = PlacesService();
  List<PlaceSuggestion> _suggestions = const <PlaceSuggestion>[];

  @override
  void dispose() {
    _labelCtrl.dispose();
    _fullTextCtrl.dispose();
    _countryCtrl.dispose();
    _cityCtrl.dispose();
    _streetCtrl.dispose();
    _houseCtrl.dispose();
    _apartmentCtrl.dispose();
    _entranceCtrl.dispose();
    _floorCtrl.dispose();
    _deliveryNoteCtrl.dispose();
    super.dispose();
  }

  void _loadForEdit() {
    final items = ref.read(addressesProvider).value ?? <Address>[];
    final a = items.firstWhere(
      (x) => x.id == widget.addressId,
      orElse: () => Address(
        id: '',
        fullText: '',
        country: '',
        city: '',
        street: '',
        isPrimary: false,
        createdAt: DateTime.fromMillisecondsSinceEpoch(0),
        updatedAt: DateTime.fromMillisecondsSinceEpoch(0),
      ),
    );
    if (a.id.isEmpty) return;
    _labelCtrl.text = a.label ?? '';
    _fullTextCtrl.text = a.fullText;
    _countryCtrl.text = a.country;
    _cityCtrl.text = a.city;
    _streetCtrl.text = a.street;
    _houseCtrl.text = a.house ?? '';
    _apartmentCtrl.text = a.apartment ?? '';
    _entranceCtrl.text = a.entrance ?? '';
    _floorCtrl.text = a.floor ?? '';
    _deliveryNoteCtrl.text = a.deliveryNote ?? '';
    _isPrimary = a.isPrimary;
    _lat = a.lat;
    _lng = a.lng;
    _placeId = a.placeId;
    setState(() {});
  }

  bool get _isValidLabel => _labelCtrl.text.length <= 40;
  bool get _isValidNote => _deliveryNoteCtrl.text.length <= 200;
  bool get _hasFullOrCityStreet => _fullTextCtrl.text.trim().isNotEmpty ||
      (_cityCtrl.text.trim().isNotEmpty && _streetCtrl.text.trim().isNotEmpty);
  bool get _coordsRequiredOk => _placeId == null || (_lat != null && _lng != null);
  bool get _formValid => _isValidLabel && _isValidNote && _hasFullOrCityStreet && _coordsRequiredOk;

  Future<void> _onSave() async {
    if (!_formValid) return;
    final now = DateTime.now();
    final model = Address(
      id: widget.addressId ?? '',
      label: _labelCtrl.text.trim().isEmpty ? null : _labelCtrl.text.trim(),
      fullText: _fullTextCtrl.text.trim(),
      country: _countryCtrl.text.trim(),
      city: _cityCtrl.text.trim(),
      street: _streetCtrl.text.trim(),
      house: _houseCtrl.text.trim().isEmpty ? null : _houseCtrl.text.trim(),
      apartment: _apartmentCtrl.text.trim().isEmpty ? null : _apartmentCtrl.text.trim(),
      entrance: _entranceCtrl.text.trim().isEmpty ? null : _entranceCtrl.text.trim(),
      floor: _floorCtrl.text.trim().isEmpty ? null : _floorCtrl.text.trim(),
      lat: _lat,
      lng: _lng,
      placeId: _placeId,
      deliveryNote: _deliveryNoteCtrl.text.trim().isEmpty ? null : _deliveryNoteCtrl.text.trim(),
      isPrimary: _isPrimary,
      createdAt: now,
      updatedAt: now,
    );
    await ref.read(addressesProvider.notifier).addOrUpdate(model);
    if (!mounted) return;
    context.pop();
  }

  Future<void> _onQueryChanged(String value) async {
    if (!_places.isEnabled) {
      setState(() => _suggestions = const <PlaceSuggestion>[]);
      return;
    }
    if (value.trim().isEmpty) {
      setState(() => _suggestions = const <PlaceSuggestion>[]);
      return;
    }
    try {
      final results = await _places.autocomplete(value);
      setState(() => _suggestions = results);
    } catch (_) {
      setState(() => _suggestions = const <PlaceSuggestion>[]);
    }
  }

  Future<void> _onSelectSuggestion(PlaceSuggestion s) async {
    _placeId = s.placeId;
    try {
      final details = await _places.resolvePlace(s.placeId);
      _fullTextCtrl.text = details.formattedAddress;
      _lat = details.lat;
      _lng = details.lng;
    } catch (_) {
      // keep user-entered data
    }
    setState(() {});
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadForEdit());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.addressId == null ? 'Добавить адрес' : 'Редактировать адрес')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: <Widget>[
            TextFormField(
              controller: _labelCtrl,
              decoration: const InputDecoration(labelText: 'Метка (например Дом, Работа)'),
              maxLength: 40,
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _fullTextCtrl,
              decoration: InputDecoration(
                labelText: 'Адрес целиком',
                helperText: _places.isEnabled ? 'Начните вводить для подсказок' : 'Введите адрес полностью',
              ),
              onChanged: _onQueryChanged,
            ),
            if (_suggestions.isNotEmpty)
              Card(
                margin: const EdgeInsets.only(top: 8),
                child: ListView.builder(
                  itemCount: _suggestions.length,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemBuilder: (context, index) {
                    final s = _suggestions[index];
                    return ListTile(
                      title: Text(s.description),
                      onTap: () => _onSelectSuggestion(s),
                    );
                  },
                ),
              ),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(child: TextFormField(controller: _countryCtrl, decoration: const InputDecoration(labelText: 'Страна'))),
              const SizedBox(width: 8),
              Expanded(child: TextFormField(controller: _cityCtrl, decoration: const InputDecoration(labelText: 'Город'))),
            ]),
            const SizedBox(height: 8),
            TextFormField(controller: _streetCtrl, decoration: const InputDecoration(labelText: 'Улица')),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(child: TextFormField(controller: _houseCtrl, decoration: const InputDecoration(labelText: 'Дом'))),
              const SizedBox(width: 8),
              Expanded(child: TextFormField(controller: _apartmentCtrl, decoration: const InputDecoration(labelText: 'Кв.'))),
            ]),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(child: TextFormField(controller: _entranceCtrl, decoration: const InputDecoration(labelText: 'Подъезд'))),
              const SizedBox(width: 8),
              Expanded(child: TextFormField(controller: _floorCtrl, decoration: const InputDecoration(labelText: 'Этаж'))),
            ]),
            const SizedBox(height: 8),
            DeliveryNoteField(controller: _deliveryNoteCtrl),
            const SizedBox(height: 12),
            SwitchListTile(
              value: _isPrimary,
              onChanged: (v) => setState(() => _isPrimary = v),
              title: const Text('Сделать основным'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _formValid ? _onSave : null,
              child: const Text('Сохранить'),
            ),
          ],
        ),
      ),
    );
  }
}
