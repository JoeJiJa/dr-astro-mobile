import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary — Celestial blue/indigo (matches Dr. Astro brand)
  static const Color primary = Color(0xFF4F46E5);       // Indigo-600
  static const Color primaryLight = Color(0xFFEEF2FF);  // Indigo-50
  static const Color primaryDark = Color(0xFF3730A3);   // Indigo-800

  // Secondary — Violet accent
  static const Color secondary = Color(0xFF7C3AED);     // Violet-600
  static const Color secondaryLight = Color(0xFFF5F3FF); // Violet-50
  static const Color secondaryDark = Color(0xFF5B21B6);  // Violet-800

  // Semantic
  static const Color success = Color(0xFF10B981);        // Emerald-500
  static const Color successLight = Color(0xFFD1FAE5);   // Emerald-100
  static const Color warning = Color(0xFFF59E0B);        // Amber-500
  static const Color warningLight = Color(0xFFFEF3C7);   // Amber-100
  static const Color error = Color(0xFFEF4444);          // Red-500
  static const Color errorLight = Color(0xFFFEE2E2);     // Red-100
  static const Color errorDark = Color(0xFFB91C1C);      // Red-700

  // Feature-specific colors
  static const Color examPrimary = Color(0xFF3B82F6);      // blue-500
  static const Color examSecondary = Color(0xFF6366F1);    // indigo-500
  static const Color practicalPrimary = Color(0xFF0D9488); // teal-600
  static const Color practicalSecondary = Color(0xFF10B981); // emerald-500
  static const Color neuralLabPrimary = Color(0xFF7C3AED); // violet-600
  static const Color neuralLabSecondary = Color(0xFF4F46E5); // indigo-600

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [Color(0xFF1E1B4B), Color(0xFF312E81)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Subject colors
  static const Color anatomyColor = Color(0xFFEF4444);       // Red
  static const Color biochemColor = Color(0xFFF59E0B);       // Amber
  static const Color physioColor = Color(0xFF10B981);        // Emerald
  static const Color pharmacoColor = Color(0xFF8B5CF6);      // Purple
  static const Color pathologyColor = Color(0xFF6366F1);     // Indigo
  static const Color microColor = Color(0xFF14B8A6);         // Teal
  static const Color forensicColor = Color(0xFF64748B);      // Slate
  static const Color communityColor = Color(0xFF22C55E);     // Green
  static const Color medicineColor = Color(0xFF3B82F6);      // Blue
  static const Color surgeryColor = Color(0xFFEC4899);       // Pink
  static const Color obgColor = Color(0xFFF97316);           // Orange
  static const Color pediatricsColor = Color(0xFF06B6D4);    // Cyan
  static const Color ophthColor = Color(0xFF84CC16);         // Lime
  static const Color entColor = Color(0xFFA855F7);           // Purple

  // Light mode palette
  static final ColorPalette light = ColorPalette(
    background: const Color(0xFFF8F9FF),
    surface: Colors.white,
    card: Colors.white,
    surfaceVariant: const Color(0xFFF1F5F9),
    onSurface: const Color(0xFF0F172A),
    onSurfaceVariant: const Color(0xFF64748B),
    outline: const Color(0xFFCBD5E1),
  );

  // Dark mode palette
  static final ColorPalette dark = ColorPalette(
    background: const Color(0xFF0A0E1A),
    surface: const Color(0xFF111827),
    card: const Color(0xFF1F2937),
    surfaceVariant: const Color(0xFF1E293B),
    onSurface: const Color(0xFFF8FAFC),
    onSurfaceVariant: const Color(0xFF94A3B8),
    outline: const Color(0xFF334155),
  );
}

class ColorPalette {
  final Color background;
  final Color surface;
  final Color card;
  final Color surfaceVariant;
  final Color onSurface;
  final Color onSurfaceVariant;
  final Color outline;

  const ColorPalette({
    required this.background,
    required this.surface,
    required this.card,
    required this.surfaceVariant,
    required this.onSurface,
    required this.onSurfaceVariant,
    required this.outline,
  });
}
