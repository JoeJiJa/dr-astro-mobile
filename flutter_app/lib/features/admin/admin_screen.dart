import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/subjects_provider.dart';
import '../../core/providers/theme_provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/firestore_service.dart';
import '../../core/models/subject.dart';
import '../../core/theme/app_colors.dart';
import '../../ui/widgets/loading_shimmer.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

class AdminScreen extends ConsumerStatefulWidget {
  const AdminScreen({super.key});

  @override
  ConsumerState<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends ConsumerState<AdminScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedSubjectId = '';
  String _selectedSectionType = 'examSections';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentUser = ref.watch(currentUserProvider);

    return currentUser.when(
      data: (user) {
        if (user == null || !user.isAdmin) {
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.lock_rounded, size: 64, color: AppColors.error),
                  const SizedBox(height: 16),
                  Text(
                    'Access Denied',
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'You do not have admin privileges.',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: isDark
                          ? AppColors.dark.onSurfaceVariant
                          : AppColors.light.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => context.go('/home'),
                    child: const Text('Go Home'),
                  ),
                ],
              ),
            ),
          );
        }

        return Scaffold(
          backgroundColor:
              isDark ? AppColors.dark.background : AppColors.light.background,
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: () => context.pop(),
            ),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.admin_panel_settings_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Admin Panel',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
            bottom: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Books'),
                Tab(text: 'Sections'),
                Tab(text: 'Users'),
                Tab(text: 'Audit Logs'),
              ],
              labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
              indicatorColor: AppColors.primary,
              labelColor: AppColors.primary,
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              _BooksAdminTab(),
              _SectionsAdminTab(),
              _UsersAdminTab(),
              const _AuditLogsAdminTab(),
            ],
          ),
        );
      },
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        body: Center(child: Text('Error: $e')),
      ),
    );
  }
}

// ─── BOOKS TAB ────────────────────────────────────────────────────────────────

class _BooksAdminTab extends ConsumerStatefulWidget {
  @override
  ConsumerState<_BooksAdminTab> createState() => _BooksAdminTabState();
}

class _BooksAdminTabState extends ConsumerState<_BooksAdminTab> {
  Subject? _selectedSubject;
  String _selectedCategory = 'textbooks';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final subjectsAsync = ref.watch(subjectsStreamProvider);

    return subjectsAsync.when(
      data: (subjects) {
        return Row(
          children: [
            // Subject list sidebar
            SizedBox(
              width: 200,
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.dark.surface : Colors.white,
                  border: Border(
                    right: BorderSide(
                        color: (isDark
                                ? AppColors.dark.outline
                                : AppColors.light.outline)
                            .withOpacity(0.15)),
                  ),
                ),
                child: ListView.separated(
                  itemCount: subjects.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, i) {
                    final subject = subjects[i];
                    final isSelected = _selectedSubject?.id == subject.id;
                    return ListTile(
                      dense: true,
                      selected: isSelected,
                      selectedColor: AppColors.primary,
                      selectedTileColor: AppColors.primary.withOpacity(0.08),
                      title: Text(
                        subject.name,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                      onTap: () => setState(() => _selectedSubject = subject),
                    );
                  },
                ),
              ),
            ),

            // Book editing area
            Expanded(
              child: _selectedSubject == null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.touch_app_rounded,
                              size: 48,
                              color: isDark
                                  ? AppColors.dark.onSurfaceVariant
                                  : AppColors.light.onSurfaceVariant),
                          const SizedBox(height: 16),
                          Text(
                            'Select a subject to manage its books',
                            style: GoogleFonts.inter(
                              color: isDark
                                  ? AppColors.dark.onSurfaceVariant
                                  : AppColors.light.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    )
                  : _SubjectBooksEditor(subject: _selectedSubject!),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}

class _SubjectBooksEditor extends ConsumerStatefulWidget {
  final Subject subject;

  const _SubjectBooksEditor({required this.subject});

  @override
  ConsumerState<_SubjectBooksEditor> createState() => _SubjectBooksEditorState();
}

class _SubjectBooksEditorState extends ConsumerState<_SubjectBooksEditor> {
  String? _selectedCategory;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final categories = widget.subject.materials.allCategories;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Category chips
        Container(
          padding: const EdgeInsets.all(12),
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: categories.map((e) {
              final isSelected = _selectedCategory == e.key;
              return FilterChip(
                selected: isSelected,
                label: Text(
                  '${e.key} (${e.value.length})',
                  style: GoogleFonts.inter(fontSize: 12),
                ),
                onSelected: (_) => setState(() => _selectedCategory = e.key),
                selectedColor: AppColors.primary.withOpacity(0.15),
                checkmarkColor: AppColors.primary,
              );
            }).toList(),
          ),
        ),

        // Add book button
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: ElevatedButton.icon(
            onPressed: _selectedCategory != null
                ? () => _showAddBookDialog(context)
                : null,
            icon: const Icon(Icons.add_rounded, size: 16),
            label: Text(
              _selectedCategory != null
                  ? 'Add Book to $_selectedCategory'
                  : 'Select a category first',
              style: GoogleFonts.inter(fontSize: 13),
            ),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(0, 40),
              backgroundColor: AppColors.primary,
            ),
          ),
        ),

        const SizedBox(height: 12),

        // Book list
        Expanded(
          child: _selectedCategory == null
              ? const Center(child: Text('Select a category'))
              : _buildBookList(categories),
        ),
      ],
    );
  }

  Widget _buildBookList(List<MapEntry<String, List<Book>>> categories) {
    final entry = categories.firstWhere(
      (e) => e.key == _selectedCategory,
      orElse: () => MapEntry(_selectedCategory!, []),
    );

    if (entry.value.isEmpty) {
      return const Center(child: Text('No books in this category'));
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: entry.value.length,
      itemBuilder: (context, i) {
        final book = entry.value[i];
        return _BookListTile(
          book: book,
          onEdit: () => _showEditBookDialog(context, book),
          onDelete: () => _confirmDelete(context, book),
        );
      },
    );
  }

  void _showAddBookDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => _BookFormDialog(
        subjectId: widget.subject.id,
        categoryKey: _selectedCategory!,
        existingBook: null,
      ),
    );
  }

  void _showEditBookDialog(BuildContext context, Book book) {
    showDialog(
      context: context,
      builder: (_) => _BookFormDialog(
        subjectId: widget.subject.id,
        categoryKey: _selectedCategory!,
        existingBook: book,
      ),
    );
  }

  void _confirmDelete(BuildContext context, Book book) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Book'),
        content: Text('Are you sure you want to delete "${book.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ref.read(firestoreServiceProvider).deleteBook(
                      subjectId: widget.subject.id,
                      categoryKey: _selectedCategory!,
                      bookId: book.id,
                    );
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Book deleted')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class _BookListTile extends StatelessWidget {
  final Book book;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _BookListTile({
    required this.book,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark.card : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: (isDark ? AppColors.dark.outline : AppColors.light.outline)
              .withOpacity(0.15),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(Icons.menu_book_rounded, color: AppColors.primary, size: 20),
        ),
        title: Text(
          book.title,
          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          book.author,
          style: GoogleFonts.inter(fontSize: 11),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.edit_rounded, size: 18, color: AppColors.primary),
              onPressed: onEdit,
            ),
            IconButton(
              icon: const Icon(Icons.delete_rounded, size: 18, color: AppColors.error),
              onPressed: onDelete,
            ),
          ],
        ),
      ),
    );
  }
}

class _BookFormDialog extends ConsumerStatefulWidget {
  final String subjectId;
  final String categoryKey;
  final Book? existingBook;

  const _BookFormDialog({
    required this.subjectId,
    required this.categoryKey,
    this.existingBook,
  });

  @override
  ConsumerState<_BookFormDialog> createState() => _BookFormDialogState();
}

class _BookFormDialogState extends ConsumerState<_BookFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleCtrl;
  late TextEditingController _authorCtrl;
  late TextEditingController _downloadUrlCtrl;
  late TextEditingController _coverUrlCtrl;
  late TextEditingController _descriptionCtrl;
  BookType _bookType = BookType.textbook;
  RecommendationLevel _recommendLevel = RecommendationLevel.none;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final b = widget.existingBook;
    _titleCtrl = TextEditingController(text: b?.title ?? '');
    _authorCtrl = TextEditingController(text: b?.author ?? '');
    _downloadUrlCtrl = TextEditingController(text: b?.downloadUrl ?? '');
    _coverUrlCtrl = TextEditingController(text: b?.coverUrl ?? '');
    _descriptionCtrl = TextEditingController(text: b?.description ?? '');
    _bookType = b?.type ?? BookType.textbook;
    _recommendLevel = b?.recommendationLevel ?? RecommendationLevel.none;
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _authorCtrl.dispose();
    _downloadUrlCtrl.dispose();
    _coverUrlCtrl.dispose();
    _descriptionCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.existingBook != null;
    return AlertDialog(
      title: Text(
        isEdit ? 'Edit Book' : 'Add New Book',
        style: GoogleFonts.inter(fontWeight: FontWeight.w700),
      ),
      content: SizedBox(
        width: 500,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: _titleCtrl,
                  decoration: const InputDecoration(labelText: 'Book Title *'),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _authorCtrl,
                  decoration: const InputDecoration(labelText: 'Author / Edition'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _downloadUrlCtrl,
                  decoration: const InputDecoration(labelText: 'Download / Access URL *'),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _coverUrlCtrl,
                  decoration: const InputDecoration(labelText: 'Cover Image URL'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<BookType>(
                  value: _bookType,
                  decoration: const InputDecoration(labelText: 'Book Type'),
                  items: BookType.values.map((t) {
                    return DropdownMenuItem(value: t, child: Text(t.name));
                  }).toList(),
                  onChanged: (v) => setState(() => _bookType = v!),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<RecommendationLevel>(
                  value: _recommendLevel,
                  decoration: const InputDecoration(labelText: 'Recommendation'),
                  items: RecommendationLevel.values.map((r) {
                    return DropdownMenuItem(value: r, child: Text(r.name));
                  }).toList(),
                  onChanged: (v) => setState(() => _recommendLevel = v!),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _descriptionCtrl,
                  decoration: const InputDecoration(labelText: 'Description (Markdown)'),
                  maxLines: 3,
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isSaving ? null : _save,
          child: _isSaving
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : Text(isEdit ? 'Save Changes' : 'Add Book'),
        ),
      ],
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final book = Book(
      id: widget.existingBook?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
      title: _titleCtrl.text.trim(),
      author: _authorCtrl.text.trim(),
      coverColor: widget.existingBook?.coverColor ?? 'bg-indigo-600',
      coverUrl: _coverUrlCtrl.text.trim().isNotEmpty ? _coverUrlCtrl.text.trim() : null,
      type: _bookType,
      downloadUrl: _downloadUrlCtrl.text.trim(),
      recommendationLevel: _recommendLevel,
      description: _descriptionCtrl.text.trim().isNotEmpty ? _descriptionCtrl.text.trim() : null,
    );

    try {
      final service = ref.read(firestoreServiceProvider);
      if (widget.existingBook != null) {
        await service.updateBook(
          subjectId: widget.subjectId,
          categoryKey: widget.categoryKey,
          updatedBook: book,
        );
      } else {
        await service.addBook(
          subjectId: widget.subjectId,
          categoryKey: widget.categoryKey,
          book: book,
        );
      }
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(widget.existingBook != null ? 'Book updated!' : 'Book added!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }
}

// ─── SECTIONS TAB ─────────────────────────────────────────────────────────────

class _SectionsAdminTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subjects = ref.watch(subjectsStreamProvider);

    return subjects.when(
      data: (list) => ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: list.length,
        itemBuilder: (context, i) {
          final subject = list[i];
          return _SubjectSectionCard(subject: subject);
        },
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}

class _SubjectSectionCard extends ConsumerWidget {
  final Subject subject;

  const _SubjectSectionCard({required this.subject});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark.card : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: (isDark ? AppColors.dark.outline : AppColors.light.outline).withOpacity(0.15),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            subject.name,
            style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 16),
          ),
          const SizedBox(height: 12),
          Text('Exam Sections (${subject.examSections.length})',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.primary)),
          ...subject.examSections.map((s) => _SectionTile(
                section: s,
                subjectId: subject.id,
                sectionType: 'examSections',
              )),
          TextButton.icon(
            onPressed: () => _addSection(context, ref, subject.id, 'examSections'),
            icon: const Icon(Icons.add_rounded, size: 16),
            label: const Text('Add Exam Section'),
          ),
          const Divider(),
          Text('Practical Sections (${subject.practicalSections.length})',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.success)),
          ...subject.practicalSections.map((s) => _SectionTile(
                section: s,
                subjectId: subject.id,
                sectionType: 'practicalSections',
              )),
          TextButton.icon(
            onPressed: () => _addSection(context, ref, subject.id, 'practicalSections'),
            icon: const Icon(Icons.add_rounded, size: 16),
            label: const Text('Add Practical Section'),
          ),
        ],
      ),
    );
  }

  void _addSection(BuildContext context, WidgetRef ref, String subjectId, String sectionType) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Add ${sectionType == 'examSections' ? 'Exam' : 'Practical'} Section'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(labelText: 'Section Name'),
          autofocus: true,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (ctrl.text.trim().isEmpty) return;
              final section = SubjectSection(
                id: DateTime.now().millisecondsSinceEpoch.toString(),
                label: ctrl.text.trim(),
              );
              await ref.read(firestoreServiceProvider).addSection(
                    subjectId: subjectId,
                    sectionType: sectionType,
                    section: section,
                  );
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}

class _SectionTile extends ConsumerWidget {
  final SubjectSection section;
  final String subjectId;
  final String sectionType;

  const _SectionTile({
    required this.section,
    required this.subjectId,
    required this.sectionType,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListTile(
      dense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 0, vertical: 0),
      leading: Icon(
        sectionType == 'examSections' ? Icons.school_rounded : Icons.science_rounded,
        size: 16,
        color: sectionType == 'examSections' ? AppColors.primary : AppColors.success,
      ),
      title: Text(section.label, style: GoogleFonts.inter(fontSize: 13)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.edit_rounded, size: 14),
            onPressed: () => _renameSection(context, ref),
          ),
          IconButton(
            icon: const Icon(Icons.delete_rounded, size: 14, color: AppColors.error),
            onPressed: () => _removeSection(context, ref),
          ),
        ],
      ),
    );
  }

  void _renameSection(BuildContext context, WidgetRef ref) {
    final ctrl = TextEditingController(text: section.label);
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Rename Section'),
        content: TextField(controller: ctrl, decoration: const InputDecoration(labelText: 'New Name')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (ctrl.text.trim().isEmpty) return;
              await ref.read(firestoreServiceProvider).renameSection(
                    subjectId: subjectId,
                    sectionType: sectionType,
                    sectionId: section.id,
                    newLabel: ctrl.text.trim(),
                  );
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Rename'),
          ),
        ],
      ),
    );
  }

  void _removeSection(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Remove Section'),
        content: Text('Delete section "${section.label}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () async {
              await ref.read(firestoreServiceProvider).removeSection(
                    subjectId: subjectId,
                    sectionType: sectionType,
                    sectionId: section.id,
                  );
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────

class _UsersAdminTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final service = ref.read(firestoreServiceProvider);

    return FutureBuilder(
      future: service.getAllUsers(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        final users = snapshot.data ?? [];
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: users.length,
          itemBuilder: (context, i) {
            final user = users[i];
            final isDark = Theme.of(context).brightness == Brightness.dark;
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.dark.card : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: (isDark ? AppColors.dark.outline : AppColors.light.outline)
                        .withOpacity(0.15)),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primary.withOpacity(0.15),
                    backgroundImage:
                        user.avatarUrl != null ? NetworkImage(user.avatarUrl!) : null,
                    child: user.avatarUrl == null
                        ? Text(user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                            style: const TextStyle(
                                color: AppColors.primary, fontWeight: FontWeight.w700))
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user.name,
                            style:
                                GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13)),
                        Text(user.email,
                            style: GoogleFonts.inter(
                                fontSize: 11,
                                color: isDark
                                    ? AppColors.dark.onSurfaceVariant
                                    : AppColors.light.onSurfaceVariant)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: user.isAdmin
                          ? AppColors.error.withOpacity(0.15)
                          : AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      user.isAdmin ? 'Admin' : 'User',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: user.isAdmin ? AppColors.error : AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

// ─── AUDIT LOGS TAB ──────────────────────────────────────────────────────────

class _AuditLogsAdminTab extends ConsumerStatefulWidget {
  const _AuditLogsAdminTab();

  @override
  ConsumerState<_AuditLogsAdminTab> createState() => _AuditLogsAdminTabState();
}

class _AuditLogsAdminTabState extends ConsumerState<_AuditLogsAdminTab> {
  String _filterAction = 'all';
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final firestoreService = ref.read(firestoreServiceProvider);

    return Column(
      children: [
        // Filters and Search bar
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? AppColors.dark.surface : Colors.white,
            border: Border(
              bottom: BorderSide(
                color: (isDark ? AppColors.dark.outline : AppColors.light.outline).withOpacity(0.1),
              ),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Input
              TextField(
                controller: _searchCtrl,
                onChanged: (_) => setState(() {}),
                style: GoogleFonts.inter(fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'Search audit details or admin email...',
                  hintStyle: GoogleFonts.inter(fontSize: 13),
                  prefixIcon: const Icon(Icons.search_rounded, size: 20),
                  contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  isDense: true,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: (isDark ? AppColors.dark.outline : AppColors.light.outline).withOpacity(0.2),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              // Action Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _filterChip('all', 'All Actions'),
                    _filterChip('book_added', 'Book Added'),
                    _filterChip('book_edited', 'Book Edited'),
                    _filterChip('book_deleted', 'Book Deleted'),
                    _filterChip('section_added', 'Section Added'),
                    _filterChip('section_removed', 'Section Removed'),
                    _filterChip('section_renamed', 'Section Renamed'),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Logs Stream list
        Expanded(
          child: StreamBuilder<List<Map<String, dynamic>>>(
            stream: firestoreService.watchAdminAuditLogs(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return Center(child: Text('Error loading audit logs: ${snapshot.error}'));
              }
              
              final rawLogs = snapshot.data ?? [];
              final searchQuery = _searchCtrl.text.toLowerCase().trim();

              final logs = rawLogs.where((log) {
                final action = log['action'] ?? '';
                final details = (log['details'] ?? '').toString().toLowerCase();
                final adminEmail = (log['adminEmail'] ?? '').toString().toLowerCase();
                
                final matchesAction = _filterAction == 'all' || action == _filterAction;
                final matchesSearch = searchQuery.isEmpty ||
                    details.contains(searchQuery) ||
                    adminEmail.contains(searchQuery);

                return matchesAction && matchesSearch;
              }).toList();

              if (logs.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.history_rounded, size: 48, color: Colors.grey.withOpacity(0.5)),
                      const SizedBox(height: 16),
                      Text(
                        'No audit logs found',
                        style: GoogleFonts.inter(color: Colors.grey),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: logs.length,
                itemBuilder: (context, index) {
                  final log = logs[index];
                  final timestampStr = log['timestamp'] as String?;
                  String formattedTime = 'Unknown Time';
                  if (timestampStr != null) {
                    try {
                      final dt = DateTime.parse(timestampStr).toLocal();
                      formattedTime = DateFormat('MMM d, h:mm a').format(dt);
                    } catch (_) {}
                  }

                  final action = log['action'] ?? 'unknown';
                  final details = log['details'] ?? '';
                  final adminEmail = log['adminEmail'] ?? 'unknown-admin';
                  final canRevert = action != 'revert_action' && log['payload'] != null;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.dark.card : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: (isDark ? AppColors.dark.outline : AppColors.light.outline).withOpacity(0.1),
                      ),
                    ),
                    child: ListTile(
                      dense: true,
                      leading: _actionIcon(action),
                      title: Text(
                        details,
                        style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.person_rounded, size: 12, color: Colors.grey.shade500),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  adminEmail,
                                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey.shade500),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          if (log['targetSubjectId'] != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              'Subject: ${log['targetSubjectId']}',
                              style: GoogleFonts.inter(fontSize: 10, color: Colors.grey.shade400, fontStyle: FontStyle.italic),
                            ),
                          ],
                        ],
                      ),
                      trailing: canRevert
                          ? Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  formattedTime,
                                  style: GoogleFonts.inter(fontSize: 10, color: Colors.grey),
                                ),
                                const SizedBox(width: 8),
                                Tooltip(
                                  message: 'Revert change',
                                  child: InkWell(
                                    onTap: () => _confirmRevert(context, log),
                                    borderRadius: BorderRadius.circular(4),
                                    child: Container(
                                      padding: const EdgeInsets.all(4),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Icon(Icons.undo_rounded, size: 14, color: AppColors.primary),
                                    ),
                                  ),
                                ),
                              ],
                            )
                          : Text(
                              formattedTime,
                              style: GoogleFonts.inter(fontSize: 10, color: Colors.grey),
                            ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  void _confirmRevert(BuildContext context, Map<String, dynamic> log) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Revert Action'),
        content: Text('Are you sure you want to revert this change?\n"${log['details'] ?? ''}"'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Reverting change...'),
                  duration: Duration(seconds: 1),
                ),
              );
              try {
                await ref.read(firestoreServiceProvider).revertAdminAction(log);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Change reverted successfully ✓'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to revert: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            child: const Text('Revert'),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String action, String label) {
    final isSelected = _filterAction == action;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        selected: isSelected,
        label: Text(label, style: GoogleFonts.inter(fontSize: 11)),
        onSelected: (_) => setState(() => _filterAction = action),
        selectedColor: AppColors.primary.withOpacity(0.15),
        checkmarkColor: AppColors.primary,
        padding: EdgeInsets.zero,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }

  Widget _actionIcon(String action) {
    Color color = Colors.grey;
    IconData icon = Icons.info_outline_rounded;

    if (action.contains('added')) {
      color = AppColors.success;
      icon = Icons.add_circle_outline_rounded;
    } else if (action.contains('edited') || action.contains('renamed')) {
      color = AppColors.primary;
      icon = Icons.edit_note_rounded;
    } else if (action.contains('deleted') || action.contains('removed')) {
      color = AppColors.error;
      icon = Icons.delete_outline_rounded;
    }

    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: color, size: 18),
    );
  }
}
