import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/providers/subjects_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../ui/widgets/subject_card.dart';
import '../../ui/widgets/loading_shimmer.dart';

// ---------------------------------------------------------------------------
// Year-filter provider (local to this screen)
// ---------------------------------------------------------------------------
final _examYearFilterProvider = StateProvider<String?>((ref) => null);

class ExamScreen extends ConsumerWidget {
  const ExamScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subjectsAsync = ref.watch(subjectsStreamProvider);
    final selectedYear = ref.watch(_examYearFilterProvider);
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      body: subjectsAsync.when(
        loading: () => const _ExamLoadingBody(),
        error: (e, _) => _ExamErrorBody(error: e.toString()),
        data: (allSubjects) {
          // Filter: only subjects with exam sections
          final examSubjects = allSubjects
              .where((s) => s.examSections != null && s.examSections!.isNotEmpty)
              .toList();

          // Derive available years
          final years = examSubjects
              .map((s) => s.year?.toString())
              .whereType<String>()
              .toSet()
              .toList()
            ..sort();

          // Apply year filter
          final filtered = selectedYear == null
              ? examSubjects
              : examSubjects.where((s) => s.year?.toString() == selectedYear).toList();

          // Stats
          final totalExamSubjects = examSubjects.length;
          final totalSections = examSubjects.fold<int>(
            0,
            (acc, s) => acc + (s.examSections?.length ?? 0),
          );

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // ── Hero Header ──────────────────────────────────────────────
              SliverToBoxAdapter(
                child: _ExamHeroHeader(
                  totalSubjects: totalExamSubjects,
                  totalSections: totalSections,
                  isDark: isDark,
                ),
              ),

              // ── Info Banner ──────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: _ExamInfoBanner(isDark: isDark),
                ),
              ),

              // ── Year Filter Chips ────────────────────────────────────────
              if (years.isNotEmpty)
                SliverToBoxAdapter(
                  child: _YearFilterBar(
                    years: years,
                    selected: selectedYear,
                    onSelect: (y) =>
                        ref.read(_examYearFilterProvider.notifier).state = y,
                    isDark: isDark,
                  ),
                ),

              // ── Section Title ────────────────────────────────────────────
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
                            colors: [AppColors.examPrimary, AppColors.examSecondary],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        selectedYear != null
                            ? 'Year $selectedYear Subjects'
                            : 'All Exam Subjects',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? AppColors.darkTextPrimary
                                  : AppColors.lightTextPrimary,
                            ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.examPrimary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${filtered.length}',
                          style: const TextStyle(
                            color: AppColors.examPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Grid / Empty State ───────────────────────────────────────
              if (filtered.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _ExamEmptyState(
                    hasFilter: selectedYear != null,
                    onClearFilter: () =>
                        ref.read(_examYearFilterProvider.notifier).state = null,
                  ),
                )
              else
                _ExamSubjectGrid(subjects: filtered, isDark: isDark),

              // ── Bottom Padding ───────────────────────────────────────────
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
class _ExamHeroHeader extends StatelessWidget {
  const _ExamHeroHeader({
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
            AppColors.examPrimary,
            AppColors.examSecondary,
            Color(0xFF6366F1),
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
              // Back button row
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
                  // Decorative graduation cap
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.school_rounded,
                        color: Colors.white, size: 24),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Title
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Exam Hub',
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
                          'Master your exams with focused prep',
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.white.withOpacity(0.85),
                                  ),
                        ).animate().fadeIn(delay: 100.ms, duration: 400.ms),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Stats row
              Row(
                children: [
                  _StatChip(
                    icon: Icons.book_rounded,
                    label: '$totalSubjects',
                    subtitle: 'Subjects',
                  ).animate().fadeIn(delay: 150.ms, duration: 350.ms).slideY(
                        begin: 0.3,
                        end: 0,
                        duration: 350.ms,
                        curve: Curves.easeOut,
                      ),
                  const SizedBox(width: 12),
                  _StatChip(
                    icon: Icons.layers_rounded,
                    label: '$totalSections',
                    subtitle: 'Sections',
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

class _StatChip extends StatelessWidget {
  const _StatChip({
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
// Exam Info Banner
// ---------------------------------------------------------------------------
class _ExamInfoBanner extends StatelessWidget {
  const _ExamInfoBanner({required this.isDark});
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.examPrimary.withOpacity(isDark ? 0.2 : 0.08),
            AppColors.examSecondary.withOpacity(isDark ? 0.15 : 0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.examPrimary.withOpacity(isDark ? 0.3 : 0.15),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.examPrimary.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.lightbulb_rounded,
                color: AppColors.examPrimary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Exam Strategy',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.examPrimary,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Focus on high-yield topics, practice MCQs systematically, and review key concepts before each exam section.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: isDark
                            ? AppColors.darkTextSecondary
                            : AppColors.lightTextSecondary,
                        height: 1.5,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 250.ms, duration: 400.ms);
  }
}

// ---------------------------------------------------------------------------
// Year Filter Bar
// ---------------------------------------------------------------------------
class _YearFilterBar extends StatelessWidget {
  const _YearFilterBar({
    required this.years,
    required this.selected,
    required this.onSelect,
    required this.isDark,
  });

  final List<String> years;
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
          _FilterChip(
            label: 'All',
            isSelected: selected == null,
            onTap: () => onSelect(null),
            isDark: isDark,
          ),
          ...years.map(
            (y) => Padding(
              padding: const EdgeInsets.only(left: 8),
              child: _FilterChip(
                label: 'Year $y',
                isSelected: selected == y,
                onTap: () => onSelect(selected == y ? null : y),
                isDark: isDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.examPrimary
              : (isDark
                  ? AppColors.darkSurface
                  : AppColors.lightSurface),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.examPrimary
                : (isDark
                    ? AppColors.darkBorder
                    : AppColors.lightBorder),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.examPrimary.withOpacity(0.3),
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
                    ? AppColors.darkTextSecondary
                    : AppColors.lightTextSecondary),
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
class _ExamSubjectGrid extends StatelessWidget {
  const _ExamSubjectGrid({
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
                      context.go('/exam/subject/${subject.id}'),
                  accentColor: AppColors.examPrimary,
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
class _ExamEmptyState extends StatelessWidget {
  const _ExamEmptyState({
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
                color: AppColors.examPrimary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                hasFilter
                    ? Icons.filter_list_off_rounded
                    : Icons.school_outlined,
                size: 56,
                color: AppColors.examPrimary.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              hasFilter
                  ? 'No subjects for this year'
                  : 'No exam subjects yet',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: isDark
                        ? AppColors.darkTextPrimary
                        : AppColors.lightTextPrimary,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              hasFilter
                  ? 'Try selecting a different year filter'
                  : 'Exam sections will appear here once added',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.lightTextSecondary,
                  ),
            ),
            if (hasFilter) ...[
              const SizedBox(height: 20),
              FilledButton.tonal(
                onPressed: onClearFilter,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.examPrimary.withOpacity(0.1),
                  foregroundColor: AppColors.examPrimary,
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
class _ExamLoadingBody extends StatelessWidget {
  const _ExamLoadingBody();

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
                  colors: [AppColors.examPrimary, AppColors.examSecondary],
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
                        ? AppColors.darkSurface
                        : AppColors.lightSurface,
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
class _ExamErrorBody extends StatelessWidget {
  const _ExamErrorBody({required this.error});
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
