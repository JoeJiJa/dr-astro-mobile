import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/providers/theme_provider.dart';
import '../../core/providers/subjects_provider.dart';
import '../../core/services/auth_service.dart';

// ---------------------------------------------------------------------------
// Link-type detection helpers
// ---------------------------------------------------------------------------

enum _LinkType { pdf, telegram, drive, febbox, web }

_LinkType _detectLinkType(String url) {
  final lower = url.toLowerCase();
  if (lower.endsWith('.pdf') || lower.contains('/pdf/') || lower.contains('?type=pdf')) {
    return _LinkType.pdf;
  }
  if (lower.contains('t.me') || lower.contains('telegram.me')) {
    return _LinkType.telegram;
  }
  if (lower.contains('drive.google.com') || lower.contains('docs.google.com')) {
    return _LinkType.drive;
  }
  if (lower.contains('febbox.com') || lower.contains('febbox')) {
    return _LinkType.febbox;
  }
  return _LinkType.web;
}

// ---------------------------------------------------------------------------
// Study Screen
// ---------------------------------------------------------------------------

class StudyScreen extends ConsumerStatefulWidget {
  final String title;
  final String url;

  const StudyScreen({
    super.key,
    required this.title,
    required this.url,
  });

  @override
  ConsumerState<StudyScreen> createState() => _StudyScreenState();
}

class _StudyScreenState extends ConsumerState<StudyScreen>
    with SingleTickerProviderStateMixin {
  late _LinkType _linkType;

  // PDF state
  bool _pdfLoading = true;
  bool _pdfError = false;
  String? _localPdfPath;
  int _totalPages = 0;
  int _currentPage = 0;
  double _downloadProgress = 0;
  PDFViewController? _pdfController;
  bool _isBookmarked = false;

  @override
  void initState() {
    super.initState();
    _linkType = _detectLinkType(widget.url);
    if (_linkType == _LinkType.pdf) {
      _downloadPdf();
    }
  }

  // -------------------------------------------------------------------------
  // PDF Download
  // -------------------------------------------------------------------------

  Future<void> _downloadPdf() async {
    try {
      setState(() {
        _pdfLoading = true;
        _pdfError = false;
        _downloadProgress = 0;
      });

      final request = http.Request('GET', Uri.parse(widget.url));
      final response = await http.Client().send(request);
      final contentLength = response.contentLength ?? 0;

      final dir = await getTemporaryDirectory();
      final safeTitle = widget.title
          .replaceAll(RegExp(r'[^\w\s-]'), '')
          .replaceAll(' ', '_');
      final file = File('${dir.path}/$safeTitle.pdf');

      final bytes = <int>[];
      await for (final chunk in response.stream) {
        bytes.addAll(chunk);
        if (contentLength > 0) {
          setState(() {
            _downloadProgress = bytes.length / contentLength;
          });
        }
      }

      await file.writeAsBytes(bytes);
      if (mounted) {
        setState(() {
          _localPdfPath = file.path;
          _pdfLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _pdfLoading = false;
          _pdfError = true;
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // URL Launcher
  // -------------------------------------------------------------------------

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open link',
                style: GoogleFonts.poppins(color: Colors.white)),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    }
  }

  Future<void> _shareUrl() async {
    await Clipboard.setData(ClipboardData(text: widget.url));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Link copied to clipboard!',
              style: GoogleFonts.poppins(color: Colors.white)),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor:
            isDark ? AppColors.darkBackground : AppColors.lightBackground,
        body: Column(
          children: [
            // ---- Header ----
            _buildHeader(context, isDark),

            // ---- Content ----
            Expanded(child: _buildContent(isDark)),

            // ---- Bottom Bar ----
            _buildBottomBar(isDark),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------

  Widget _buildHeader(BuildContext context, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.3 : 0.08),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            children: [
              // Back
              IconButton(
                onPressed: () => context.pop(),
                icon: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  color: isDark ? Colors.white : Colors.black87,
                  size: 20,
                ),
                tooltip: 'Back',
              ),

              // Title
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: GoogleFonts.poppins(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Row(
                      children: [
                        _buildTypeBadge(isDark),
                        if (_linkType == _LinkType.pdf &&
                            !_pdfLoading &&
                            _totalPages > 0) ...[
                          const SizedBox(width: 8),
                          Text(
                            'Page ${_currentPage + 1} / $_totalPages',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              color: isDark ? Colors.white38 : Colors.black38,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),

              // Bookmark
              IconButton(
                onPressed: () {
                  setState(() => _isBookmarked = !_isBookmarked);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        _isBookmarked ? 'Bookmarked!' : 'Bookmark removed',
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                      backgroundColor:
                          _isBookmarked ? AppColors.primary : Colors.grey,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      margin: const EdgeInsets.all(16),
                      duration: const Duration(seconds: 1),
                    ),
                  );
                },
                icon: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  transitionBuilder: (child, anim) =>
                      ScaleTransition(scale: anim, child: child),
                  child: Icon(
                    _isBookmarked
                        ? Icons.bookmark_rounded
                        : Icons.bookmark_border_rounded,
                    key: ValueKey(_isBookmarked),
                    color: _isBookmarked
                        ? AppColors.primary
                        : (isDark ? Colors.white54 : Colors.black45),
                    size: 22,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildTypeBadge(bool isDark) {
    final config = _badgeConfig(_linkType);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(config.icon, size: 10, color: config.color),
          const SizedBox(width: 3),
          Text(
            config.label,
            style: GoogleFonts.poppins(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: config.color,
            ),
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Content Router
  // -------------------------------------------------------------------------

  Widget _buildContent(bool isDark) {
    switch (_linkType) {
      case _LinkType.pdf:
        return _buildPdfContent(isDark);
      case _LinkType.telegram:
        return _buildTelegramCard(isDark);
      case _LinkType.drive:
        return _buildDriveCard(isDark);
      case _LinkType.febbox:
        return _buildFebboxCard(isDark);
      case _LinkType.web:
        return _buildWebCard(isDark);
    }
  }

  // -------------------------------------------------------------------------
  // PDF Viewer
  // -------------------------------------------------------------------------

  Widget _buildPdfContent(bool isDark) {
    if (_pdfLoading) {
      return _buildPdfLoadingView(isDark);
    }

    if (_pdfError) {
      return _buildErrorView(isDark);
    }

    if (_localPdfPath == null) {
      return _buildErrorView(isDark);
    }

    return Stack(
      children: [
        PDFView(
          filePath: _localPdfPath!,
          enableSwipe: true,
          swipeHorizontal: false,
          autoSpacing: true,
          pageFling: true,
          backgroundColor:
              isDark ? AppColors.darkBackground : const Color(0xFFF5F5F5),
          onRender: (pages) {
            if (mounted) setState(() => _totalPages = pages ?? 0);
          },
          onPageChanged: (page, total) {
            if (mounted) {
              setState(() {
                _currentPage = page ?? 0;
                _totalPages = total ?? 0;
              });
            }
          },
          onViewCreated: (controller) {
            _pdfController = controller;
          },
          onError: (error) {
            if (mounted) setState(() => _pdfError = true);
          },
        ),
        // Page indicator
        if (_totalPages > 0)
          Positioned(
            bottom: 16,
            right: 16,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.65),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${_currentPage + 1} / $_totalPages',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPdfLoadingView(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.picture_as_pdf_rounded,
              size: 50,
              color: AppColors.primary,
            ),
          )
              .animate(onPlay: (c) => c.repeat())
              .shimmer(duration: 1200.ms, color: AppColors.primary.withOpacity(0.3)),
          const SizedBox(height: 28),
          Text(
            'Loading PDF…',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white70 : Colors.black54,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: 220,
            child: Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: _downloadProgress > 0 ? _downloadProgress : null,
                    backgroundColor:
                        isDark ? Colors.white12 : Colors.black12,
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(AppColors.primary),
                    minHeight: 6,
                  ),
                ),
                if (_downloadProgress > 0) ...[
                  const SizedBox(height: 8),
                  Text(
                    '${(_downloadProgress * 100).toStringAsFixed(0)}%',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: isDark ? Colors.white38 : Colors.black38,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  // -------------------------------------------------------------------------
  // Telegram Card
  // -------------------------------------------------------------------------

  Widget _buildTelegramCard(bool isDark) {
    return _buildInfoCard(
      isDark: isDark,
      gradient: const LinearGradient(
        colors: [Color(0xFF2AABEE), Color(0xFF229ED9)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      icon: Icons.send_rounded,
      iconBg: const Color(0xFF229ED9),
      title: 'Open in Telegram',
      subtitle: 'This resource is shared via Telegram.',
      instructions: const [
        '1. Tap the button below to open Telegram',
        '2. Join the channel/group if prompted',
        '3. Find and download the file in the chat',
        '4. Use Telegram\'s built-in viewer or save to your device',
      ],
      actionLabel: 'Open in Telegram',
      actionIcon: Icons.open_in_new_rounded,
      actionColor: const Color(0xFF2AABEE),
      onAction: () => _launchUrl(widget.url),
    );
  }

  // -------------------------------------------------------------------------
  // Google Drive Card
  // -------------------------------------------------------------------------

  Widget _buildDriveCard(bool isDark) {
    // Convert to direct download URL if possible
    final directUrl = _driveDirectUrl(widget.url);

    return _buildInfoCard(
      isDark: isDark,
      gradient: LinearGradient(
        colors: [AppColors.primary, AppColors.accent],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      icon: Icons.cloud_download_rounded,
      iconBg: AppColors.accent,
      title: 'Google Drive File',
      subtitle: 'This resource is hosted on Google Drive.',
      instructions: const [
        '1. Tap "Open Link" below',
        '2. Sign in to Google if prompted',
        '3. Tap the download icon (⬇) in Drive',
        '4. File will save to your device',
      ],
      actionLabel: 'Open in Drive',
      actionIcon: Icons.open_in_new_rounded,
      actionColor: AppColors.primary,
      onAction: () => _launchUrl(directUrl ?? widget.url),
    );
  }

  // -------------------------------------------------------------------------
  // Febbox Card
  // -------------------------------------------------------------------------

  Widget _buildFebboxCard(bool isDark) {
    return _buildInfoCard(
      isDark: isDark,
      gradient: const LinearGradient(
        colors: [Color(0xFF6C63FF), Color(0xFF8E85FF)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      icon: Icons.folder_zip_outlined,
      iconBg: const Color(0xFF6C63FF),
      title: 'Febbox File',
      subtitle: 'This resource is hosted on Febbox.',
      instructions: const [
        '1. Tap "Open Link" to go to Febbox',
        '2. Create a free account if prompted',
        '3. Tap the download button on the file',
        '4. Choose your download format',
      ],
      actionLabel: 'Open Link',
      actionIcon: Icons.open_in_new_rounded,
      actionColor: const Color(0xFF6C63FF),
      onAction: () => _launchUrl(widget.url),
    );
  }

  // -------------------------------------------------------------------------
  // Generic Web Card
  // -------------------------------------------------------------------------

  Widget _buildWebCard(bool isDark) {
    return _buildInfoCard(
      isDark: isDark,
      gradient: LinearGradient(
        colors: [AppColors.primary.withOpacity(0.8), AppColors.primary],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      icon: Icons.language_rounded,
      iconBg: AppColors.primary,
      title: 'Web Resource',
      subtitle: 'This resource is available on the web.',
      instructions: const [
        '1. Tap "Open in Browser" below',
        '2. The page will open in your default browser',
        '3. Use browser\'s download feature if needed',
        '4. Bookmark the page for quick access',
      ],
      actionLabel: 'Open in Browser',
      actionIcon: Icons.open_in_browser_rounded,
      actionColor: AppColors.primary,
      onAction: () => _launchUrl(widget.url),
    );
  }

  // -------------------------------------------------------------------------
  // Shared Info Card Template
  // -------------------------------------------------------------------------

  Widget _buildInfoCard({
    required bool isDark,
    required Gradient gradient,
    required IconData icon,
    required Color iconBg,
    required String title,
    required String subtitle,
    required List<String> instructions,
    required String actionLabel,
    required IconData actionIcon,
    required Color actionColor,
    required VoidCallback onAction,
  }) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 20),

          // Hero gradient card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: actionColor.withOpacity(0.35),
                  blurRadius: 28,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 40, color: Colors.white),
                )
                    .animate()
                    .scale(
                        begin: const Offset(0.6, 0.6),
                        end: const Offset(1, 1),
                        duration: 500.ms,
                        curve: Curves.elasticOut)
                    .fadeIn(duration: 400.ms),
                const SizedBox(height: 16),
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(
                  subtitle,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: Colors.white70,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          )
              .animate()
              .fadeIn(delay: 100.ms, duration: 500.ms)
              .slideY(begin: 0.15, end: 0),

          const SizedBox(height: 28),

          // Instructions card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(isDark ? 0.25 : 0.06),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.help_outline_rounded,
                        size: 18,
                        color: isDark ? Colors.white54 : Colors.black45),
                    const SizedBox(width: 8),
                    Text(
                      'HOW TO ACCESS',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                        color: isDark ? Colors.white38 : Colors.black38,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ...instructions.asMap().entries.map(
                  (entry) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 26,
                          height: 26,
                          decoration: BoxDecoration(
                            color: actionColor.withOpacity(0.12),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              '${entry.key + 1}',
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: actionColor,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            entry.value.replaceFirst(
                                RegExp(r'^\d+\. '), ''),
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              color: isDark ? Colors.white70 : Colors.black70,
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          )
              .animate()
              .fadeIn(delay: 250.ms, duration: 500.ms)
              .slideY(begin: 0.1, end: 0),

          const SizedBox(height: 24),

          // URL preview chip
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withOpacity(0.04)
                  : Colors.black.withOpacity(0.04),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark
                    ? Colors.white.withOpacity(0.08)
                    : Colors.black.withOpacity(0.08),
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.link_rounded,
                    size: 16,
                    color: isDark ? Colors.white38 : Colors.black38),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.url,
                    style: GoogleFonts.robotoMono(
                      fontSize: 11,
                      color: isDark ? Colors.white38 : Colors.black38,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                GestureDetector(
                  onTap: () async {
                    await Clipboard.setData(ClipboardData(text: widget.url));
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('URL copied!',
                              style: GoogleFonts.poppins(color: Colors.white)),
                          backgroundColor: AppColors.success,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          margin: const EdgeInsets.all(16),
                          duration: const Duration(seconds: 1),
                        ),
                      );
                    }
                  },
                  child: Icon(Icons.copy_rounded,
                      size: 16,
                      color: isDark ? Colors.white38 : Colors.black38),
                ),
              ],
            ),
          )
              .animate()
              .fadeIn(delay: 350.ms, duration: 500.ms),

          const SizedBox(height: 24),

          // Main action button
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton.icon(
              onPressed: onAction,
              icon: Icon(actionIcon, size: 20),
              label: Text(
                actionLabel,
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: actionColor,
                foregroundColor: Colors.white,
                elevation: 4,
                shadowColor: actionColor.withOpacity(0.4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          )
              .animate()
              .fadeIn(delay: 400.ms, duration: 500.ms)
              .slideY(begin: 0.1, end: 0),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Error View
  // -------------------------------------------------------------------------

  Widget _buildErrorView(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.error_outline_rounded,
                  size: 48, color: AppColors.error),
            )
                .animate()
                .scale(
                    begin: const Offset(0.5, 0.5),
                    end: const Offset(1, 1),
                    duration: 400.ms,
                    curve: Curves.elasticOut),
            const SizedBox(height: 24),
            Text(
              'Failed to Load',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Could not load the PDF. Please check your internet connection and try again.',
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: isDark ? Colors.white54 : Colors.black45,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton.icon(
                  onPressed: () => _launchUrl(widget.url),
                  icon: const Icon(Icons.open_in_browser_rounded, size: 18),
                  label: Text('Open in Browser',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 18, vertical: 12),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _downloadPdf,
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: Text('Retry',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 18, vertical: 12),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Bottom Action Bar
  // -------------------------------------------------------------------------

  Widget _buildBottomBar(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.3 : 0.08),
            blurRadius: 12,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              // Open in Browser
              Expanded(
                child: _buildBarButton(
                  icon: Icons.open_in_browser_rounded,
                  label: 'Browser',
                  color: AppColors.primary,
                  isDark: isDark,
                  onTap: () => _launchUrl(widget.url),
                ),
              ),
              const SizedBox(width: 8),

              // Share / Copy
              Expanded(
                child: _buildBarButton(
                  icon: Icons.share_rounded,
                  label: 'Share',
                  color: const Color(0xFF26A69A),
                  isDark: isDark,
                  onTap: _shareUrl,
                ),
              ),
              const SizedBox(width: 8),

              // Bookmark
              Expanded(
                child: _buildBarButton(
                  icon: _isBookmarked
                      ? Icons.bookmark_rounded
                      : Icons.bookmark_border_rounded,
                  label: _isBookmarked ? 'Saved' : 'Save',
                  color: _isBookmarked
                      ? AppColors.accent
                      : (isDark ? Colors.white38 : Colors.black45),
                  isDark: isDark,
                  onTap: () {
                    setState(() => _isBookmarked = !_isBookmarked);
                  },
                ),
              ),

              // PDF-only: page jump
              if (_linkType == _LinkType.pdf &&
                  !_pdfLoading &&
                  !_pdfError &&
                  _totalPages > 0) ...[
                const SizedBox(width: 8),
                Expanded(
                  child: _buildBarButton(
                    icon: Icons.first_page_rounded,
                    label: 'First',
                    color: isDark ? Colors.white38 : Colors.black45,
                    isDark: isDark,
                    onTap: () => _pdfController?.setPage(0),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildBarButton({
    required IconData icon,
    required String label,
    required Color color,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------

  String? _driveDirectUrl(String url) {
    // Convert sharing URL to direct download
    final viewRegex = RegExp(r'drive\.google\.com/file/d/([^/]+)');
    final match = viewRegex.firstMatch(url);
    if (match != null) {
      final id = match.group(1);
      return 'https://drive.google.com/uc?export=download&id=$id';
    }
    return null;
  }

  _BadgeConfig _badgeConfig(_LinkType type) {
    switch (type) {
      case _LinkType.pdf:
        return _BadgeConfig(
            label: 'PDF', icon: Icons.picture_as_pdf_rounded, color: AppColors.error);
      case _LinkType.telegram:
        return _BadgeConfig(
            label: 'Telegram', icon: Icons.send_rounded, color: const Color(0xFF2AABEE));
      case _LinkType.drive:
        return _BadgeConfig(
            label: 'Drive', icon: Icons.cloud_outlined, color: AppColors.primary);
      case _LinkType.febbox:
        return _BadgeConfig(
            label: 'Febbox', icon: Icons.folder_zip_outlined, color: const Color(0xFF6C63FF));
      case _LinkType.web:
        return _BadgeConfig(
            label: 'Web', icon: Icons.language_rounded, color: const Color(0xFF26A69A));
    }
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

class _BadgeConfig {
  final String label;
  final IconData icon;
  final Color color;
  const _BadgeConfig({required this.label, required this.icon, required this.color});
}
