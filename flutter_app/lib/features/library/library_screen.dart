import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/subjects_provider.dart';
import '../../core/providers/theme_provider.dart';
import '../../core/services/firestore_service.dart';
import '../../core/theme/app_colors.dart';
import '../../ui/widgets/subject_card.dart';
import '../../ui/widgets/loading_shimmer.dart';

// ---------------------------------------------------------------------------
// Year filter provider
// ---------------------------------------------------------------------------
final _selectedYearProvider = StateProvider<String>((ref) => 'All');

const _yearFilters = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

// ---------------------------------------------------------------------------
// Library Screen
// ---------------------------------------------------------------------------
class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    // Sync controller text with existing provider value
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _searchController.text = ref.read(subjectSearchQueryProvider);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  int _crossAxisCount(double width) {
    if (width >= 1200) return 4;
    if (width >= 768) return 3;
    return 2;
  }

  List<dynamic> _applyYearFilter(List<dynamic> subjects, String year) {
    if (year == 'All') return subjects;
    final yearNum = int.tryParse(year.substring(0, 1)) ?? 1;
    return subjects.where((s) {
      final yearsList = (s.years as List<dynamic>?)?.map((y) => y as int).toList() ?? [];
      return yearsList.contains(yearNum);
    }).toList();
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final filteredAsync = ref.watch(filteredSubjectsProvider);
    final selectedYear = ref.watch(_selectedYearProvider);
    final currentUserAsync = ref.watch(currentUserProvider);
    final isAdmin = currentUserAsync.maybeWhen(
      data: (user) => user?.isAdmin ?? false,
      orElse: () => false,
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final crossAxisCount = _crossAxisCount(width);
        final horizontalPadding = width >= 1200 ? 48.0 : (width >= 768 ? 24.0 : 16.0);

        return Scaffold(
          backgroundColor: isDark ? AppColors.dark.background : AppColors.light.background,
          body: CustomScrollView(
            slivers: [
              // -----------------------------------------------------------------
              // Collapsible SliverAppBar
              // -----------------------------------------------------------------
              SliverAppBar(
                pinned: true,
                floating: false,
                expandedHeight: 200,
                backgroundColor: isDark ? AppColors.dark.surface : AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                flexibleSpace: FlexibleSpaceBar(
                  collapseMode: CollapseMode.parallax,
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.primary,
                          AppColors.primaryDark,
                        ],
                      ),
                    ),
                    child: SafeArea(
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: horizontalPadding,
                          vertical: 16,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.local_library_rounded,
                                    color: Colors.white, size: 28),
                                const SizedBox(width: 10),
                                Text(
                                  'Medical Library',
                                  style: theme.textTheme.headlineSmall?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            filteredAsync.maybeWhen(
                              data: (subjects) => Text(
                                '${subjects.length} subject${subjects.length == 1 ? '' : 's'} available',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.white70,
                                ),
                              ),
                              orElse: () => const SizedBox.shrink(),
                            ),
                            const SizedBox(height: 16),
                          ],
                        ),
                      ),
                    ),
                  ),
                  title: null,
                ),
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(56),
                  child: _SearchBar(
                    controller: _searchController,
                    horizontalPadding: horizontalPadding,
                    isDark: isDark,
                    onChanged: (val) {
                      ref.read(subjectSearchQueryProvider.notifier).state = val;
                    },
                    onClear: () {
                      _searchController.clear();
                      ref.read(subjectSearchQueryProvider.notifier).state = '';
                    },
                  ),
                ),
              ),

              // -----------------------------------------------------------------
              // Year Filter Chips
              // -----------------------------------------------------------------
              SliverToBoxAdapter(
                child: _YearFilterChips(
                  selectedYear: selectedYear,
                  horizontalPadding: horizontalPadding,
                  isDark: isDark,
                  onSelected: (year) {
                    ref.read(_selectedYearProvider.notifier).state = year;
                  },
                ),
              ),

              // -----------------------------------------------------------------
              // Content: loading / empty / grid
              // -----------------------------------------------------------------
              filteredAsync.when(
                loading: () => _ShimmerGrid(
                  crossAxisCount: crossAxisCount,
                  horizontalPadding: horizontalPadding,
                ),
                error: (err, _) => SliverFillRemaining(
                  child: _ErrorState(
                    message: err.toString(),
                    onRetry: () => ref.invalidate(filteredSubjectsProvider),
                  ),
                ),
                data: (subjects) {
                  final filtered = _applyYearFilter(subjects, selectedYear);
                  if (filtered.isEmpty) {
                    return SliverFillRemaining(
                      child: _EmptyState(
                        query: ref.watch(subjectSearchQueryProvider),
                        selectedYear: selectedYear,
                        onClear: () {
                          _searchController.clear();
                          ref.read(subjectSearchQueryProvider.notifier).state = '';
                          ref.read(_selectedYearProvider.notifier).state = 'All';
                        },
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: EdgeInsets.fromLTRB(
                        horizontalPadding, 8, horizontalPadding, 100),
                    sliver: SliverGrid(
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                        childAspectRatio: _cardAspectRatio(crossAxisCount),
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final subject = filtered[index];
                          return SubjectCard(
                            subject: subject,
                            onTap: () => context.push(
                              '/library/${subject.id}',
                            ),
                          );
                        },
                        childCount: filtered.length,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),

          // -------------------------------------------------------------------
          // Admin FAB
          // -------------------------------------------------------------------
          floatingActionButton: isAdmin
              ? FloatingActionButton.extended(
                  onPressed: () => _showAddSubjectDialog(context),
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  icon: const Icon(Icons.add_rounded),
                  label: const Text(
                    'Add Subject',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                )
              : null,
        );
      },
    );
  }

  double _cardAspectRatio(int columns) {
    if (columns == 4) return 0.82;
    if (columns == 3) return 0.78;
    return 0.74;
  }

  void _showAddSubjectDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const _AddSubjectDialog(),
    );
  }
}

// ---------------------------------------------------------------------------
// Search Bar widget
// ---------------------------------------------------------------------------
class _SearchBar extends StatelessWidget {
  const _SearchBar({
    required this.controller,
    required this.horizontalPadding,
    required this.isDark,
    required this.onChanged,
    required this.onClear,
  });

  final TextEditingController controller;
  final double horizontalPadding;
  final bool isDark;
  final ValueChanged<String> onChanged;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: isDark ? AppColors.dark.surface : AppColors.primary,
      padding: EdgeInsets.fromLTRB(horizontalPadding, 0, horizontalPadding, 10),
      child: Container(
        height: 46,
        decoration: BoxDecoration(
          color: isDark ? AppColors.dark.card : Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: TextField(
          controller: controller,
          onChanged: onChanged,
          style: TextStyle(
            color: isDark ? AppColors.dark.onSurface : AppColors.light.onSurface,
            fontSize: 15,
          ),
          decoration: InputDecoration(
            hintText: 'Search subjects...',
            hintStyle: TextStyle(
              color: isDark ? AppColors.dark.onSurfaceVariant : AppColors.light.onSurfaceVariant,
              fontSize: 15,
            ),
            prefixIcon: Icon(
              Icons.search_rounded,
              color: isDark ? AppColors.dark.onSurfaceVariant : AppColors.primary,
              size: 20,
            ),
            suffixIcon: ValueListenableBuilder<TextEditingValue>(
              valueListenable: controller,
              builder: (_, value, __) => value.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18),
                      color: isDark
                          ? AppColors.dark.onSurfaceVariant
                          : AppColors.light.onSurfaceVariant,
                      onPressed: onClear,
                    )
                  : const SizedBox.shrink(),
            ),
            border: InputBorder.none,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Year Filter Chips
// ---------------------------------------------------------------------------
class _YearFilterChips extends StatelessWidget {
  const _YearFilterChips({
    required this.selectedYear,
    required this.horizontalPadding,
    required this.isDark,
    required this.onSelected,
  });

  final String selectedYear;
  final double horizontalPadding;
  final bool isDark;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(
            horizontal: horizontalPadding, vertical: 8),
        itemCount: _yearFilters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final year = _yearFilters[index];
          final isSelected = year == selectedYear;
          return GestureDetector(
            onTap: () => onSelected(year),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : (isDark ? AppColors.dark.card : Colors.white),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : (isDark ? AppColors.dark.outline : AppColors.light.outline),
                  width: 1.5,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        )
                      ]
                    : null,
              ),
              alignment: Alignment.center,
              child: Text(
                year,
                style: TextStyle(
                  color: isSelected
                      ? Colors.white
                      : (isDark
                          ? AppColors.dark.onSurfaceVariant
                          : AppColors.light.onSurfaceVariant),
                  fontWeight:
                      isSelected ? FontWeight.bold : FontWeight.normal,
                  fontSize: 13,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Shimmer Grid
// ---------------------------------------------------------------------------
class _ShimmerGrid extends StatelessWidget {
  const _ShimmerGrid({
    required this.crossAxisCount,
    required this.horizontalPadding,
  });

  final int crossAxisCount;
  final double horizontalPadding;

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding:
          EdgeInsets.fromLTRB(horizontalPadding, 8, horizontalPadding, 24),
      sliver: SliverGrid(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 14,
          mainAxisSpacing: 14,
          childAspectRatio: crossAxisCount >= 3 ? 0.80 : 0.74,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, _) => const SubjectCardShimmer(),
          childCount: 12,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.query,
    required this.selectedYear,
    required this.onClear,
  });

  final String query;
  final String selectedYear;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 80,
              color: isDark
                  ? AppColors.dark.onSurfaceVariant
                  : AppColors.light.onSurfaceVariant,
            ),
            const SizedBox(height: 20),
            Text(
              'No subjects found',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.dark.onSurface : AppColors.light.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              query.isNotEmpty
                  ? 'No results for "$query"${selectedYear != 'All' ? ' in $selectedYear' : ''}.'
                  : selectedYear != 'All'
                      ? 'No subjects found for $selectedYear.'
                      : 'No subjects are available yet.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: isDark
                    ? AppColors.dark.onSurfaceVariant
                    : AppColors.light.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            if (query.isNotEmpty || selectedYear != 'All')
              ElevatedButton.icon(
                onPressed: onClear,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Clear Filters'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Error State
// ---------------------------------------------------------------------------
class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded,
                size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Add Subject Dialog (Admin)
// ---------------------------------------------------------------------------
class _AddSubjectDialog extends ConsumerStatefulWidget {
  const _AddSubjectDialog();

  @override
  ConsumerState<_AddSubjectDialog> createState() => _AddSubjectDialogState();
}

class _AddSubjectDialogState extends ConsumerState<_AddSubjectDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedYear = '1st Year';
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      final firestoreService = ref.read(firestoreServiceProvider);
      await firestoreService.addSubject(
        name: _nameController.text.trim(),
        description: _descController.text.trim(),
        year: _selectedYear,
      );
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add subject: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: isDark ? AppColors.dark.surface : Colors.white,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.add_circle_outline_rounded,
                          color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Add New Subject',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildField(
                  context: context,
                  label: 'Subject Name',
                  controller: _nameController,
                  hint: 'e.g. Anatomy',
                  isDark: isDark,
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Name is required' : null,
                ),
                const SizedBox(height: 16),
                _buildField(
                  context: context,
                  label: 'Description',
                  controller: _descController,
                  hint: 'Brief description...',
                  isDark: isDark,
                  maxLines: 3,
                  validator: null,
                ),
                const SizedBox(height: 16),
                Text(
                  'Year',
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedYear,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: isDark
                        ? AppColors.dark.card
                        : AppColors.light.surfaceVariant,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 12),
                  ),
                  dropdownColor:
                      isDark ? AppColors.dark.card : Colors.white,
                  style: TextStyle(
                    color: isDark ? AppColors.dark.onSurface : AppColors.light.onSurface,
                    fontSize: 14,
                  ),
                  items: _yearFilters
                      .where((y) => y != 'All')
                      .map((y) => DropdownMenuItem(value: y, child: Text(y)))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setState(() => _selectedYear = v);
                  },
                ),
                const SizedBox(height: 28),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: _isLoading
                          ? null
                          : () => Navigator.of(context).pop(),
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Add Subject'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField({
    required BuildContext context,
    required String label,
    required TextEditingController controller,
    required String hint,
    required bool isDark,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          validator: validator,
          style: TextStyle(
            color: isDark ? AppColors.dark.onSurface : AppColors.light.onSurface,
            fontSize: 14,
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: isDark
                  ? AppColors.dark.onSurfaceVariant
                  : AppColors.light.onSurfaceVariant,
              fontSize: 14,
            ),
            filled: true,
            fillColor:
                isDark ? AppColors.dark.card : AppColors.light.surfaceVariant,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: isDark ? AppColors.dark.outline : AppColors.light.outline,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide:
                  const BorderSide(color: AppColors.primary, width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide:
                  const BorderSide(color: AppColors.error, width: 1.5),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
        ),
      ],
    );
  }
}
