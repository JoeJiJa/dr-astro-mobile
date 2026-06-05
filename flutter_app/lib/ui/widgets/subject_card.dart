import 'package:flutter/material.dart';
import '../../core/models/subject.dart';
import '../../core/theme/app_colors.dart';
import 'book_card.dart';

class SubjectCard extends StatelessWidget {
  final Subject subject;
  final VoidCallback? onTap;

  const SubjectCard({
    super.key,
    required this.subject,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final color = BookCard.colorFromTailwind(subject.color);
    final totalBooks = _countBooks();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            colors: [
              color.withOpacity(0.85),
              color.withOpacity(0.6),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(isDark ? 0.3 : 0.25),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Background pattern
            Positioned(
              right: -20,
              bottom: -20,
              child: Icon(
                _iconForSubject(subject.icon),
                size: 100,
                color: Colors.white.withOpacity(0.08),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      _iconForSubject(subject.icon),
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    subject.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      height: 1.2,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(
                        Icons.library_books_rounded,
                        color: Colors.white.withOpacity(0.8),
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$totalBooks books',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      // Year badge
                      ...subject.years.take(2).map((y) => Container(
                            margin: const EdgeInsets.only(left: 4),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Y$y',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          )),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  int _countBooks() {
    final m = subject.materials;
    return m.textbooks.length +
        m.studyMaterials.length +
        m.clinicalBooks.length +
        m.questionBank.length +
        m.previousYearQuestions.length +
        m.extra.values.fold(0, (sum, list) => sum + list.length);
  }

  static IconData _iconForSubject(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'user':
      case 'bone':
        return Icons.skeleton;
      case 'brain':
        return Icons.psychology_rounded;
      case 'heart':
      case 'heartpulse':
        return Icons.favorite_rounded;
      case 'microscope':
      case 'dna':
        return Icons.biotech_rounded;
      case 'stethoscope':
        return Icons.medical_services_rounded;
      case 'pill':
      case 'syringe':
        return Icons.medication_rounded;
      case 'scissors':
        return Icons.content_cut_rounded;
      case 'baby':
        return Icons.child_care_rounded;
      case 'eye':
        return Icons.visibility_rounded;
      case 'ear':
        return Icons.hearing_rounded;
      case 'activity':
        return Icons.monitor_heart_rounded;
      case 'zap':
        return Icons.bolt_rounded;
      case 'shield':
        return Icons.shield_rounded;
      case 'cpu':
        return Icons.computer_rounded;
      case 'layers':
        return Icons.layers_rounded;
      case 'target':
        return Icons.gps_fixed_rounded;
      default:
        return Icons.menu_book_rounded;
    }
  }
}

extension SubjectCardColorExt on SubjectCard {
  static Color color(Subject subject) {
    return BookCard.colorFromTailwind(subject.color);
  }
}
