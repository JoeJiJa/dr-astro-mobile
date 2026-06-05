import 'package:flutter/material.dart';
import '../../core/models/subject.dart';
import '../../core/theme/app_colors.dart';
import 'package:cached_network_image/cached_network_image.dart';

class BookCard extends StatelessWidget {
  final Book book;
  final VoidCallback? onTap;
  final VoidCallback? onDownload;
  final bool isFavorited;
  final VoidCallback? onFavoriteToggle;
  final bool isAdmin;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const BookCard({
    super.key,
    required this.book,
    this.onTap,
    this.onDownload,
    this.isFavorited = false,
    this.onFavoriteToggle,
    this.isAdmin = false,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final coverColor = _hexFromTailwind(book.coverColor);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 140,
        decoration: BoxDecoration(
          color: isDark ? AppColors.dark.card : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: (isDark ? AppColors.dark.outline : AppColors.light.outline)
                .withOpacity(0.15),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(16)),
                  child: book.coverUrl != null && book.coverUrl!.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: book.coverUrl!,
                          height: 160,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) =>
                              _buildColorCover(coverColor),
                        )
                      : _buildColorCover(coverColor),
                ),
                // Recommendation badge
                if (book.recommendationLevel != RecommendationLevel.none)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        gradient: book.recommendationLevel ==
                                RecommendationLevel.goldStandard
                            ? AppColors.goldGradient
                            : LinearGradient(
                                colors: [AppColors.primary, AppColors.secondary]),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        book.recommendationLevel == RecommendationLevel.goldStandard
                            ? '★ Gold'
                            : book.recommendationLevel ==
                                    RecommendationLevel.preferred
                                ? 'Preferred'
                                : 'Exam',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                // Favorite button
                Positioned(
                  top: 8,
                  right: 8,
                  child: GestureDetector(
                    onTap: onFavoriteToggle,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.4),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isFavorited
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        color: isFavorited
                            ? Colors.red
                            : Colors.white,
                        size: 14,
                      ),
                    ),
                  ),
                ),
                // Admin actions
                if (isAdmin)
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: Row(
                      children: [
                        _adminButton(Icons.edit_rounded, AppColors.primary, onEdit),
                        const SizedBox(width: 4),
                        _adminButton(Icons.delete_rounded, AppColors.error, onDelete),
                      ],
                    ),
                  ),
              ],
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    book.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontSize: 12,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    book.author,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark
                          ? AppColors.dark.onSurfaceVariant
                          : AppColors.light.onSurfaceVariant,
                      fontSize: 10,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Download button
                  if (book.parts.isEmpty)
                    SizedBox(
                      width: double.infinity,
                      height: 28,
                      child: ElevatedButton.icon(
                        onPressed: onDownload,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                          textStyle: const TextStyle(fontSize: 10),
                        ),
                        icon: const Icon(Icons.download_rounded, size: 12),
                        label: const Text('Access'),
                      ),
                    )
                  else
                    SizedBox(
                      width: double.infinity,
                      height: 28,
                      child: OutlinedButton.icon(
                        onPressed: onTap,
                        style: OutlinedButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          side: const BorderSide(color: AppColors.primary, width: 1),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                          textStyle: const TextStyle(fontSize: 10),
                        ),
                        icon: const Icon(Icons.layers_rounded, size: 12),
                        label: Text('${book.parts.length} Parts'),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildColorCover(Color color) {
    return Container(
      height: 160,
      width: double.infinity,
      color: color,
      child: Icon(
        Icons.menu_book_rounded,
        color: Colors.white.withOpacity(0.3),
        size: 48,
      ),
    );
  }

  Widget _adminButton(IconData icon, Color color, VoidCallback? onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(5),
        decoration: BoxDecoration(
          color: color.withOpacity(0.85),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(icon, color: Colors.white, size: 12),
      ),
    );
  }

  static Color colorFromTailwind(String tailwindClass) => _hexFromTailwind(tailwindClass);

  static Color _hexFromTailwind(String tailwindClass) {
    final map = {
      'bg-red-500': const Color(0xFFEF4444),
      'bg-red-600': const Color(0xFFDC2626),
      'bg-red-700': const Color(0xFFB91C1C),
      'bg-amber-500': const Color(0xFFF59E0B),
      'bg-amber-600': const Color(0xFFD97706),
      'bg-yellow-500': const Color(0xFFEAB308),
      'bg-green-500': const Color(0xFF22C55E),
      'bg-green-600': const Color(0xFF16A34A),
      'bg-emerald-500': const Color(0xFF10B981),
      'bg-emerald-600': const Color(0xFF059669),
      'bg-emerald-700': const Color(0xFF047857),
      'bg-teal-500': const Color(0xFF14B8A6),
      'bg-teal-600': const Color(0xFF0D9488),
      'bg-blue-500': const Color(0xFF3B82F6),
      'bg-blue-600': const Color(0xFF2563EB),
      'bg-blue-700': const Color(0xFF1D4ED8),
      'bg-indigo-500': const Color(0xFF6366F1),
      'bg-indigo-600': const Color(0xFF4F46E5),
      'bg-indigo-700': const Color(0xFF4338CA),
      'bg-violet-500': const Color(0xFF8B5CF6),
      'bg-violet-600': const Color(0xFF7C3AED),
      'bg-purple-500': const Color(0xFFA855F7),
      'bg-purple-600': const Color(0xFF9333EA),
      'bg-purple-700': const Color(0xFF7E22CE),
      'bg-pink-500': const Color(0xFFEC4899),
      'bg-pink-600': const Color(0xFFDB2777),
      'bg-pink-700': const Color(0xFFBE185D),
      'bg-rose-500': const Color(0xFFF43F5E),
      'bg-slate-500': const Color(0xFF64748B),
      'bg-slate-600': const Color(0xFF475569),
      'bg-gray-600': const Color(0xFF4B5563),
      'bg-cyan-500': const Color(0xFF06B6D4),
      'bg-cyan-600': const Color(0xFF0891B2),
      'bg-lime-500': const Color(0xFF84CC16),
      'bg-orange-500': const Color(0xFFF97316),
      'bg-orange-600': const Color(0xFFEA580C),
    };
    return map[tailwindClass] ?? const Color(0xFF4F46E5);
  }
}
