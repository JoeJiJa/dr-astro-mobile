import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/services/auth_service.dart';
import '../../core/theme/app_colors.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _collegeController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String? _selectedYear;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  static const _yearOptions = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    '5th Year',
    'Internship',
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeIn,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.12),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _collegeController.dispose();
    super.dispose();
  }

  Future<void> _createAccount() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authService = ref.read(authServiceProvider);
      await authService.signUpWithEmail(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name: _nameController.text.trim(),
        yearOfStudy: _selectedYear ?? '',
        collegeName: _collegeController.text.trim(),
      );
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar(_parseAuthError(e.toString()));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _parseAuthError(String error) {
    if (error.contains('email-already-in-use')) return 'An account with this email already exists.';
    if (error.contains('invalid-email')) return 'The email address is badly formatted.';
    if (error.contains('weak-password')) return 'Password is too weak. Use at least 6 characters.';
    if (error.contains('network-request-failed')) return 'Network error. Check your connection.';
    if (error.contains('too-many-requests')) return 'Too many attempts. Try again later.';
    return 'An error occurred. Please try again.';
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? AppColors.dark.background : AppColors.light.background,
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isDesktop = constraints.maxWidth > 700;
          return isDesktop
              ? _buildDesktopLayout(isDark)
              : _buildMobileLayout(isDark);
        },
      ),
    );
  }

  // ─────────────── DESKTOP LAYOUT ───────────────
  Widget _buildDesktopLayout(bool isDark) {
    return Row(
      children: [
        // Left panel – decorative gradient + constellation
        Expanded(
          child: _buildGradientHero(isFullHeight: true),
        ),
        // Right panel – signup form
        Expanded(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 40),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: _buildFormCard(isDark, isDesktop: true),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ─────────────── MOBILE LAYOUT ───────────────
  Widget _buildMobileLayout(bool isDark) {
    return SingleChildScrollView(
      child: Column(
        children: [
          _buildGradientHero(isFullHeight: false),
          FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: _buildFormCard(isDark, isDesktop: false),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────── GRADIENT HERO ───────────────
  Widget _buildGradientHero({required bool isFullHeight}) {
    return Container(
      height: isFullHeight ? double.infinity : 240,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0B0C2A),
            Color(0xFF1A1260),
            Color(0xFF2D1B69),
          ],
        ),
      ),
      child: Stack(
        children: [
          CustomPaint(
            size: const Size(double.infinity, double.infinity),
            painter: _ConstellationPainter(),
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const RadialGradient(
                        colors: [Color(0xFFFFD700), Color(0xFFFF8C00)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFFD700).withOpacity(0.5),
                          blurRadius: 24,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.auto_awesome,
                      color: Colors.white,
                      size: 40,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Dr. Astro',
                    style: GoogleFonts.cinzel(
                      fontSize: isFullHeight ? 36 : 26,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Begin your cosmic\nmedical journey',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.75),
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────── FORM CARD ───────────────
  Widget _buildFormCard(bool isDark, {required bool isDesktop}) {
    final cardColor = isDark ? AppColors.dark.surface : Colors.white;
    final textColor = isDark ? AppColors.dark.onSurface : AppColors.light.onSurface;
    final subTextColor = isDark ? AppColors.dark.onSurfaceVariant : AppColors.light.onSurfaceVariant;

    return Container(
      padding: EdgeInsets.all(isDesktop ? 36 : 24),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.4 : 0.08),
            blurRadius: 32,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Title
            Text(
              'Create Account',
              style: GoogleFonts.cinzel(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Join the Dr. Astro community',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: subTextColor,
              ),
            ),
            const SizedBox(height: 28),

            // Full Name
            _buildTextField(
              controller: _nameController,
              label: 'Full Name',
              hint: 'Dr. Jane Smith',
              icon: Icons.person_outline,
              isDark: isDark,
              validator: (val) {
                if (val == null || val.trim().isEmpty) return 'Full name is required';
                if (val.trim().length < 2) return 'Enter a valid name';
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Email
            _buildTextField(
              controller: _emailController,
              label: 'Email Address',
              hint: 'doctor@example.com',
              icon: Icons.email_outlined,
              isDark: isDark,
              keyboardType: TextInputType.emailAddress,
              validator: (val) {
                if (val == null || val.trim().isEmpty) return 'Email is required';
                final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
                if (!emailRegex.hasMatch(val.trim())) return 'Enter a valid email';
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Year of Study Dropdown
            _buildDropdown(isDark: isDark),
            const SizedBox(height: 16),

            // College Name
            _buildTextField(
              controller: _collegeController,
              label: 'College / Institution',
              hint: 'AIIMS New Delhi',
              icon: Icons.school_outlined,
              isDark: isDark,
              validator: (val) {
                if (val == null || val.trim().isEmpty) return 'College name is required';
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Password
            _buildTextField(
              controller: _passwordController,
              label: 'Password',
              hint: '••••••••',
              icon: Icons.lock_outline,
              isDark: isDark,
              obscureText: _obscurePassword,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                  color: subTextColor,
                  size: 20,
                ),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
              validator: (val) {
                if (val == null || val.isEmpty) return 'Password is required';
                if (val.length < 6) return 'Password must be at least 6 characters';
                final hasUpper = RegExp(r'[A-Z]').hasMatch(val);
                final hasDigit = RegExp(r'[0-9]').hasMatch(val);
                if (!hasUpper || !hasDigit) {
                  return 'Include at least one uppercase letter and number';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Confirm Password
            _buildTextField(
              controller: _confirmPasswordController,
              label: 'Confirm Password',
              hint: '••••••••',
              icon: Icons.lock_outline,
              isDark: isDark,
              obscureText: _obscureConfirmPassword,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPassword
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: subTextColor,
                  size: 20,
                ),
                onPressed: () =>
                    setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
              ),
              validator: (val) {
                if (val == null || val.isEmpty) return 'Please confirm your password';
                if (val != _passwordController.text) return 'Passwords do not match';
                return null;
              },
            ),
            const SizedBox(height: 30),

            // Create Account button
            _buildPrimaryButton(),
            const SizedBox(height: 24),

            // Divider
            Row(
              children: [
                Expanded(child: Divider(color: subTextColor.withOpacity(0.3))),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    'or',
                    style: GoogleFonts.inter(fontSize: 13, color: subTextColor),
                  ),
                ),
                Expanded(child: Divider(color: subTextColor.withOpacity(0.3))),
              ],
            ),
            const SizedBox(height: 20),

            // Already have account
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Already have an account? ',
                  style: GoogleFonts.inter(fontSize: 14, color: subTextColor),
                ),
                GestureDetector(
                  onTap: () => context.go('/login'),
                  child: Text(
                    'Sign In',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown({required bool isDark}) {
    final borderColor = isDark ? AppColors.dark.outline : AppColors.light.outline;
    final fillColor = isDark ? AppColors.dark.surfaceVariant : const Color(0xFFF8F9FF);
    final labelColor = isDark ? AppColors.dark.onSurfaceVariant : AppColors.light.onSurfaceVariant;
    final textColor = isDark ? AppColors.dark.onSurface : AppColors.light.onSurface;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Year of Study',
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: labelColor,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedYear,
          hint: Text(
            'Select year',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: labelColor.withOpacity(0.5),
            ),
          ),
          icon: Icon(Icons.keyboard_arrow_down_rounded, color: labelColor),
          dropdownColor: isDark ? AppColors.dark.surface : Colors.white,
          style: GoogleFonts.inter(fontSize: 15, color: textColor),
          decoration: InputDecoration(
            prefixIcon: Icon(
              Icons.calendar_today_outlined,
              color: AppColors.primary.withOpacity(0.7),
              size: 20,
            ),
            filled: true,
            fillColor: fillColor,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.primary, width: 1.8),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.error, width: 1.8),
            ),
            errorStyle: GoogleFonts.inter(fontSize: 12, color: AppColors.error),
          ),
          items: _yearOptions.map((year) {
            return DropdownMenuItem<String>(
              value: year,
              child: Text(
                year,
                style: GoogleFonts.inter(fontSize: 14, color: textColor),
              ),
            );
          }).toList(),
          onChanged: (value) => setState(() => _selectedYear = value),
          validator: (val) {
            if (val == null || val.isEmpty) return 'Please select your year of study';
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required bool isDark,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    final borderColor = isDark ? AppColors.dark.outline : AppColors.light.outline;
    final fillColor = isDark ? AppColors.dark.surfaceVariant : const Color(0xFFF8F9FF);
    final labelColor = isDark ? AppColors.dark.onSurfaceVariant : AppColors.light.onSurfaceVariant;
    final textColor = isDark ? AppColors.dark.onSurface : AppColors.light.onSurface;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: labelColor,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          style: GoogleFonts.inter(fontSize: 15, color: textColor),
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.inter(
              fontSize: 14,
              color: labelColor.withOpacity(0.5),
            ),
            prefixIcon: Icon(icon, color: AppColors.primary.withOpacity(0.7), size: 20),
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: fillColor,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.primary, width: 1.8),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.error, width: 1.8),
            ),
            errorStyle: GoogleFonts.inter(fontSize: 12, color: AppColors.error),
          ),
        ),
      ],
    );
  }

  Widget _buildPrimaryButton() {
    return SizedBox(
      height: 52,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF6C63FF), Color(0xFF4A90E2)],
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: _isLoading ? null : _createAccount,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2.5,
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.rocket_launch_outlined, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Text(
                      'Create Account',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

// ─────────────── CONSTELLATION PAINTER ───────────────
class _ConstellationPainter extends CustomPainter {
  static const _stars = [
    Offset(0.1, 0.15), Offset(0.25, 0.08), Offset(0.4, 0.2),
    Offset(0.6, 0.1), Offset(0.75, 0.25), Offset(0.9, 0.12),
    Offset(0.15, 0.45), Offset(0.35, 0.55), Offset(0.55, 0.4),
    Offset(0.7, 0.6), Offset(0.85, 0.45), Offset(0.05, 0.7),
    Offset(0.3, 0.75), Offset(0.5, 0.85), Offset(0.65, 0.72),
    Offset(0.8, 0.88), Offset(0.95, 0.65), Offset(0.2, 0.92),
    Offset(0.45, 0.35), Offset(0.78, 0.38),
  ];

  static const _lines = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [6, 7], [7, 8], [8, 9], [9, 10],
    [11, 12], [12, 13], [13, 14], [14, 15],
    [2, 7], [8, 14], [4, 9],
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = Colors.white.withOpacity(0.12)
      ..strokeWidth = 0.8
      ..style = PaintingStyle.stroke;

    for (final line in _lines) {
      final start = Offset(_stars[line[0]].dx * size.width, _stars[line[0]].dy * size.height);
      final end = Offset(_stars[line[1]].dx * size.width, _stars[line[1]].dy * size.height);
      canvas.drawLine(start, end, linePaint);
    }

    for (int i = 0; i < _stars.length; i++) {
      final pos = Offset(_stars[i].dx * size.width, _stars[i].dy * size.height);
      final radius = (i % 3 == 0) ? 2.5 : (i % 3 == 1) ? 1.8 : 1.2;
      final opacity = (i % 3 == 0) ? 0.9 : (i % 3 == 1) ? 0.7 : 0.5;

      final starPaint = Paint()
        ..color = Colors.white.withOpacity(opacity)
        ..style = PaintingStyle.fill;

      canvas.drawCircle(pos, radius, starPaint);

      if (i % 3 == 0) {
        final glowPaint = Paint()
          ..color = Colors.white.withOpacity(0.2)
          ..style = PaintingStyle.fill
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
        canvas.drawCircle(pos, 5, glowPaint);
      }
    }
  }

  @override
  bool shouldRepaint(_ConstellationPainter oldDelegate) => false;
}
