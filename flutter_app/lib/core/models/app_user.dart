import 'package:cloud_firestore/cloud_firestore.dart';

enum UserRole { admin, user }

class AppUser {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? college;
  final String? batchYear;
  final String? gender;
  final String? avatarUrl;
  final String? yearOfStudy;
  final UserRole role;
  final DateTime joinedAt;
  final DateTime? lastLoginAt;
  final List<String> recentlyViewed;
  final List<String> favorites;
  final int streak;
  final int totalXP;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.college,
    this.batchYear,
    this.gender,
    this.avatarUrl,
    this.yearOfStudy,
    required this.role,
    required this.joinedAt,
    this.lastLoginAt,
    this.recentlyViewed = const [],
    this.favorites = const [],
    this.streak = 0,
    this.totalXP = 0,
  });

  bool get isAdmin => role == UserRole.admin;

  factory AppUser.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return AppUser(
      id: doc.id,
      name: data['name'] as String? ?? 'User',
      email: data['email'] as String? ?? '',
      phone: data['phone'] as String?,
      college: data['college'] as String?,
      batchYear: data['batchYear'] as String?,
      gender: data['gender'] as String?,
      avatarUrl: data['avatarUrl'] as String?,
      yearOfStudy: data['yearOfStudy'] as String?,
      role: (data['role'] as String?) == 'admin' ? UserRole.admin : UserRole.user,
      joinedAt: (data['joinedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      lastLoginAt: (data['lastLoginAt'] as Timestamp?)?.toDate(),
      recentlyViewed: (data['recentlyViewed'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      favorites: (data['favorites'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      streak: data['streak'] as int? ?? 0,
      totalXP: data['totalXP'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'email': email,
        if (phone != null) 'phone': phone,
        if (college != null) 'college': college,
        if (batchYear != null) 'batchYear': batchYear,
        if (gender != null) 'gender': gender,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
        if (yearOfStudy != null) 'yearOfStudy': yearOfStudy,
        'role': role.name,
        'joinedAt': Timestamp.fromDate(joinedAt),
        if (lastLoginAt != null) 'lastLoginAt': Timestamp.fromDate(lastLoginAt!),
        'recentlyViewed': recentlyViewed,
        'favorites': favorites,
        'streak': streak,
        'totalXP': totalXP,
      };

  AppUser copyWith({
    String? name,
    String? phone,
    String? college,
    String? batchYear,
    String? gender,
    String? avatarUrl,
    String? yearOfStudy,
    List<String>? recentlyViewed,
    List<String>? favorites,
    int? streak,
    int? totalXP,
  }) {
    return AppUser(
      id: id,
      name: name ?? this.name,
      email: email,
      phone: phone ?? this.phone,
      college: college ?? this.college,
      batchYear: batchYear ?? this.batchYear,
      gender: gender ?? this.gender,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      yearOfStudy: yearOfStudy ?? this.yearOfStudy,
      role: role,
      joinedAt: joinedAt,
      lastLoginAt: lastLoginAt,
      recentlyViewed: recentlyViewed ?? this.recentlyViewed,
      favorites: favorites ?? this.favorites,
      streak: streak ?? this.streak,
      totalXP: totalXP ?? this.totalXP,
    );
  }
}
