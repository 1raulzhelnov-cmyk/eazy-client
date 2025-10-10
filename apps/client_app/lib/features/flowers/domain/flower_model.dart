class Flower {
  const Flower({
    required this.id,
    required this.name,
    required this.price,
    this.image,
    this.description,
  });

  final String id;
  final String name;
  final int price;
  final String? image;
  final String? description;

  Flower copyWith({
    String? id,
    String? name,
    int? price,
    String? image,
    String? description,
  }) {
    return Flower(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      image: image ?? this.image,
      description: description ?? this.description,
    );
  }

  factory Flower.fromJson(Map<String, dynamic> json) {
    return Flower(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      image: json['image'] as String?,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'name': name,
      'price': price,
      'image': image,
      'description': description,
    };
  }
}
