import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/providers/subjects_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../ui/widgets/subject_card.dart';
import '../../ui/widgets/loading_shimmer.dart';

// ---------------------------------------------------------------------------
// Category filter provider (local to this screen)
// ---------------------------------------------------------------------------
final _practicalCategoryFilterProvider = StateProvider<String?>((ref) => null);

class PracticalScreen extends ConsumerWidget {
  const PracticalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subjectsAsync = ref.watch(subjectsStreamProvider);
    final selectedCategory = ref.watch(_practicalCategoryFilterProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? AppColors.dark.background : AppColors.light.background,
      body: subjectsAsync.when(
        loading: () => const _PracticalLoadingBody(),
        error: (e, _) => _PracticalErrorBody(error: e.toString()),
        data: (allSubjects) {
          // Filter: only subjects with practical sections
          final practicalSubjects = allSubjects
              .where((s) =>
                  s.practicalSections != null &&
                  s.practicalSections!.isNotEmpty)
              .toList();

          // OSCE subjects (flag or category)
          final osceSubjects = practicalSubjects
              .where((s) => s.hasOsce == true)
              .toList();

          // Derive categories
          final categories = practicalSubjects
              .map((s) => s.category?.toString())
              .whereType<String>()
              .toSet()
              .toList()
            ..sort();

          // Apply category filter
          final filtered = selectedCategory == null
              ? practicalSubjects
              : practicalSubjects
                  .where((s) => s.category?.toString() == selectedCategory)
                  .toList();

          // Stats
          final totalPracticalSubjects = practicalSubjects.length;
          final totalSections = practicalSubjects.fold<int>(
            0,
            (acc, s) => acc + (s.practicalSections?.length ?? 0),
          );

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // ── Hero Header ────────────────────────────────────────────
              SliverToBoxAdapter(
                child: _PracticalHeroHeader(
                  totalSubjects: totalPracticalSubjects,
                  totalSections: totalSections,
                  isDark: isDark,
                ),
              ),

              // ── OSCE Highlight Banner ──────────────────────────────────
              if (osceSubjects.isNotEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    child: _OsceHighlightCard(
                      osceCount: osceSubjects.length,
                      isDark: isDark,
                    ),
                  ),
                ),

              // ── Info Cards ─────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                  child: _PracticalStrategyRow(isDark: isDark),
                ),
              ),

              // ── Category Filter Chips ──────────────────────────────────
              if (categories.isNotEmpty)
                SliverToBoxAdapter(
                  child: _CategoryFilterBar(
                    categories: categories,
                    selected: selectedCategory,
                    onSelect: (c) => ref
                        .read(_practicalCategoryFilterProvider.notifier)
                        .state = c,
                    isDark: isDark,
                  ),
                ),

              // ── Section Title ──────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 4),
                  child: Row(
                    children: [
                      Container(
                        width: 4,
                        height: 20,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              AppColors.practicalPrimary,
                              AppColors.practicalSecondary,
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        selectedCategory != null
                            ? '$selectedCategory Subjects'
                            : 'All Practical Subjects',
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? AppColors.dark.onSurface
                                  : AppColors.light.onSurface,
                            ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color:
                              AppColors.practicalPrimary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${filtered.length}',
                          style: const TextStyle(
                            color: AppColors.practicalPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Grid / Empty ───────────────────────────────────────────
              if (filtered.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _PracticalEmptyState(
                    hasFilter: selectedCategory != null,
                    onClearFilter: () => ref
                        .read(_practicalCategoryFilterProvider.notifier)
                        .state = null,
                  ),
                )
              else
                _PracticalSubjectGrid(subjects: filtered, isDark: isDark),

              // ── Bottom padding ─────────────────────────────────────────
              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Hero Header
// ---------------------------------------------------------------------------
class _PracticalHeroHeader extends StatelessWidget {
  const _PracticalHeroHeader({
    required this.totalSubjects,
    required this.totalSections,
    required this.isDark,
  });

  final int totalSubjects;
  final int totalSections;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.practicalPrimary,
            AppColors.practicalSecondary,
            Color(0xFF059669),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Nav row
              Row(
                children: [
                  GestureDetector(
                    onTap: () => context.go('/home'),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.arrow_back_ios_new_rounded,
                          color: Colors.white, size: 18),
                    ),
                  ),
                  const Spacer(),
                  // Flask / science icon
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.science_rounded,
                        color: Colors.white, size: 24),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Title block
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Practical Vault',
                    style: Theme.of(context)
                        .textTheme
                        .headlineMedium
                        ?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5,
                        ),
                  ).animate().fadeIn(duration: 400.ms).slideX(
                        begin: -0.2,
                        end: 0,
                        duration: 400.ms,
                        curve: Curves.easeOut,
                      ),
                  const SizedBox(height: 4),
                  Text(
                    'Hands-on skills & OSCE preparation',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withOpacity(0.85),
                        ),
                  ).animate().fadeIn(delay: 100.ms, duration: 400.ms),
                ],
              ),
              const SizedBox(height: 20),
              // Stats
              Row(
                children: [
                  _PracticalStatChip(
                    icon: Icons.biotech_rounded,
                    label: '$totalSubjects',
                    subtitle: 'Subjects',
                  ).animate().fadeIn(delay: 150.ms, duration: 350.ms).slideY(
                        begin: 0.3,
                        end: 0,
                        duration: 350.ms,
                        curve: Curves.easeOut,
                      ),
                  const SizedBox(width: 12),
                  _PracticalStatChip(
                    icon: Icons.layers_rounded,
                    label: '$totalSections',
                    subtitle: 'Sessions',
                  ).animate().fadeIn(delay: 220.ms, duration: 350.ms).slideY(
                        begin: 0.3,
                        end: 0,
                        duration: 350.ms,
                        curve: Curves.easeOut,
                      ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PracticalStatChip extends StatelessWidget {
  const _PracticalStatChip({
    required this.icon,
    required this.label,
    required this.subtitle,
  });
  final IconData icon;
  final String label;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.75),
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// OSCE Highlight Card
// ---------------------------------------------------------------------------
class _OsceHighlightCard extends StatelessWidget {
  const _OsceHighlightCard({
    required this.osceCount,
    required this.isDark,
  });

  final int osceCount;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF7C3AED).withOpacity(isDark ? 0.25 : 0.1),
            const Color(0xFF4F46E5).withOpacity(isDark ? 0.2 : 0.06),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF7C3AED).withOpacity(isDark ? 0.4 : 0.2),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF7C3AED).withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.assignment_turned_in_rounded,
                color: Color(0xFF7C3AED), size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      'OSCE Ready',
                      style: TextStyle(
                        color: Color(0xFF7C3AED),
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF7C3AED).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '$osceCount subjects',
                        style: const TextStyle(
                          color: Color(0xFF7C3AED),
                          fontWeight: FontWeight.w600,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  'Structured clinical examination stations with skill-based assessments',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: isDark
                            ? AppColors.dark.onSurfaceVariant
                            : AppColors.light.onSurfaceVariant,
                        height: 1.4,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 400.ms).slideX(
          begin: 0.1,
          end: 0,
          delay: 200.ms,
          duration: 400.ms,
          curve: Curves.easeOut,
        );
  }
}

// ---------------------------------------------------------------------------
// Practical Strategy Info Row
// ---------------------------------------------------------------------------
class _PracticalStrategyRow extends StatelessWidget {
  const _PracticalStrategyRow({required this.isDark});
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _MiniInfoCard(
            icon: Icons.checklist_rounded,
            title: 'Checklists',
            subtitle: 'Step-by-step procedure guides',
            color: AppColors.practicalPrimary,
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _MiniInfoCard(
            icon: Icons.video_library_rounded,
            title: 'Visual',
            subtitle: 'Diagrams & specimen photos',
            color: const Color(0xFF0891B2),
            isDark: isDark,
          ),
        ),
      ],
    ).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }
}

class _MiniInfoCard extends StatelessWidget {
  const _MiniInfoCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.isDark,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark.surface : AppColors.light.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppColors.dark.outline : AppColors.light.outline,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 17),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: isDark
                        ? AppColors.dark.onSurface
                        : AppColors.light.onSurface,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: isDark
                        ? AppColors.dark.onSurfaceVariant
                        : AppColors.light.onSurfaceVariant,
                    fontSize: 10,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Category Filter Bar
// ---------------------------------------------------------------------------
class _CategoryFilterBar extends StatelessWidget {
  const _CategoryFilterBar({
    required this.categories,
    required this.selected,
    required this.onSelect,
    required this.isDark,
  });

  final List<String> categories;
  final String? selected;
  final void Function(String?) onSelect;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          _PracticalFilterChip(
            label: 'All',
            isSelected: selected == null,
            onTap: () => onSelect(null),
            isDark: isDark,
          ),
          ...categories.map(
            (c) => Padding(
              padding: const EdgeInsets.only(left: 8),
              child: _PracticalFilterChip(
                label: c,
                isSelected: selected == c,
                onTap: () => onSelect(selected == c ? null : c),
                isDark: isDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PracticalFilterChip extends StatelessWidget {
  const _PracticalFilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
    required this.isDark,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.practicalPrimary
              : (isDark ? AppColors.dark.surface : AppColors.light.surface),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.practicalPrimary
                : (isDark ? AppColors.dark.outline : AppColors.light.outline),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.practicalPrimary.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : (isDark
                    ? AppColors.dark.onSurfaceVariant
                    : AppColors.light.onSurfaceVariant),
            fontWeight:
                isSelected ? FontWeight.w700 : FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Subject Grid (Responsive)
// ---------------------------------------------------------------------------
class _PracticalSubjectGrid extends StatelessWidget {
  const _PracticalSubjectGrid({
    required this.subjects,
    required this.isDark,
  });

  final List<dynamic> subjects;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      sliver: SliverLayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.crossAxisExtent;
          int crossAxisCount;
          if (width >= 1100) {
            crossAxisCount = 4;
          } else if (width >= 700) {
            crossAxisCount = 3;
          } else {
            crossAxisCount = 2;
          }

          return SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              mainAxisSpacing: 14,
              crossAxisSpacing: 14,
              childAspectRatio: 0.78,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final subject = subjects[index];
                return SubjectCard(
                  subject: subject,
                  onTap: () =>
                      context.go('/practical/subject/${subject.id}'),
                  accentColor: AppColors.practicalPrimary,
                ).animate().fadeIn(
                      delay: Duration(milliseconds: 40 * index),
                      duration: 350.ms,
                    ).slideY(
                      begin: 0.15,
                      end: 0,
                      delay: Duration(milliseconds: 40 * index),
                      duration: 350.ms,
                      curve: Curves.easeOut,
                    );
              },
              childCount: subjects.length,
            ),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
class _PracticalEmptyState extends StatelessWidget {
  const _PracticalEmptyState({
    required this.hasFilter,
    required this.onClearFilter,
  });

  final bool hasFilter;
  final VoidCallback onClearFilter;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.practicalPrimary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                hasFilter
                    ? Icons.filter_list_off_rounded
                    : Icons.science_outlined,
                size: 56,
                color: AppColors.practicalPrimary.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              hasFilter
                  ? 'No subjects in this category'
                  : 'No practical subjects yet',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: isDark
                        ? AppColors.dark.onSurface
                        : AppColors.light.onSurface,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              hasFilter
                  ? 'Try selecting a different category'
                  : 'Practical sections will appear here once added',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? AppColors.dark.onSurfaceVariant
                        : AppColors.light.onSurfaceVariant,
                  ),
            ),
            if (hasFilter) ...[
              const SizedBox(height: 20),
              FilledButton.tonal(
                onPressed: onClearFilter,
                style: FilledButton.styleFrom(
                  backgroundColor:
                      AppColors.practicalPrimary.withOpacity(0.1),
                  foregroundColor: AppColors.practicalPrimary,
                ),
                child: const Text('Clear Filter'),
              ),
            ],
          ],
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).scale(
          begin: const Offset(0.9, 0.9),
          end: const Offset(1, 1),
          duration: 400.ms,
          curve: Curves.easeOut,
        );
  }
}

// ---------------------------------------------------------------------------
// Loading Shimmer Body
// ---------------------------------------------------------------------------
class _PracticalLoadingBody extends StatelessWidget {
  const _PracticalLoadingBody();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return CustomScrollView(
      physics: const NeverScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: LoadingShimmer(
            isDark: isDark,
            child: Container(
              height: 220,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.practicalPrimary,
                    AppColors.practicalSecondary,
                  ],
                ),
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 14,
              crossAxisSpacing: 14,
              childAspectRatio: 0.78,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) => LoadingShimmer(
                isDark: isDark,
                child: Container(
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.dark.surface
                        : AppColors.light.surface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              childCount: 6,
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Error Body
// ---------------------------------------------------------------------------
class _PracticalErrorBody extends StatelessWidget {
  const _PracticalErrorBody({required this.error});
  final String error;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded,
                size: 56, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.error.withOpacity(0.8),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
