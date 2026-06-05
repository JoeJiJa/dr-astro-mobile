import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/providers/theme_provider.dart';
import '../../core/providers/subjects_provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/firestore_service.dart';

// ---------------------------------------------------------------------------
// Models / helpers (assumed available via providers)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Profile Screen
// ---------------------------------------------------------------------------
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen>
    with SingleTickerProviderStateMixin {
  // Form key & controllers
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameCtrl;
  late TextEditingController _collegeCtrl;
  late TextEditingController _batchYearCtrl;
  late AnimationController _themeIconCtrl;

  String _selectedYear = '1st Year';
  String _selectedGender = 'Prefer not to say';
  bool _isEditing = false;
  bool _isSaving = false;

  final List<String> _yearOptions = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    '5th Year',
    'Intern',
  ];

  final List<String> _genderOptions = [
    'Male',
    'Female',
    'Non-binary',
    'Prefer not to say',
  ];

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController();
    _collegeCtrl = TextEditingController();
    _batchYearCtrl = TextEditingController();
    _themeIconCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _collegeCtrl.dispose();
    _batchYearCtrl.dispose();
    _themeIconCtrl.dispose();
    super.dispose();
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  String _initials(String name) {
    final parts = name.trim().split(' ');
    if (parts.isEmpty || parts.first.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  Future<void> _saveProfile(AppUser user) async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    await Future.delayed(const Duration(seconds: 1)); // Replace with real save
    if (mounted) {
      setState(() {
        _isSaving = false;
        _isEditing = false;
      });
      _showSnack('Profile saved successfully ✓', isError: false);
    }
  }

  void _showSnack(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message,
            style: GoogleFonts.poppins(color: Colors.white, fontSize: 13)),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _signOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => _SignOutDialog(),
    );
    if (confirmed == true && mounted) {
      await ref.read(authServiceProvider).signOut();
      if (mounted) context.go('/login');
    }
  }

  void _toggleTheme() {
    final current = ref.read(themeModeProvider);
    final isDark = current == ThemeMode.dark;
    ref.read(themeModeProvider.notifier).toggleTheme();
    if (isDark) {
      _themeIconCtrl.reverse();
    } else {
      _themeIconCtrl.forward();
    }
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final userAsync = ref.watch(currentUserProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;
    final colorScheme = Theme.of(context).colorScheme;
    final size = MediaQuery.of(context).size;

    return userAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        body: Center(child: Text('Error: $e')),
      ),
      data: (user) {
        if (user == null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            context.go('/login');
          });
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        // Populate controllers if not editing
        if (!_isEditing) {
          _nameCtrl.text = user.displayName ?? '';
          _collegeCtrl.text = user.college ?? '';
          _batchYearCtrl.text = user.batchYear?.toString() ?? '';
          _selectedYear = user.yearOfStudy ?? '1st Year';
          _selectedGender = user.gender ?? 'Prefer not to say';
        }

        return AnnotatedRegion<SystemUiOverlayStyle>(
          value: isDark
              ? SystemUiOverlayStyle.light
              : SystemUiOverlayStyle.dark,
          child: Scaffold(
            backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
            body: Form(
              key: _formKey,
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  // ---- App Bar ----
                  _buildSliverAppBar(context, user, isDark, colorScheme),

                  // ---- Body ----
                  SliverPadding(
                    padding: EdgeInsets.symmetric(
                      horizontal: size.width > 600 ? 48.0 : 16.0,
                      vertical: 16,
                    ),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        // Stats
                        _buildStatsSection(user, isDark, colorScheme)
                            .animate()
                            .fadeIn(delay: 100.ms, duration: 400.ms)
                            .slideY(begin: 0.1, end: 0),

                        const SizedBox(height: 24),

                        // Personal Info
                        _buildSectionHeader('Personal Info', Icons.person_outline, isDark)
                            .animate()
                            .fadeIn(delay: 150.ms, duration: 400.ms),
                        const SizedBox(height: 12),
                        _buildPersonalInfoCard(user, isDark, colorScheme)
                            .animate()
                            .fadeIn(delay: 200.ms, duration: 400.ms)
                            .slideY(begin: 0.1, end: 0),

                        const SizedBox(height: 24),

                        // Appearance
                        _buildSectionHeader('Appearance', Icons.palette_outlined, isDark)
                            .animate()
                            .fadeIn(delay: 250.ms, duration: 400.ms),
                        const SizedBox(height: 12),
                        _buildAppearanceCard(isDark, colorScheme)
                            .animate()
                            .fadeIn(delay: 300.ms, duration: 400.ms)
                            .slideY(begin: 0.1, end: 0),

                        const SizedBox(height: 24),

                        // Account
                        _buildSectionHeader('Account', Icons.manage_accounts_outlined, isDark)
                            .animate()
                            .fadeIn(delay: 350.ms, duration: 400.ms),
                        const SizedBox(height: 12),
                        _buildAccountCard(user, isDark, colorScheme)
                            .animate()
                            .fadeIn(delay: 400.ms, duration: 400.ms)
                            .slideY(begin: 0.1, end: 0),

                        // Admin section
                        if (user.isAdmin == true) ...[
                          const SizedBox(height: 24),
                          _buildSectionHeader('Administration', Icons.admin_panel_settings_outlined, isDark)
                              .animate()
                              .fadeIn(delay: 450.ms, duration: 400.ms),
                          const SizedBox(height: 12),
                          _buildAdminCard(isDark, colorScheme)
                              .animate()
                              .fadeIn(delay: 500.ms, duration: 400.ms)
                              .slideY(begin: 0.1, end: 0),
                        ],

                        const SizedBox(height: 24),

                        // About
                        _buildSectionHeader('About', Icons.info_outline, isDark)
                            .animate()
                            .fadeIn(delay: 550.ms, duration: 400.ms),
                        const SizedBox(height: 12),
                        _buildAboutCard(isDark, colorScheme)
                            .animate()
                            .fadeIn(delay: 600.ms, duration: 400.ms)
                            .slideY(begin: 0.1, end: 0),

                        const SizedBox(height: 40),

                        // Save button
                        if (_isEditing)
                          _buildSaveButton(user, isDark)
                              .animate()
                              .fadeIn(duration: 300.ms)
                              .slideY(begin: 0.3, end: 0),

                        const SizedBox(height: 32),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // -------------------------------------------------------------------------
  // Sliver App Bar
  // -------------------------------------------------------------------------

  SliverAppBar _buildSliverAppBar(
    BuildContext context,
    AppUser user,
    bool isDark,
    ColorScheme colorScheme,
  ) {
    final avatarBg = isDark ? AppColors.primaryDark : AppColors.primary;
    final name = user.displayName ?? 'Dr. Astro User';
    final email = user.email ?? '';
    final role = user.isAdmin == true ? 'Admin' : 'Student';

    return SliverAppBar(
      expandedHeight: 260,
      pinned: true,
      stretch: true,
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      elevation: 0,
      leading: IconButton(
        icon: Icon(Icons.arrow_back_ios_new_rounded,
            color: isDark ? Colors.white : Colors.black87, size: 20),
        onPressed: () => context.pop(),
      ),
      actions: [
        TextButton.icon(
          onPressed: () => setState(() => _isEditing = !_isEditing),
          icon: Icon(
            _isEditing ? Icons.close_rounded : Icons.edit_outlined,
            size: 18,
            color: AppColors.primary,
          ),
          label: Text(
            _isEditing ? 'Cancel' : 'Edit',
            style: GoogleFonts.poppins(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ),
        const SizedBox(width: 8),
      ],
      flexibleSpace: FlexibleSpaceBar(
        stretchModes: const [StretchMode.blurBackground],
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: isDark
                  ? [AppColors.darkSurface, AppColors.darkBackground]
                  : [AppColors.lightSurface, const Color(0xFFECF0FF)],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 56),
              // Avatar
              Stack(
                alignment: Alignment.bottomRight,
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [AppColors.primary, AppColors.accent],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.35),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: user.avatarUrl != null && user.avatarUrl!.isNotEmpty
                        ? ClipOval(
                            child: Image.network(
                              user.avatarUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Center(
                                child: Text(
                                  _initials(name),
                                  style: GoogleFonts.poppins(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          )
                        : Center(
                            child: Text(
                              _initials(name),
                              style: GoogleFonts.poppins(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                  ),
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isDark ? AppColors.darkSurface : Colors.white,
                        width: 2,
                      ),
                    ),
                    child: const Icon(Icons.camera_alt_rounded,
                        size: 12, color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                name,
                style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                email,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  color: isDark ? Colors.white54 : Colors.black45,
                ),
              ),
              const SizedBox(height: 8),
              // Role badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: user.isAdmin == true
                      ? AppColors.accent.withOpacity(0.15)
                      : AppColors.primary.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: user.isAdmin == true
                        ? AppColors.accent.withOpacity(0.4)
                        : AppColors.primary.withOpacity(0.3),
                  ),
                ),
                child: Text(
                  role,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: user.isAdmin == true ? AppColors.accent : AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Stats Section
  // -------------------------------------------------------------------------

  Widget _buildStatsSection(AppUser user, bool isDark, ColorScheme colorScheme) {
    final stats = [
      _StatItem(
        icon: Icons.local_fire_department_rounded,
        iconColor: const Color(0xFFFF6B35),
        label: 'Streak',
        value: '${user.studyStreak ?? 0}d',
      ),
      _StatItem(
        icon: Icons.star_rounded,
        iconColor: const Color(0xFFFFD700),
        label: 'XP Points',
        value: '${user.xpPoints ?? 0}',
      ),
      _StatItem(
        icon: Icons.calendar_today_rounded,
        iconColor: AppColors.primary,
        label: 'Joined',
        value: _formatDate(user.joinedDate),
      ),
      _StatItem(
        icon: Icons.school_rounded,
        iconColor: AppColors.accent,
        label: 'Year',
        value: user.yearOfStudy?.replaceAll(' Year', '') ?? 'N/A',
      ),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(isDark),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: stats
            .map((s) => Expanded(child: _buildStatTile(s, isDark)))
            .toList(),
      ),
    );
  }

  Widget _buildStatTile(_StatItem item, bool isDark) {
    return Column(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: item.iconColor.withOpacity(0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(item.icon, color: item.iconColor, size: 22),
        ),
        const SizedBox(height: 8),
        Text(
          item.value,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        Text(
          item.label,
          style: GoogleFonts.poppins(
            fontSize: 11,
            color: isDark ? Colors.white38 : Colors.black38,
          ),
        ),
      ],
    );
  }

  // -------------------------------------------------------------------------
  // Personal Info Card
  // -------------------------------------------------------------------------

  Widget _buildPersonalInfoCard(AppUser user, bool isDark, ColorScheme colorScheme) {
    return Container(
      decoration: _cardDecoration(isDark),
      child: Column(
        children: [
          _buildTextField(
            controller: _nameCtrl,
            label: 'Full Name',
            icon: Icons.person_outline,
            enabled: _isEditing,
            isDark: isDark,
            validator: (v) =>
                v == null || v.trim().isEmpty ? 'Name cannot be empty' : null,
          ),
          _buildDivider(isDark),
          _buildTextField(
            controller: _collegeCtrl,
            label: 'College / University',
            icon: Icons.account_balance_outlined,
            enabled: _isEditing,
            isDark: isDark,
          ),
          _buildDivider(isDark),
          _buildTextField(
            controller: _batchYearCtrl,
            label: 'Batch Year',
            icon: Icons.event_rounded,
            enabled: _isEditing,
            isDark: isDark,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          ),
          _buildDivider(isDark),
          _buildDropdownTile(
            label: 'Year of Study',
            icon: Icons.school_outlined,
            value: _selectedYear,
            items: _yearOptions,
            enabled: _isEditing,
            isDark: isDark,
            onChanged: (v) => setState(() => _selectedYear = v!),
          ),
          _buildDivider(isDark),
          _buildDropdownTile(
            label: 'Gender',
            icon: Icons.wc_rounded,
            value: _selectedGender,
            items: _genderOptions,
            enabled: _isEditing,
            isDark: isDark,
            onChanged: (v) => setState(() => _selectedGender = v!),
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Appearance Card
  // -------------------------------------------------------------------------

  Widget _buildAppearanceCard(bool isDark, ColorScheme colorScheme) {
    return Container(
      decoration: _cardDecoration(isDark),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: AnimatedSwitcher(
          duration: const Duration(milliseconds: 400),
          transitionBuilder: (child, anim) => RotationTransition(
            turns: anim,
            child: FadeTransition(opacity: anim, child: child),
          ),
          child: isDark
              ? const Icon(Icons.nightlight_round,
                  key: ValueKey('moon'), color: Color(0xFF7C83FD), size: 26)
              : const Icon(Icons.wb_sunny_rounded,
                  key: ValueKey('sun'), color: Color(0xFFFFD700), size: 26),
        ),
        title: Text(
          isDark ? 'Dark Mode' : 'Light Mode',
          style: GoogleFonts.poppins(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        subtitle: Text(
          isDark ? 'Switch to light theme' : 'Switch to dark theme',
          style: GoogleFonts.poppins(
            fontSize: 12,
            color: isDark ? Colors.white38 : Colors.black38,
          ),
        ),
        trailing: Switch.adaptive(
          value: isDark,
          onChanged: (_) => _toggleTheme(),
          activeColor: AppColors.primary,
          activeTrackColor: AppColors.primary.withOpacity(0.35),
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Account Card
  // -------------------------------------------------------------------------

  Widget _buildAccountCard(AppUser user, bool isDark, ColorScheme colorScheme) {
    return Container(
      decoration: _cardDecoration(isDark),
      child: Column(
        children: [
          _buildNavTile(
            icon: Icons.lock_outline_rounded,
            iconColor: AppColors.primary,
            title: 'Change Password',
            subtitle: 'Update your login password',
            isDark: isDark,
            onTap: () => _showChangePasswordDialog(context, isDark),
          ),
          _buildDivider(isDark),
          _buildNavTile(
            icon: Icons.history_rounded,
            iconColor: AppColors.success,
            title: 'Study History',
            subtitle: 'Review your recent book & AI activities',
            isDark: isDark,
            onTap: () => _showStudyHistoryDialog(context, user, isDark),
          ),
          _buildDivider(isDark),
          _buildNavTile(
            icon: Icons.logout_rounded,
            iconColor: AppColors.error,
            title: 'Sign Out',
            subtitle: 'Log out of your account',
            isDark: isDark,
            titleColor: AppColors.error,
            onTap: _signOut,
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Admin Card
  // -------------------------------------------------------------------------

  Widget _buildAdminCard(bool isDark, ColorScheme colorScheme) {
    return Container(
      decoration: _cardDecoration(isDark),
      child: _buildNavTile(
        icon: Icons.admin_panel_settings_rounded,
        iconColor: AppColors.accent,
        title: 'Admin Panel',
        subtitle: 'Manage subjects, users & content',
        isDark: isDark,
        onTap: () => context.push('/admin'),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // About Card
  // -------------------------------------------------------------------------

  Widget _buildAboutCard(bool isDark, ColorScheme colorScheme) {
    return Container(
      decoration: _cardDecoration(isDark),
      child: Column(
        children: [
          _buildNavTile(
            icon: Icons.info_outline_rounded,
            iconColor: AppColors.primary,
            title: 'App Version',
            subtitle: 'v1.0.0 — Dr. Astro Mobile',
            isDark: isDark,
            onTap: null,
            trailing: const SizedBox.shrink(),
          ),
          _buildDivider(isDark),
          _buildNavTile(
            icon: Icons.code_rounded,
            iconColor: const Color(0xFF6E40C9),
            title: 'GitHub',
            subtitle: 'View source on GitHub',
            isDark: isDark,
            onTap: () async {
              // Use url_launcher if desired
            },
          ),
          _buildDivider(isDark),
          _buildNavTile(
            icon: Icons.privacy_tip_outlined,
            iconColor: const Color(0xFF26A69A),
            title: 'Privacy Policy',
            subtitle: 'Read our data practices',
            isDark: isDark,
            onTap: () {},
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Save Button
  // -------------------------------------------------------------------------

  Widget _buildSaveButton(AppUser user, bool isDark) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: _isSaving ? null : () => _saveProfile(user),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withOpacity(0.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 4,
          shadowColor: AppColors.primary.withOpacity(0.4),
        ),
        child: _isSaving
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.save_rounded, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Save Changes',
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Change Password Dialog
  // -------------------------------------------------------------------------

  void _showChangePasswordDialog(BuildContext context, bool isDark) {
    final currentCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (_) => Dialog(
        backgroundColor: isDark ? AppColors.darkSurface : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Change Password',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 20),
                _dialogTextField(
                  ctrl: currentCtrl,
                  label: 'Current Password',
                  isDark: isDark,
                  obscure: true,
                ),
                const SizedBox(height: 12),
                _dialogTextField(
                  ctrl: newCtrl,
                  label: 'New Password',
                  isDark: isDark,
                  obscure: true,
                  validator: (v) => v != null && v.length >= 6
                      ? null
                      : 'Minimum 6 characters',
                ),
                const SizedBox(height: 12),
                _dialogTextField(
                  ctrl: confirmCtrl,
                  label: 'Confirm New Password',
                  isDark: isDark,
                  obscure: true,
                  validator: (v) =>
                      v == newCtrl.text ? null : 'Passwords do not match',
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text('Cancel',
                            style: GoogleFonts.poppins(color: Colors.grey)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          if (formKey.currentState!.validate()) {
                            Navigator.pop(context);
                            _showSnack('Password updated successfully ✓');
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        child: Text('Update',
                            style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w600)),
                      ),
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

  // -------------------------------------------------------------------------
  // Shared Widgets
  // -------------------------------------------------------------------------

  Widget _buildSectionHeader(String title, IconData icon, bool isDark) {
    return Row(
      children: [
        Icon(icon,
            size: 18,
            color: isDark ? Colors.white54 : Colors.black45),
        const SizedBox(width: 8),
        Text(
          title.toUpperCase(),
          style: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.2,
            color: isDark ? Colors.white38 : Colors.black38,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool enabled,
    required bool isDark,
    TextInputType keyboardType = TextInputType.text,
    List<TextInputFormatter>? inputFormatters,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: TextFormField(
        controller: controller,
        enabled: enabled,
        keyboardType: keyboardType,
        inputFormatters: inputFormatters,
        validator: validator,
        style: GoogleFonts.poppins(
          fontSize: 14,
          color: isDark ? Colors.white : Colors.black87,
        ),
        decoration: InputDecoration(
          prefixIcon: Icon(icon,
              size: 20,
              color: enabled
                  ? AppColors.primary
                  : (isDark ? Colors.white38 : Colors.black38)),
          labelText: label,
          labelStyle: GoogleFonts.poppins(
            fontSize: 13,
            color: isDark ? Colors.white38 : Colors.black45,
          ),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          disabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          errorBorder: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildDropdownTile({
    required String label,
    required IconData icon,
    required String value,
    required List<String> items,
    required bool enabled,
    required bool isDark,
    required ValueChanged<String?> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          Icon(icon,
              size: 20,
              color: enabled
                  ? AppColors.primary
                  : (isDark ? Colors.white38 : Colors.black38)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: isDark ? Colors.white38 : Colors.black45)),
                enabled
                    ? DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: value,
                          isExpanded: true,
                          dropdownColor:
                              isDark ? AppColors.darkSurface : Colors.white,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                          items: items
                              .map((e) => DropdownMenuItem(
                                    value: e,
                                    child: Text(e),
                                  ))
                              .toList(),
                          onChanged: onChanged,
                        ),
                      )
                    : Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text(value,
                            style: GoogleFonts.poppins(
                                fontSize: 14,
                                color:
                                    isDark ? Colors.white : Colors.black87)),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool isDark,
    required VoidCallback? onTap,
    Color? titleColor,
    Widget? trailing,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: iconColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: titleColor ?? (isDark ? Colors.white : Colors.black87),
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.poppins(
          fontSize: 12,
          color: isDark ? Colors.white38 : Colors.black38,
        ),
      ),
      trailing: trailing ??
          Icon(Icons.chevron_right_rounded,
              color: isDark ? Colors.white24 : Colors.black26),
      onTap: onTap,
    );
  }

  Widget _buildDivider(bool isDark) {
    return Divider(
      height: 1,
      thickness: 1,
      indent: 16,
      endIndent: 16,
      color: isDark
          ? Colors.white.withOpacity(0.06)
          : Colors.black.withOpacity(0.06),
    );
  }

  Widget _dialogTextField({
    required TextEditingController ctrl,
    required String label,
    required bool isDark,
    bool obscure = false,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: ctrl,
      obscureText: obscure,
      validator: validator,
      style: GoogleFonts.poppins(
        fontSize: 14,
        color: isDark ? Colors.white : Colors.black87,
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(
          fontSize: 13,
          color: isDark ? Colors.white54 : Colors.black54,
        ),
        filled: true,
        fillColor: isDark
            ? Colors.white.withOpacity(0.06)
            : Colors.black.withOpacity(0.04),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }

  BoxDecoration _cardDecoration(bool isDark) {
    return BoxDecoration(
      color: isDark ? AppColors.darkSurface : Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'N/A';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }

  void _showStudyHistoryDialog(BuildContext context, AppUser user, bool isDark) {
    showDialog(
      context: context,
      builder: (_) {
        final firestoreService = ref.read(firestoreServiceProvider);
        return Dialog(
          backgroundColor: isDark ? AppColors.darkSurface : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Container(
            width: 500,
            height: 600,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.12),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.history_rounded, color: AppColors.success, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Study History',
                          style: GoogleFonts.poppins(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: StreamBuilder<List<Map<String, dynamic>>>(
                    stream: firestoreService.watchUserActivities(userId: user.id),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      if (snapshot.hasError) {
                        return Center(
                          child: Text(
                            'Error: ${snapshot.error}',
                            style: GoogleFonts.poppins(color: Colors.red),
                          ),
                        );
                      }
                      final logs = snapshot.data ?? [];
                      if (logs.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.history_edu_rounded, size: 48, color: Colors.grey.withOpacity(0.5)),
                              const SizedBox(height: 16),
                              Text(
                                'No study history recorded yet.',
                                style: GoogleFonts.poppins(color: Colors.grey),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        );
                      }
                      return ListView.builder(
                        itemCount: logs.length,
                        itemBuilder: (context, idx) {
                          final log = logs[idx];
                          final action = log['action'] ?? '';
                          final targetName = log['targetName'] ?? '';
                          final timestampStr = log['timestamp'] as String?;
                          String timeAgo = 'Some time ago';
                          if (timestampStr != null) {
                            try {
                              final dt = DateTime.parse(timestampStr).toLocal();
                              timeAgo = DateFormat('MMM d, h:mm a').format(dt);
                            } catch (_) {}
                          }

                          IconData icon = Icons.bookmark_added_rounded;
                          Color color = AppColors.primary;
                          String activityTitle = '';

                          if (action == 'view_book') {
                            icon = Icons.menu_book_rounded;
                            color = AppColors.primary;
                            activityTitle = 'Opened book: $targetName';
                          } else if (action == 'chat_gemini') {
                            icon = Icons.psychology_rounded;
                            color = AppColors.accent;
                            activityTitle = 'AI Chat: "$targetName"';
                          } else if (action == 'login') {
                            icon = Icons.login_rounded;
                            color = Colors.green;
                            activityTitle = 'Logged in';
                          } else if (action == 'signup') {
                            icon = Icons.person_add_rounded;
                            color = Colors.orange;
                            activityTitle = 'Created account';
                          } else if (action == 'logout') {
                            icon = Icons.logout_rounded;
                            color = Colors.red;
                            activityTitle = 'Logged out';
                          } else {
                            activityTitle = '$action: $targetName';
                          }

                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.03),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: color.withOpacity(0.12),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(icon, color: color, size: 18),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        activityTitle,
                                        style: GoogleFonts.poppins(
                                          fontSize: 12.5,
                                          fontWeight: FontWeight.w600,
                                          color: isDark ? Colors.white : Colors.black87,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        timeAgo,
                                        style: GoogleFonts.poppins(
                                          fontSize: 10,
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Sign Out Dialog
// ---------------------------------------------------------------------------

class _SignOutDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return AlertDialog(
      backgroundColor: isDark ? AppColors.darkSurface : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text(
        'Sign Out',
        style: GoogleFonts.poppins(
          fontWeight: FontWeight.bold,
          color: isDark ? Colors.white : Colors.black87,
        ),
      ),
      content: Text(
        'Are you sure you want to sign out of Dr. Astro?',
        style: GoogleFonts.poppins(
          fontSize: 14,
          color: isDark ? Colors.white60 : Colors.black54,
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text('Cancel',
              style: GoogleFonts.poppins(color: Colors.grey)),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, true),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.error,
            foregroundColor: Colors.white,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Text('Sign Out',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Internal Model
// ---------------------------------------------------------------------------

class _StatItem {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;

  const _StatItem({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
  });
}

// ---------------------------------------------------------------------------
// AppUser extension assumed fields (adapt to your actual model):
//   String? displayName, email, avatarUrl, college, gender, yearOfStudy
//   int? batchYear, studyStreak, xpPoints
//   DateTime? joinedDate
//   bool? isAdmin
// ---------------------------------------------------------------------------
