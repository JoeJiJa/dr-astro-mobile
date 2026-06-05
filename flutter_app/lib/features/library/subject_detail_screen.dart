import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/models/subject.dart';
import '../../core/providers/subjects_provider.dart';
import '../../core/providers/theme_provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/firestore_service.dart';
import '../../core/theme/app_colors.dart';
import '../../ui/widgets/book_card.dart';
import '../../ui/widgets/loading_shimmer.dart';

// ---------------------------------------------------------------------------
// Mode enum
// ---------------------------------------------------------------------------
enum SubjectDetailMode { library, exam, practical }

// ---------------------------------------------------------------------------
// Category model
// ---------------------------------------------------------------------------
class _BookCategory {
  const _BookCategory({required this.id, required this.label, required this.icon});
  final String id;
  final String label;
  final IconData icon;
}

const _categories = [
  _BookCategory(id: 'textbooks', label: 'Textbooks', icon: Icons.menu_book_rounded),
  _BookCategory(id: 'study_materials', label: 'Study Materials', icon: Icons.description_rounded),
  _BookCategory(id: 'qbank', label: 'Q-Bank', icon: Icons.quiz_rounded),
  _BookCategory(id: 'revision', label: 'Revision Notes', icon: Icons.sticky_note_2_rounded),
  _BookCategory(id: 'videos', label: 'Video Lectures', icon: Icons.play_circle_rounded),
  _BookCategory(id: 'past_papers', label: 'Past Papers', icon: Icons.history_edu_rounded),
];

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

/// Provides the currently viewed subject from Firestore.
final selectedSubjectProvider =
    StreamProvider.family<Subject?, String>((ref, subjectId) {
  final service = ref.read(firestoreServiceProvider);
  return service.watchSubjects().map((list) {
    try {
      return list.firstWhere((s) => s.id == subjectId);
    } catch (_) {
      return null;
    }
  });
});

/// Books stream per subject + category.
final subjectBooksProvider =
    StreamProvider.family<List<Book>, _SubjectCategoryKey>((ref, key) {
  final service = ref.read(firestoreServiceProvider);
  return service.watchSubjects().map((list) {
    try {
      final subject = list.firstWhere((s) => s.id == key.subjectId);
      switch (key.categoryId) {
        case 'textbooks':
          return subject.materials.textbooks;
        case 'study_materials':
          return subject.materials.studyMaterials;
        case 'clinical':
        case 'clinicalBooks':
          return subject.materials.clinicalBooks;
        case 'qbank':
        case 'questionBank':
          return subject.materials.questionBank;
        case 'past_papers':
        case 'previousYearQuestions':
          return subject.materials.previousYearQuestions;
        case 'practical':
        case 'practicalMaterials':
          return subject.materials.practicalMaterials;
        case 'osce':
          return subject.materials.osce;
        case 'viva':
          return subject.materials.viva;
        default:
          return subject.materials.extra[key.categoryId] ?? [];
      }
    } catch (_) {
      return [];
    }
  });
});

/// Set of favorited book IDs for the current user.
final favoriteBooksProvider = StreamProvider<Set<String>>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.when(
    data: (user) {
      if (user == null) return Stream.value(<String>{});
      final service = ref.read(firestoreServiceProvider);
      return service.watchUserFavorites(user.uid);
    },
    loading: () => Stream.value(<String>{}),
    error: (_, __) => Stream.value(<String>{}),
  );
});

class _SubjectCategoryKey {
  const _SubjectCategoryKey({required this.subjectId, required this.categoryId});
  final String subjectId;
  final String categoryId;

  @override
  bool operator ==(Object other) =>
      other is _SubjectCategoryKey &&
      other.subjectId == subjectId &&
      other.categoryId == categoryId;

  @override
  int get hashCode => Object.hash(subjectId, categoryId);
}

// ---------------------------------------------------------------------------
// Subject Detail Screen
// ---------------------------------------------------------------------------
class SubjectDetailScreen extends ConsumerStatefulWidget {
  const SubjectDetailScreen({
    super.key,
    required this.subjectId,
    this.mode = SubjectDetailMode.library,
  });

  final String subjectId;
  final SubjectDetailMode mode;

  @override
  ConsumerState<SubjectDetailScreen> createState() =>
      _SubjectDetailScreenState();
}

class _SubjectDetailScreenState extends ConsumerState<SubjectDetailScreen>
    with TickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: _categories.length,
      vsync: this,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  Color _modeAccentColor() {
    switch (widget.mode) {
      case SubjectDetailMode.exam:
        return AppColors.examSecondary;
      case SubjectDetailMode.practical:
        return AppColors.practicalSecondary;
      case SubjectDetailMode.library:
        return AppColors.primary;
    }
  }

  IconData _modeIcon() {
    switch (widget.mode) {
      case SubjectDetailMode.exam:
        return Icons.assignment_rounded;
      case SubjectDetailMode.practical:
        return Icons.science_rounded;
      case SubjectDetailMode.library:
        return Icons.local_library_rounded;
    }
  }

  String _modeLabel() {
    switch (widget.mode) {
      case SubjectDetailMode.exam:
        return 'Exam Mode';
      case SubjectDetailMode.practical:
        return 'Practical Mode';
      case SubjectDetailMode.library:
        return 'Library';
    }
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accentColor = _modeAccentColor();
    final subjectAsync = ref.watch(selectedSubjectProvider(widget.subjectId));
    final currentUserAsync = ref.watch(currentUserProvider);
    final isAdmin = currentUserAsync.maybeWhen(
      data: (user) => user?.isAdmin ?? false,
      orElse: () => false,
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 1024;

        return Scaffold(
          backgroundColor:
              isDark ? AppColors.dark.background : AppColors.light.background,
          body: subjectAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => _buildError(context, err.toString()),
            data: (subject) => subject == null
                ? _buildNotFound(context)
                : _buildContent(
                    context: context,
                    subject: subject,
                    isDark: isDark,
                    isAdmin: isAdmin,
                    accentColor: accentColor,
                    isDesktop: isDesktop,
                  ),
          ),
        );
      },
    );
  }

  // -------------------------------------------------------------------------
  // Main content
  // -------------------------------------------------------------------------

  Widget _buildContent({
    required BuildContext context,
    required dynamic subject,
    required bool isDark,
    required bool isAdmin,
    required Color accentColor,
    required bool isDesktop,
  }) {
    final theme = Theme.of(context);

    return NestedScrollView(
      headerSliverBuilder: (context, innerBoxIsScrolled) => [
        SliverAppBar(
          pinned: true,
          expandedHeight: isDesktop ? 220 : 200,
          backgroundColor: isDark ? AppColors.dark.surface : accentColor,
          foregroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => context.pop(),
          ),
          actions: [
            if (isAdmin)
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert_rounded, color: Colors.white),
                color: isDark ? AppColors.dark.card : Colors.white,
                onSelected: (val) => _handleAdminAction(context, val, subject),
                itemBuilder: (_) => [
                  const PopupMenuItem(
                    value: 'edit_subject',
                    child: Row(children: [
                      Icon(Icons.edit_rounded, size: 18),
                      SizedBox(width: 10),
                      Text('Edit Subject'),
                    ]),
                  ),
                  const PopupMenuItem(
                    value: 'delete_subject',
                    child: Row(children: [
                      Icon(Icons.delete_rounded, size: 18, color: AppColors.error),
                      SizedBox(width: 10),
                      Text('Delete Subject',
                          style: TextStyle(color: AppColors.error)),
                    ]),
                  ),
                ],
              ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            collapseMode: CollapseMode.parallax,
            background: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [accentColor, accentColor.withOpacity(0.7)],
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 56, 20, 56),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(_modeIcon(),
                                color: Colors.white, size: 26),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  subject.name ?? 'Subject',
                                  style: theme.textTheme.headlineSmall
                                      ?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.2),
                                        borderRadius:
                                            BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        subject.year ?? '',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.15),
                                        borderRadius:
                                            BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        _modeLabel(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      if ((subject.description as String?)?.isNotEmpty ??
                          false) ...[
                        const SizedBox(height: 10),
                        Text(
                          subject.description,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(48),
            child: Container(
              color: isDark ? AppColors.dark.surface : Colors.white,
              child: TabBar(
                controller: _tabController,
                isScrollable: true,
                labelColor: accentColor,
                unselectedLabelColor: isDark
                    ? AppColors.dark.onSurfaceVariant
                    : AppColors.light.onSurfaceVariant,
                indicatorColor: accentColor,
                indicatorWeight: 3,
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
                unselectedLabelStyle: const TextStyle(fontSize: 13),
                tabs: _categories
                    .map(
                      (c) => Tab(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(c.icon, size: 16),
                            const SizedBox(width: 6),
                            Text(c.label),
                          ],
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
          ),
        ),
      ],
      body: TabBarView(
        controller: _tabController,
        children: _categories
            .map(
              (cat) => _CategoryTabView(
                subjectId: widget.subjectId,
                category: cat,
                isDark: isDark,
                isAdmin: isAdmin,
                accentColor: accentColor,
                isDesktop: isDesktop,
                onOpenBook: (book) => _openBook(context, book),
                onBookTap: (book) => _handleBookTap(context, book),
              ),
            )
            .toList(),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Book actions
  // -------------------------------------------------------------------------

  void _handleBookTap(BuildContext context, dynamic book) {
    final parts = book.parts as List?;
    if (parts != null && parts.isNotEmpty) {
      _showPartsDialog(context, book, parts);
    } else {
      _openBook(context, book);
    }
  }

  void _openBook(BuildContext context, dynamic book) {
    final url = book.downloadUrl as String?;
    final title = book.title as String? ?? 'Book';
    if (url != null && url.isNotEmpty) {
      context.push('/study', extra: {'title': title, 'url': url});
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No URL available for this book.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _showPartsDialog(BuildContext context, dynamic book, List parts) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: isDark ? AppColors.dark.surface : Colors.white,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420, maxHeight: 520),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryDark],
                  ),
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.collections_bookmark_rounded,
                        color: Colors.white, size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        book.title ?? 'Select Part',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded,
                          color: Colors.white, size: 20),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
              ),
              // Parts list
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  padding: const EdgeInsets.symmetric(
                      vertical: 8, horizontal: 4),
                  itemCount: parts.length,
                  separatorBuilder: (_, __) =>
                      Divider(height: 1, color: (isDark ? AppColors.dark.outline : AppColors.light.outline).withOpacity(0.12)),
                  itemBuilder: (_, index) {
                    final part = parts[index];
                    final partTitle =
                        part['title'] as String? ?? 'Part ${index + 1}';
                    final partUrl = part['url'] as String? ?? '';
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 4),
                      leading: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Center(
                          child: Text(
                            '${index + 1}',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                      title: Text(
                        partTitle,
                        style: TextStyle(
                          color: isDark ? AppColors.dark.onSurface : AppColors.light.onSurface,
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                        ),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded,
                          size: 14, color: AppColors.primary),
                      onTap: () {
                        Navigator.of(ctx).pop();
                        context.push('/study', extra: {
                          'title': partTitle,
                          'url': partUrl,
                        });
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Admin actions
  // -------------------------------------------------------------------------

  void _handleAdminAction(
      BuildContext context, String action, dynamic subject) {
    switch (action) {
      case 'edit_subject':
        _showEditSubjectDialog(context, subject);
        break;
      case 'delete_subject':
        _confirmDeleteSubject(context, subject);
        break;
    }
  }

  void _showEditSubjectDialog(BuildContext context, dynamic subject) {
    showDialog(
      context: context,
      builder: (ctx) => _EditSubjectDialog(subject: subject),
    );
  }

  void _confirmDeleteSubject(BuildContext context, dynamic subject) {
    final theme = Theme.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Subject?'),
        content: Text(
          'Are you sure you want to delete "${subject.name}"? This action cannot be undone.',
          style: theme.textTheme.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              try {
                final service = ref.read(firestoreServiceProvider);
                await service.deleteSubject(subject.id);
                if (context.mounted) context.pop();
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Error / Not found
  // -------------------------------------------------------------------------

  Widget _buildError(BuildContext context, String msg) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline_rounded,
              size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Text('Failed to load subject', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Text(msg,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () =>
                ref.invalidate(selectedSubjectProvider(widget.subjectId)),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Retry', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildNotFound(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.folder_off_rounded, size: 72, color: Colors.grey),
          const SizedBox(height: 16),
          Text('Subject not found',
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.pop(),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Go Back', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Category Tab View
// ---------------------------------------------------------------------------
class _CategoryTabView extends ConsumerWidget {
  const _CategoryTabView({
    required this.subjectId,
    required this.category,
    required this.isDark,
    required this.isAdmin,
    required this.accentColor,
    required this.isDesktop,
    required this.onOpenBook,
    required this.onBookTap,
  });

  final String subjectId;
  final _BookCategory category;
  final bool isDark;
  final bool isAdmin;
  final Color accentColor;
  final bool isDesktop;
  final void Function(dynamic book) onOpenBook;
  final void Function(dynamic book) onBookTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booksAsync = ref.watch(
      subjectBooksProvider(
        _SubjectCategoryKey(subjectId: subjectId, categoryId: category.id),
      ),
    );
    final favoritesAsync = ref.watch(favoriteBooksProvider);
    final favorites = favoritesAsync.maybeWhen(
      data: (s) => s,
      orElse: () => <String>{},
    );

    return booksAsync.when(
      loading: () => _buildShimmer(isDesktop),
      error: (err, _) => Center(
        child: Text(
          'Error loading books: $err',
          style: const TextStyle(color: AppColors.error),
        ),
      ),
      data: (books) {
        if (books.isEmpty) {
          return _EmptyCategoryState(
            category: category,
            isAdmin: isAdmin,
            accentColor: accentColor,
            subjectId: subjectId,
            isDark: isDark,
          );
        }

        if (isDesktop) {
          return _DesktopBooksGrid(
            books: books,
            favorites: favorites,
            accentColor: accentColor,
            isDark: isDark,
            isAdmin: isAdmin,
            subjectId: subjectId,
            categoryId: category.id,
            onBookTap: onBookTap,
          );
        }

        return _MobileBooksView(
          books: books,
          favorites: favorites,
          accentColor: accentColor,
          isDark: isDark,
          isAdmin: isAdmin,
          subjectId: subjectId,
          categoryId: category.id,
          onBookTap: onBookTap,
        );
      },
    );
  }

  Widget _buildShimmer(bool isDesktop) {
    if (isDesktop) {
      return GridView.builder(
        padding: const EdgeInsets.all(20),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 0.68,
        ),
        itemCount: 6,
        itemBuilder: (_, __) => const BookCardShimmer(),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 6,
      itemBuilder: (_, __) => const Padding(
        padding: EdgeInsets.only(bottom: 12),
        child: BookCardShimmer(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Mobile Books View (horizontal scroll per section + list)
// ---------------------------------------------------------------------------
class _MobileBooksView extends ConsumerWidget {
  const _MobileBooksView({
    required this.books,
    required this.favorites,
    required this.accentColor,
    required this.isDark,
    required this.isAdmin,
    required this.subjectId,
    required this.categoryId,
    required this.onBookTap,
  });

  final List<dynamic> books;
  final Set<String> favorites;
  final Color accentColor;
  final bool isDark;
  final bool isAdmin;
  final String subjectId;
  final String categoryId;
  final void Function(dynamic book) onBookTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
          sliver: SliverToBoxAdapter(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${books.length} ${books.length == 1 ? 'item' : 'items'}',
                  style: TextStyle(
                    color: isDark
                        ? AppColors.dark.onSurfaceVariant
                        : AppColors.light.onSurfaceVariant,
                    fontSize: 13,
                  ),
                ),
                if (isAdmin)
                  TextButton.icon(
                    onPressed: () => _showAddBookDialog(context, ref),
                    icon: const Icon(Icons.add_rounded, size: 16),
                    label: const Text('Add Book'),
                    style: TextButton.styleFrom(
                        foregroundColor: accentColor),
                  ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final book = books[index];
                final isFav = favorites.contains(book.id as String? ?? '');
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: BookCard(
                    book: book,
                    isFavorited: isFav,
                    isAdmin: isAdmin,
                    onTap: () => onBookTap(book),
                    onFavoriteToggle: () =>
                        _toggleFavorite(context, ref, book),
                    onEdit: isAdmin
                        ? () => _showEditBookDialog(context, ref, book)
                        : null,
                    onDelete: isAdmin
                        ? () => _confirmDeleteBook(context, ref, book)
                        : null,
                  ),
                );
              },
              childCount: books.length,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _toggleFavorite(
      BuildContext context, WidgetRef ref, dynamic book) async {
    try {
      final service = ref.read(firestoreServiceProvider);
      final currentUser = ref.read(authServiceProvider).currentUser;
      if (currentUser != null) {
        await service.toggleFavorite(currentUser.uid, book.id as String);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update favorite: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _showAddBookDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => _AddEditBookDialog(
        subjectId: subjectId,
        categoryId: categoryId,
        isDark: isDark,
      ),
    );
  }

  void _showEditBookDialog(BuildContext context, WidgetRef ref, dynamic book) {
    showDialog(
      context: context,
      builder: (ctx) => _AddEditBookDialog(
        subjectId: subjectId,
        categoryId: categoryId,
        isDark: isDark,
        book: book,
      ),
    );
  }

  void _confirmDeleteBook(BuildContext context, WidgetRef ref, dynamic book) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Book?'),
        content: Text(
            'Remove "${book.title}" from this category?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              try {
                final service = ref.read(firestoreServiceProvider);
                await service.deleteBook(
                  subjectId: subjectId,
                  categoryKey: categoryId,
                  bookId: book.id as String,
                );
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Desktop Books Grid
// ---------------------------------------------------------------------------
class _DesktopBooksGrid extends ConsumerWidget {
  const _DesktopBooksGrid({
    required this.books,
    required this.favorites,
    required this.accentColor,
    required this.isDark,
    required this.isAdmin,
    required this.subjectId,
    required this.categoryId,
    required this.onBookTap,
  });

  final List<dynamic> books;
  final Set<String> favorites;
  final Color accentColor;
  final bool isDark;
  final bool isAdmin;
  final String subjectId;
  final String categoryId;
  final void Function(dynamic book) onBookTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 4),
          sliver: SliverToBoxAdapter(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${books.length} ${books.length == 1 ? 'item' : 'items'}',
                  style: TextStyle(
                    color: isDark
                        ? AppColors.dark.onSurfaceVariant
                        : AppColors.light.onSurfaceVariant,
                    fontSize: 13,
                  ),
                ),
                if (isAdmin)
                  ElevatedButton.icon(
                    onPressed: () => showDialog(
                      context: context,
                      builder: (ctx) => _AddEditBookDialog(
                        subjectId: subjectId,
                        categoryId: categoryId,
                        isDark: isDark,
                      ),
                    ),
                    icon: const Icon(Icons.add_rounded, size: 16),
                    label: const Text('Add Book'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 80),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 0.7,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final book = books[index];
                final isFav =
                    favorites.contains(book.id as String? ?? '');
                return BookCard(
                  book: book,
                  isFavorited: isFav,
                  isAdmin: isAdmin,
                  onTap: () => onBookTap(book),
                  onFavoriteToggle: () async {
                    try {
                      final service = ref.read(firestoreServiceProvider);
                      final currentUser = ref.read(authServiceProvider).currentUser;
      if (currentUser != null) {
        await service.toggleFavorite(currentUser.uid, book.id as String);
      }
                    } catch (_) {}
                  },
                  onEdit: isAdmin
                      ? () => showDialog(
                            context: context,
                            builder: (ctx) => _AddEditBookDialog(
                              subjectId: subjectId,
                              categoryId: categoryId,
                              isDark: isDark,
                              book: book,
                            ),
                          )
                      : null,
                  onDelete: isAdmin
                      ? () => showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: const Text('Delete Book?'),
                              content: Text(
                                  'Remove "${book.title}" from this category?'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(ctx).pop(),
                                  child: const Text('Cancel'),
                                ),
                                ElevatedButton(
                                  onPressed: () async {
                                    Navigator.of(ctx).pop();
                                    try {
                                      final service =
                                          ref.read(firestoreServiceProvider);
                                      await service.deleteBook(
                                        subjectId: subjectId,
                                        categoryKey: categoryId,
                                        bookId: book.id as String,
                                      );
                                    } catch (_) {}
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.error,
                                    foregroundColor: Colors.white,
                                  ),
                                  child: const Text('Delete'),
                                ),
                              ],
                            ),
                          )
                      : null,
                );
              },
              childCount: books.length,
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Empty Category State
// ---------------------------------------------------------------------------
class _EmptyCategoryState extends ConsumerWidget {
  const _EmptyCategoryState({
    required this.category,
    required this.isAdmin,
    required this.accentColor,
    required this.subjectId,
    required this.isDark,
  });

  final _BookCategory category;
  final bool isAdmin;
  final Color accentColor;
  final String subjectId;
  final bool isDark;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              category.icon,
              size: 72,
              color: isDark
                  ? AppColors.dark.onSurfaceVariant
                  : AppColors.light.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'No ${category.label} yet',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              isAdmin
                  ? 'Tap "Add Book" to start adding ${category.label.toLowerCase()} for this subject.'
                  : '${category.label} for this subject will appear here once added.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: isDark
                    ? AppColors.dark.onSurfaceVariant
                    : AppColors.light.onSurfaceVariant,
              ),
            ),
            if (isAdmin) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => showDialog(
                  context: context,
                  builder: (ctx) => _AddEditBookDialog(
                    subjectId: subjectId,
                    categoryId: category.id,
                    isDark: isDark,
                  ),
                ),
                icon: const Icon(Icons.add_rounded),
                label: const Text('Add Book'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Add / Edit Book Dialog
// ---------------------------------------------------------------------------
class _AddEditBookDialog extends ConsumerStatefulWidget {
  const _AddEditBookDialog({
    required this.subjectId,
    required this.categoryId,
    required this.isDark,
    this.book,
  });

  final String subjectId;
  final String categoryId;
  final bool isDark;
  final dynamic book;

  @override
  ConsumerState<_AddEditBookDialog> createState() => _AddEditBookDialogState();
}

class _AddEditBookDialogState extends ConsumerState<_AddEditBookDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleCtrl;
  late final TextEditingController _authorCtrl;
  late final TextEditingController _urlCtrl;
  late final TextEditingController _coverCtrl;
  late final TextEditingController _editionCtrl;
  bool _isMultiPart = false;
  bool _isLoading = false;

  // Multi-part controllers
  final List<Map<String, TextEditingController>> _partControllers = [];

  bool get _isEditing => widget.book != null;

  @override
  void initState() {
    super.initState();
    final b = widget.book;
    _titleCtrl = TextEditingController(text: b?.title as String? ?? '');
    _authorCtrl = TextEditingController(text: b?.author as String? ?? '');
    _urlCtrl =
        TextEditingController(text: b?.downloadUrl as String? ?? '');
    _coverCtrl = TextEditingController(text: b?.coverUrl as String? ?? '');
    _editionCtrl =
        TextEditingController(text: b?.edition as String? ?? '');

    final parts = b?.parts as List?;
    if (parts != null && parts.isNotEmpty) {
      _isMultiPart = true;
      for (final p in parts) {
        _partControllers.add({
          'title': TextEditingController(text: p['title'] as String? ?? ''),
          'url': TextEditingController(text: p['url'] as String? ?? ''),
        });
      }
    }
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _authorCtrl.dispose();
    _urlCtrl.dispose();
    _coverCtrl.dispose();
    _editionCtrl.dispose();
    for (final p in _partControllers) {
      p['title']?.dispose();
      p['url']?.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      final service = ref.read(firestoreServiceProvider);
      final parts = _isMultiPart
          ? _partControllers
              .map((p) => {
                    'title': p['title']!.text.trim(),
                    'url': p['url']!.text.trim(),
                  })
              .toList()
          : <Map<String, String>>[];

      final book = Book(
        id: _isEditing ? widget.book.id : DateTime.now().millisecondsSinceEpoch.toString(),
        title: _titleCtrl.text.trim(),
        author: _authorCtrl.text.trim(),
        coverColor: 'bg-indigo-600',
        coverUrl: _coverCtrl.text.trim().isNotEmpty ? _coverCtrl.text.trim() : null,
        type: BookType.textbook,
        downloadUrl: _isMultiPart ? '' : _urlCtrl.text.trim(),
        parts: parts.map((p) => BookPart(
          id: DateTime.now().millisecondsSinceEpoch.toString() + '_' + parts.indexOf(p).toString(),
          title: p['title']!,
          downloadUrl: p['url']!,
        )).toList(),
      );

      if (_isEditing) {
        await service.updateBook(
          subjectId: widget.subjectId,
          categoryKey: widget.categoryId,
          updatedBook: book,
        );
      } else {
        await service.addBook(
          subjectId: widget.subjectId,
          categoryKey: widget.categoryId,
          book: book,
        );
      }
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
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
    final isDark = widget.isDark;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: isDark ? AppColors.dark.surface : Colors.white,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520, maxHeight: 640),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryDark],
                ),
                borderRadius:
                    BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  Icon(
                    _isEditing ? Icons.edit_rounded : Icons.add_rounded,
                    color: Colors.white,
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    _isEditing ? 'Edit Book' : 'Add Book',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close_rounded,
                        color: Colors.white, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            // Form
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _field(
                        label: 'Title *',
                        controller: _titleCtrl,
                        hint: 'Book title',
                        isDark: isDark,
                        validator: (v) =>
                            v == null || v.trim().isEmpty ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      _field(
                        label: 'Author',
                        controller: _authorCtrl,
                        hint: 'Author name',
                        isDark: isDark,
                      ),
                      const SizedBox(height: 12),
                      _field(
                        label: 'Edition',
                        controller: _editionCtrl,
                        hint: 'e.g. 3rd Edition',
                        isDark: isDark,
                      ),
                      const SizedBox(height: 12),
                      _field(
                        label: 'Cover Image URL',
                        controller: _coverCtrl,
                        hint: 'https://...',
                        isDark: isDark,
                      ),
                      const SizedBox(height: 16),
                      // Multi-part toggle
                      Row(
                        children: [
                          Switch.adaptive(
                            value: _isMultiPart,
                            activeColor: AppColors.primary,
                            onChanged: (val) {
                              setState(() {
                                _isMultiPart = val;
                                if (val && _partControllers.isEmpty) {
                                  _addPart();
                                }
                              });
                            },
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Multi-part book',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (!_isMultiPart) ...[
                        _field(
                          label: 'Download URL *',
                          controller: _urlCtrl,
                          hint: 'https://drive.google.com/...',
                          isDark: isDark,
                          validator: (v) =>
                              v == null || v.trim().isEmpty ? 'Required' : null,
                        ),
                      ] else ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Parts',
                              style: theme.textTheme.labelLarge?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextButton.icon(
                              onPressed: _addPart,
                              icon: const Icon(Icons.add_rounded, size: 16),
                              label: const Text('Add Part'),
                              style: TextButton.styleFrom(
                                  foregroundColor: AppColors.primary),
                            ),
                          ],
                        ),
                        ..._partControllers.asMap().entries.map(
                              (entry) => _PartEditor(
                                index: entry.key,
                                controllers: entry.value,
                                isDark: isDark,
                                onRemove: () => setState(
                                    () => _removePart(entry.key)),
                              ),
                            ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
            // Actions
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed:
                        _isLoading ? null : () => Navigator.of(context).pop(),
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
                        : Text(_isEditing ? 'Save Changes' : 'Add Book'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _addPart() {
    setState(() {
      _partControllers.add({
        'title': TextEditingController(),
        'url': TextEditingController(),
      });
    });
  }

  void _removePart(int index) {
    _partControllers[index]['title']?.dispose();
    _partControllers[index]['url']?.dispose();
    _partControllers.removeAt(index);
  }

  Widget _field({
    required String label,
    required TextEditingController controller,
    required String hint,
    required bool isDark,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
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
              fontSize: 13,
            ),
            filled: true,
            fillColor: isDark ? AppColors.dark.card : AppColors.light.surfaceVariant,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color:
                    isDark ? AppColors.dark.outline : AppColors.light.outline,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide:
                  const BorderSide(color: AppColors.primary, width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide:
                  const BorderSide(color: AppColors.error, width: 1.5),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Part Editor row
// ---------------------------------------------------------------------------
class _PartEditor extends StatelessWidget {
  const _PartEditor({
    required this.index,
    required this.controllers,
    required this.isDark,
    required this.onRemove,
  });

  final int index;
  final Map<String, TextEditingController> controllers;
  final bool isDark;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.dark.card.withOpacity(0.5)
            : AppColors.light.surfaceVariant,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDark ? AppColors.dark.outline : AppColors.light.outline,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Part ${index + 1}',
                style: TextStyle(
                  color: isDark ? AppColors.dark.onSurface : AppColors.light.onSurface,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.remove_circle_outline_rounded,
                    size: 18, color: AppColors.error),
                onPressed: onRemove,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: controllers['title'],
            style: TextStyle(
              color: isDark ? AppColors.dark.onSurface : AppColors.light.onSurface,
              fontSize: 13,
            ),
            decoration: _inputDec(
              hint: 'Part title, e.g. Part 1 – Upper Limb',
              isDark: isDark,
            ),
            validator: (v) =>
                v == null || v.trim().isEmpty ? 'Title required' : null,
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: controllers['url'],
            style: TextStyle(
              color: isDark ? AppColors.dark.onSurface : AppColors.light.onSurface,
              fontSize: 13,
            ),
            decoration:
                _inputDec(hint: 'Download URL', isDark: isDark),
            validator: (v) =>
                v == null || v.trim().isEmpty ? 'URL required' : null,
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDec({required String hint, required bool isDark}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(
        color: isDark
            ? AppColors.dark.onSurfaceVariant
            : AppColors.light.onSurfaceVariant,
        fontSize: 12,
      ),
      filled: true,
      fillColor: isDark ? AppColors.dark.background : Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(
          color: isDark ? AppColors.dark.outline : AppColors.light.outline,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: AppColors.error, width: 1.5),
      ),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
    );
  }
}

// ---------------------------------------------------------------------------
// Edit Subject Dialog
// ---------------------------------------------------------------------------
class _EditSubjectDialog extends ConsumerStatefulWidget {
  const _EditSubjectDialog({required this.subject});
  final dynamic subject;

  @override
  ConsumerState<_EditSubjectDialog> createState() =>
      _EditSubjectDialogState();
}

class _EditSubjectDialogState extends ConsumerState<_EditSubjectDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _descCtrl;
  late String _year;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(
        text: widget.subject.name as String? ?? '');
    _descCtrl = TextEditingController(
        text: widget.subject.description as String? ?? '');
    final y = widget.subject.years.isNotEmpty ? widget.subject.years.first : 1;
    _year = '$y${y == 1 ? "st" : y == 2 ? "nd" : y == 3 ? "rd" : "th"} Year';
    if (!_yearFilters.contains(_year)) _year = '1st Year';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      final service = ref.read(firestoreServiceProvider);
      await service.updateSubject(
        subjectId: widget.subject.id as String,
        name: _nameCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        years: [int.tryParse(_year.substring(0, 1)) ?? 1],
      );
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
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
                Text(
                  'Edit Subject',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _nameCtrl,
                  decoration: _dec('Subject Name', isDark),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _descCtrl,
                  maxLines: 3,
                  decoration: _dec('Description', isDark),
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  value: _year,
                  decoration: _dec('Year', isDark),
                  dropdownColor: isDark ? AppColors.dark.card : Colors.white,
                  items: _yearFilters
                      .where((y) => y != 'All')
                      .map((y) => DropdownMenuItem(value: y, child: Text(y)))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setState(() => _year = v);
                  },
                ),
                const SizedBox(height: 24),
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
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Save'),
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

  InputDecoration _dec(String label, bool isDark) => InputDecoration(
        labelText: label,
        filled: true,
        fillColor: isDark ? AppColors.dark.card : AppColors.light.surfaceVariant,
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
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      );
}

// ---------------------------------------------------------------------------
// Helper: year filters constant (reused from library_screen, but local copy)
// ---------------------------------------------------------------------------
const List<String> _yearFilters = [
  'All',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
];
