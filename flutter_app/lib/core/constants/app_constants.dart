class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Dr. Astro';
  static const String appTagline = 'Your Medical Study Companion';
  static const String appVersion = '1.0.0';

  // Firebase Collections
  static const String subjectsCollection = 'subjects-v2';
  static const String usersCollection = 'users';
  static const String userActivitiesCollection = 'activities';
  static const String adminAuditLogsCollection = 'admin-audit';

  // Gemini AI
  static const String geminiApiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  static const String geminiApiKey = 'AIzaSyDkL97giZawPNhSnl8oKJiSIzS7_pgnkZA';

  // Admin emails
  static const List<String> adminEmails = [
    'joejijaburaq2005@gmail.com',
    'admin@drastro.app',
  ];

  // Year groups
  static const Map<int, String> yearLabels = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
    5: '5th Year',
    6: 'Internship',
  };

  // Shared Preferences Keys
  static const String kThemeMode = 'theme_mode';
  static const String kUserId = 'user_id';
  static const String kRecentlyViewed = 'recently_viewed';
  static const String kFavorites = 'favorites';

  // Dimensions
  static const double maxDesktopWidth = 1400;
  static const double breakpointTablet = 768;
  static const double breakpointDesktop = 1200;

  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 350);
  static const Duration longAnimation = Duration(milliseconds: 500);
}
