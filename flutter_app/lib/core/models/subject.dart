import 'package:cloud_firestore/cloud_firestore.dart';

class BookPart {
  final String id;
  final String title;
  final String downloadUrl;

  const BookPart({
    required this.id,
    required this.title,
    required this.downloadUrl,
  });

  factory BookPart.fromMap(Map<String, dynamic> map) {
    return BookPart(
      id: map['id'] as String? ?? '',
      title: map['title'] as String? ?? '',
      downloadUrl: map['downloadUrl'] as String? ?? '#',
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'title': title,
        'downloadUrl': downloadUrl,
      };
}

enum BookType { textbook, clinical, notes, questionBank }

enum RecommendationLevel { goldStandard, preferred, examOriented, none }

class Book {
  final String id;
  final String title;
  final String author;
  final String coverColor;
  final String? coverUrl;
  final BookType type;
  final String downloadUrl;
  final List<BookPart> parts;
  final RecommendationLevel recommendationLevel;
  final String? description;
  final String? calendarEventDate;
  final String? driveId;

  const Book({
    required this.id,
    required this.title,
    required this.author,
    required this.coverColor,
    this.coverUrl,
    required this.type,
    required this.downloadUrl,
    this.parts = const [],
    this.recommendationLevel = RecommendationLevel.none,
    this.description,
    this.calendarEventDate,
    this.driveId,
  });

  factory Book.fromMap(Map<String, dynamic> map) {
    return Book(
      id: map['id'] as String? ?? '',
      title: map['title'] as String? ?? 'Untitled',
      author: map['author'] as String? ?? '',
      coverColor: map['coverColor'] as String? ?? 'bg-indigo-600',
      coverUrl: map['coverUrl'] as String?,
      type: _parseType(map['type'] as String?),
      downloadUrl: map['downloadUrl'] as String? ?? '#',
      parts: (map['parts'] as List<dynamic>?)
              ?.map((p) => BookPart.fromMap(p as Map<String, dynamic>))
              .toList() ??
          [],
      recommendationLevel: _parseRecommendation(map['recommendationLevel'] as String?),
      description: map['description'] as String?,
      calendarEventDate: map['calendarEventDate'] as String?,
      driveId: map['driveId'] as String?,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'title': title,
        'author': author,
        'coverColor': coverColor,
        if (coverUrl != null) 'coverUrl': coverUrl,
        'type': type.name,
        'downloadUrl': downloadUrl,
        if (parts.isNotEmpty) 'parts': parts.map((p) => p.toMap()).toList(),
        'recommendationLevel': recommendationLevel.name,
        if (description != null) 'description': description,
        if (calendarEventDate != null) 'calendarEventDate': calendarEventDate,
        if (driveId != null) 'driveId': driveId,
      };

  Book copyWith({
    String? id,
    String? title,
    String? author,
    String? coverColor,
    String? coverUrl,
    BookType? type,
    String? downloadUrl,
    List<BookPart>? parts,
    RecommendationLevel? recommendationLevel,
    String? description,
  }) {
    return Book(
      id: id ?? this.id,
      title: title ?? this.title,
      author: author ?? this.author,
      coverColor: coverColor ?? this.coverColor,
      coverUrl: coverUrl ?? this.coverUrl,
      type: type ?? this.type,
      downloadUrl: downloadUrl ?? this.downloadUrl,
      parts: parts ?? this.parts,
      recommendationLevel: recommendationLevel ?? this.recommendationLevel,
      description: description ?? this.description,
    );
  }

  static BookType _parseType(String? type) {
    switch (type) {
      case 'clinical':
        return BookType.clinical;
      case 'notes':
        return BookType.notes;
      case 'question-bank':
        return BookType.questionBank;
      default:
        return BookType.textbook;
    }
  }

  static RecommendationLevel _parseRecommendation(String? level) {
    switch (level) {
      case 'gold-standard':
        return RecommendationLevel.goldStandard;
      case 'preferred':
        return RecommendationLevel.preferred;
      case 'exam-oriented':
        return RecommendationLevel.examOriented;
      default:
        return RecommendationLevel.none;
    }
  }

  String get typeLabel {
    switch (type) {
      case BookType.textbook:
        return 'Textbook';
      case BookType.clinical:
        return 'Clinical';
      case BookType.notes:
        return 'Notes';
      case BookType.questionBank:
        return 'Q-Bank';
    }
  }

  String get recommendationLabel {
    switch (recommendationLevel) {
      case RecommendationLevel.goldStandard:
        return 'Gold Standard';
      case RecommendationLevel.preferred:
        return 'Preferred';
      case RecommendationLevel.examOriented:
        return 'Exam Oriented';
      case RecommendationLevel.none:
        return '';
    }
  }
}

class SubjectSection {
  final String id;
  final String label;
  final String? description;

  const SubjectSection({
    required this.id,
    required this.label,
    this.description,
  });

  factory SubjectSection.fromMap(Map<String, dynamic> map) {
    return SubjectSection(
      id: map['id'] as String? ?? '',
      label: map['label'] as String? ?? '',
      description: map['description'] as String?,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'label': label,
        if (description != null) 'description': description,
      };
}

class SubjectMaterials {
  final List<Book> textbooks;
  final List<Book> studyMaterials;
  final List<Book> clinicalBooks;
  final List<Book> questionBank;
  final List<Book> previousYearQuestions;
  final List<Book> practicalMaterials;
  final List<Book> osce;
  final List<Book> viva;
  final Map<String, List<Book>> extra; // Subject-specific sections

  const SubjectMaterials({
    this.textbooks = const [],
    this.studyMaterials = const [],
    this.clinicalBooks = const [],
    this.questionBank = const [],
    this.previousYearQuestions = const [],
    this.practicalMaterials = const [],
    this.osce = const [],
    this.viva = const [],
    this.extra = const {},
  });

  factory SubjectMaterials.fromMap(Map<String, dynamic> map) {
    List<Book> parseBooks(dynamic data) {
      if (data == null) return [];
      return (data as List<dynamic>)
          .map((b) => Book.fromMap(b as Map<String, dynamic>))
          .toList();
    }

    final known = {
      'textbooks', 'studyMaterials', 'clinicalBooks', 'questionBank',
      'previousYearQuestions', 'practicalMaterials', 'osce', 'viva',
    };

    final extra = <String, List<Book>>{};
    for (final key in map.keys) {
      if (!known.contains(key) && map[key] is List) {
        extra[key] = parseBooks(map[key]);
      }
    }

    return SubjectMaterials(
      textbooks: parseBooks(map['textbooks']),
      studyMaterials: parseBooks(map['studyMaterials']),
      clinicalBooks: parseBooks(map['clinicalBooks']),
      questionBank: parseBooks(map['questionBank']),
      previousYearQuestions: parseBooks(map['previousYearQuestions']),
      practicalMaterials: parseBooks(map['practicalMaterials']),
      osce: parseBooks(map['osce']),
      viva: parseBooks(map['viva']),
      extra: extra,
    );
  }

  List<MapEntry<String, List<Book>>> get allCategories {
    final categories = <MapEntry<String, List<Book>>>[];
    if (textbooks.isNotEmpty) categories.add(MapEntry('Textbooks', textbooks));
    if (studyMaterials.isNotEmpty) categories.add(MapEntry('Study Materials', studyMaterials));
    if (clinicalBooks.isNotEmpty) categories.add(MapEntry('Clinical Books', clinicalBooks));
    if (questionBank.isNotEmpty) categories.add(MapEntry('Question Bank', questionBank));
    if (previousYearQuestions.isNotEmpty) categories.add(MapEntry('Previous Year Questions', previousYearQuestions));
    if (practicalMaterials.isNotEmpty) categories.add(MapEntry('Practical Materials', practicalMaterials));
    if (osce.isNotEmpty) categories.add(MapEntry('OSCE', osce));
    if (viva.isNotEmpty) categories.add(MapEntry('Viva', viva));
    for (final e in extra.entries) {
      if (e.value.isNotEmpty) categories.add(MapEntry(_formatKey(e.key), e.value));
    }
    return categories;
  }

  String _formatKey(String key) {
    return key
        .replaceAllMapped(RegExp(r'([A-Z])'), (m) => ' ${m.group(0)}')
        .trim()
        .split(' ')
        .map((w) => w.isEmpty ? '' : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }
}

class Subject {
  final String id;
  final String name;
  final String? description;
  final String icon;
  final List<int> years;
  final String color;
  final SubjectMaterials materials;
  final List<SubjectSection> practicalSections;
  final List<SubjectSection> examSections;
  final List<Map<String, String>> categories;

  const Subject({
    required this.id,
    required this.name,
    this.description,
    required this.icon,
    required this.years,
    required this.color,
    required this.materials,
    this.practicalSections = const [],
    this.examSections = const [],
    this.categories = const [],
  });

  factory Subject.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Subject.fromMap(doc.id, data);
  }

  factory Subject.fromMap(String id, Map<String, dynamic> data) {
    return Subject(
      id: id,
      name: data['name'] as String? ?? id,
      description: data['description'] as String?,
      icon: data['icon'] as String? ?? 'BookOpen',
      years: (data['years'] as List<dynamic>?)?.map((y) => y as int).toList() ?? [1],
      color: data['color'] as String? ?? 'bg-indigo-500',
      materials: SubjectMaterials.fromMap(
        data['materials'] as Map<String, dynamic>? ?? {},
      ),
      practicalSections: (data['practicalSections'] as List<dynamic>?)
              ?.map((s) => SubjectSection.fromMap(s as Map<String, dynamic>))
              .toList() ??
          [],
      examSections: (data['examSections'] as List<dynamic>?)
              ?.map((s) => SubjectSection.fromMap(s as Map<String, dynamic>))
              .toList() ??
          [],
      categories: (data['categories'] as List<dynamic>?)
              ?.map((c) => Map<String, String>.from(c as Map))
              .toList() ??
          [],
    );
  }
}
