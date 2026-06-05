import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../core/services/gemini_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/providers/subjects_provider.dart';
import '../../core/services/firestore_service.dart';

// ─────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────

enum MessageRole { user, ai }

class ChatMessage {
  final String id;
  final String content;
  final MessageRole role;
  final DateTime timestamp;

  const ChatMessage({
    required this.id,
    required this.content,
    required this.role,
    required this.timestamp,
  });
}

// ─────────────────────────────────────────────────────────────
// Providers
// ─────────────────────────────────────────────────────────────

final chatMessagesProvider =
    StateNotifierProvider.autoDispose<ChatMessagesNotifier, List<ChatMessage>>(
  (ref) => ChatMessagesNotifier(),
);

final isAiLoadingProvider = StateProvider.autoDispose<bool>((ref) => false);

class ChatMessagesNotifier extends StateNotifier<List<ChatMessage>> {
  ChatMessagesNotifier() : super([]);

  void addMessage(ChatMessage message) {
    state = [...state, message];
  }

  void clear() {
    state = [];
  }
}

// ─────────────────────────────────────────────────────────────
// Suggested prompts
// ─────────────────────────────────────────────────────────────

const List<Map<String, String>> _suggestedPrompts = [
  {'icon': '🧠', 'text': 'Explain the brachial plexus'},
  {'icon': '💊', 'text': 'USMLE mnemonics for cranial nerves'},
  {'icon': '🫀', 'text': 'Cardiac cycle step-by-step'},
  {'icon': '🔬', 'text': 'Mechanism of beta-blockers'},
  {'icon': '🩺', 'text': 'Approach to chest pain DDx'},
  {'icon': '🧬', 'text': 'DNA replication enzymes explained'},
];

// ─────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────

class NeuralLabScreen extends ConsumerStatefulWidget {
  const NeuralLabScreen({super.key});

  @override
  ConsumerState<NeuralLabScreen> createState() => _NeuralLabScreenState();
}

class _NeuralLabScreenState extends ConsumerState<NeuralLabScreen>
    with TickerProviderStateMixin {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  late AnimationController _particleController;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    _particleController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _scrollToBottom({bool animated = true}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        if (animated) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent + 120,
            duration: const Duration(milliseconds: 350),
            curve: Curves.easeOut,
          );
        } else {
          _scrollController.jumpTo(
            _scrollController.position.maxScrollExtent + 120,
          );
        }
      }
    });
  }

  Future<void> _sendMessage(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;

    _inputController.clear();
    _focusNode.unfocus();

    final userMsg = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      content: trimmed,
      role: MessageRole.user,
      timestamp: DateTime.now(),
    );

    ref.read(chatMessagesProvider.notifier).addMessage(userMsg);
    ref.read(isAiLoadingProvider.notifier).state = true;
    _scrollToBottom();

    // Log user activity to Firestore
    try {
      final user = await ref.read(currentUserProvider.future);
      if (user != null) {
        final firestoreService = ref.read(firestoreServiceProvider);
        await firestoreService.logUserActivity(
          userId: user.id,
          userName: user.name,
          action: 'chat_gemini',
          targetId: 'neural_lab',
          targetName: trimmed,
        );
      }
    } catch (e) {
      print('Error logging chat_gemini activity: $e');
    }

    try {
      final geminiService = ref.read(geminiServiceProvider);
      final response = await geminiService.sendMessage(trimmed);

      final aiMsg = ChatMessage(
        id: '${DateTime.now().millisecondsSinceEpoch}_ai',
        content: response,
        role: MessageRole.ai,
        timestamp: DateTime.now(),
      );

      ref.read(chatMessagesProvider.notifier).addMessage(aiMsg);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to get response: ${e.toString()}',
              style: const TextStyle(color: Colors.white),
            ),
            backgroundColor: Colors.red.shade800,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } finally {
      if (mounted) {
        ref.read(isAiLoadingProvider.notifier).state = false;
        _scrollToBottom();
      }
    }
  }

  void _startNewChat() {
    ref.read(chatMessagesProvider.notifier).clear();
    _inputController.clear();
    _focusNode.unfocus();
    HapticFeedback.mediumImpact();
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(chatMessagesProvider);
    final isLoading = ref.watch(isAiLoadingProvider);
    final isEmpty = messages.isEmpty && !isLoading;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _NeuralLabHeader(onNewChat: _startNewChat),
            Expanded(
              child: isEmpty
                  ? _EmptyHeroSection(
                      particleController: _particleController,
                      pulseController: _pulseController,
                      onPromptSelected: _sendMessage,
                    )
                  : _ChatMessageList(
                      messages: messages,
                      isLoading: isLoading,
                      scrollController: _scrollController,
                    ),
            ),
            if (!isEmpty) _SuggestedChipsBar(onSelected: _sendMessage),
            _ChatInputBar(
              controller: _inputController,
              focusNode: _focusNode,
              isLoading: isLoading,
              onSend: _sendMessage,
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────

class _NeuralLabHeader extends StatelessWidget {
  final VoidCallback onNewChat;

  const _NeuralLabHeader({required this.onNewChat});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(
          bottom: BorderSide(
            color: AppColors.indigo.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.indigo, AppColors.violet],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppColors.indigo.withOpacity(0.4),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.psychology_rounded,
              color: Colors.white,
              size: 22,
            ),
          )
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .shimmer(duration: 3.seconds, color: Colors.white24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Neural Lab',
                  style: GoogleFonts.spaceGrotesk(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: Colors.greenAccent,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.greenAccent.withOpacity(0.6),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                    )
                        .animate(onPlay: (c) => c.repeat(reverse: true))
                        .fade(begin: 0.4, end: 1.0, duration: 1.2.seconds),
                    const SizedBox(width: 5),
                    Text(
                      'Powered by Gemini',
                      style: GoogleFonts.inter(
                        color: AppColors.textSecondary,
                        fontSize: 11.5,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          _HeaderActionButton(
            icon: Icons.add_comment_outlined,
            tooltip: 'New Chat',
            onTap: onNewChat,
          ),
        ],
      ),
    );
  }
}

class _HeaderActionButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;

  const _HeaderActionButton({
    required this.icon,
    required this.tooltip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            color: AppColors.indigo.withOpacity(0.12),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: AppColors.indigo.withOpacity(0.25),
              width: 1,
            ),
          ),
          child: Icon(icon, color: AppColors.indigo, size: 20),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Empty / Hero Section
// ─────────────────────────────────────────────────────────────

class _EmptyHeroSection extends StatelessWidget {
  final AnimationController particleController;
  final AnimationController pulseController;
  final void Function(String) onPromptSelected;

  const _EmptyHeroSection({
    required this.particleController,
    required this.pulseController,
    required this.onPromptSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        children: [
          const SizedBox(height: 16),
          _BrainHeroWidget(
            particleController: particleController,
            pulseController: pulseController,
          ),
          const SizedBox(height: 28),
          Text(
            'What would you like\nto learn today?',
            textAlign: TextAlign.center,
            style: GoogleFonts.spaceGrotesk(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w700,
              height: 1.3,
            ),
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.15, end: 0),
          const SizedBox(height: 10),
          Text(
            'Ask me anything about medicine, anatomy,\npharmacology, or exam prep.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              color: AppColors.textSecondary,
              fontSize: 14,
              height: 1.6,
            ),
          ).animate().fadeIn(delay: 350.ms),
          const SizedBox(height: 36),
          _SuggestedPromptsGrid(onSelected: onPromptSelected),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _BrainHeroWidget extends StatelessWidget {
  final AnimationController particleController;
  final AnimationController pulseController;

  const _BrainHeroWidget({
    required this.particleController,
    required this.pulseController,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      height: 200,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Outer glow ring
          AnimatedBuilder(
            animation: pulseController,
            builder: (context, _) {
              return Container(
                width: 160 + pulseController.value * 14,
                height: 160 + pulseController.value * 14,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.indigo.withOpacity(0.0),
                      AppColors.indigo.withOpacity(0.08 * pulseController.value),
                      AppColors.violet.withOpacity(0.0),
                    ],
                  ),
                ),
              );
            },
          ),
          // Particles
          AnimatedBuilder(
            animation: particleController,
            builder: (ctx, _) => CustomPaint(
              size: const Size(200, 200),
              painter: _ParticlePainter(particleController.value),
            ),
          ),
          // Inner circle
          AnimatedBuilder(
            animation: pulseController,
            builder: (context, _) {
              return Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      AppColors.indigo.withOpacity(0.85),
                      AppColors.violet.withOpacity(0.85),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.indigo
                          .withOpacity(0.4 + pulseController.value * 0.2),
                      blurRadius: 30,
                      spreadRadius: 4,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.psychology_rounded,
                  size: 50,
                  color: Colors.white,
                ),
              );
            },
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms)
        .scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1));
  }
}

class _ParticlePainter extends CustomPainter {
  final double animValue;

  _ParticlePainter(this.animValue);

  @override
  void paint(Canvas canvas, Size size) {
    final rng = math.Random(42);
    final cx = size.width / 2;
    final cy = size.height / 2;

    for (int i = 0; i < 18; i++) {
      final angle = (rng.nextDouble() * 2 * math.pi) +
          (animValue * 2 * math.pi * (i.isEven ? 1 : -1) * 0.15);
      final radius = 70.0 + rng.nextDouble() * 25;
      final x = cx + math.cos(angle) * radius;
      final y = cy + math.sin(angle) * radius;
      final opacity = 0.3 + (math.sin(animValue * math.pi * 2 + i) + 1) / 2 * 0.5;
      final particleSize = 1.5 + rng.nextDouble() * 2.5;

      final paint = Paint()
        ..color = (i % 3 == 0 ? const Color(0xFF818CF8) : const Color(0xFFA78BFA))
            .withOpacity(opacity)
        ..style = PaintingStyle.fill;

      canvas.drawCircle(Offset(x, y), particleSize, paint);
    }
  }

  @override
  bool shouldRepaint(_ParticlePainter old) => old.animValue != animValue;
}

class _SuggestedPromptsGrid extends StatelessWidget {
  final void Function(String) onSelected;

  const _SuggestedPromptsGrid({required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (int i = 0; i < _suggestedPrompts.length; i += 2)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Expanded(
                  child: _SuggestedPromptCard(
                    icon: _suggestedPrompts[i]['icon']!,
                    text: _suggestedPrompts[i]['text']!,
                    onTap: () => onSelected(_suggestedPrompts[i]['text']!),
                    delay: Duration(milliseconds: 400 + i * 80),
                  ),
                ),
                if (i + 1 < _suggestedPrompts.length) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: _SuggestedPromptCard(
                      icon: _suggestedPrompts[i + 1]['icon']!,
                      text: _suggestedPrompts[i + 1]['text']!,
                      onTap: () =>
                          onSelected(_suggestedPrompts[i + 1]['text']!),
                      delay: Duration(milliseconds: 400 + (i + 1) * 80),
                    ),
                  ),
                ],
              ],
            ),
          ),
      ],
    );
  }
}

class _SuggestedPromptCard extends StatefulWidget {
  final String icon;
  final String text;
  final VoidCallback onTap;
  final Duration delay;

  const _SuggestedPromptCard({
    required this.icon,
    required this.text,
    required this.onTap,
    required this.delay,
  });

  @override
  State<_SuggestedPromptCard> createState() => _SuggestedPromptCardState();
}

class _SuggestedPromptCardState extends State<_SuggestedPromptCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.indigo.withOpacity(0.25),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.indigo.withOpacity(0.07),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.icon, style: const TextStyle(fontSize: 22)),
              const SizedBox(height: 8),
              Text(
                widget.text,
                style: GoogleFonts.inter(
                  color: Colors.white.withOpacity(0.85),
                  fontSize: 12.5,
                  fontWeight: FontWeight.w500,
                  height: 1.4,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(delay: widget.delay).slideY(begin: 0.2, end: 0);
  }
}

// ─────────────────────────────────────────────────────────────
// Chat Message List
// ─────────────────────────────────────────────────────────────

class _ChatMessageList extends StatelessWidget {
  final List<ChatMessage> messages;
  final bool isLoading;
  final ScrollController scrollController;

  const _ChatMessageList({
    required this.messages,
    required this.isLoading,
    required this.scrollController,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      itemCount: messages.length + (isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == messages.length) {
          return const _TypingIndicatorBubble();
        }
        final msg = messages[index];
        final isFirst = index == 0 ||
            messages[index - 1].role != msg.role;
        return msg.role == MessageRole.user
            ? _UserMessageBubble(message: msg, showTimestamp: isFirst)
            : _AiMessageBubble(message: msg, showAvatar: isFirst);
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// User Message Bubble
// ─────────────────────────────────────────────────────────────

class _UserMessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool showTimestamp;

  const _UserMessageBubble({
    required this.message,
    required this.showTimestamp,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (showTimestamp)
            Padding(
              padding: const EdgeInsets.only(bottom: 4, right: 4),
              child: Text(
                DateFormat('hh:mm a').format(message.timestamp),
                style: GoogleFonts.inter(
                  color: AppColors.textSecondary,
                  fontSize: 10,
                ),
              ),
            ),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Flexible(
                child: Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.72,
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.indigo, AppColors.violet],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(18),
                      topRight: Radius.circular(18),
                      bottomLeft: Radius.circular(18),
                      bottomRight: Radius.circular(4),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.indigo.withOpacity(0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    message.content,
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontSize: 14.5,
                      height: 1.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 250.ms).slideX(begin: 0.1, end: 0);
  }
}

// ─────────────────────────────────────────────────────────────
// AI Message Bubble
// ─────────────────────────────────────────────────────────────

class _AiMessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool showAvatar;

  const _AiMessageBubble({
    required this.message,
    required this.showAvatar,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showAvatar)
            Padding(
              padding: const EdgeInsets.only(bottom: 6, left: 50),
              child: Text(
                DateFormat('hh:mm a').format(message.timestamp),
                style: GoogleFonts.inter(
                  color: AppColors.textSecondary,
                  fontSize: 10,
                ),
              ),
            ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (showAvatar)
                Container(
                  width: 36,
                  height: 36,
                  margin: const EdgeInsets.only(right: 10, top: 2),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.indigo, AppColors.violet],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.indigo.withOpacity(0.35),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.psychology_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                )
              else
                const SizedBox(width: 46),
              Flexible(
                child: Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.78,
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(4),
                      topRight: Radius.circular(18),
                      bottomLeft: Radius.circular(18),
                      bottomRight: Radius.circular(18),
                    ),
                    border: Border.all(
                      color: AppColors.indigo.withOpacity(0.18),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: MarkdownBody(
                    data: message.content,
                    styleSheet: MarkdownStyleSheet(
                      p: GoogleFonts.inter(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 14.5,
                        height: 1.6,
                      ),
                      h1: GoogleFonts.spaceGrotesk(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                      h2: GoogleFonts.spaceGrotesk(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      h3: GoogleFonts.spaceGrotesk(
                        color: Colors.white,
                        fontSize: 14.5,
                        fontWeight: FontWeight.w600,
                      ),
                      code: GoogleFonts.firaCode(
                        color: AppColors.indigo,
                        backgroundColor: AppColors.indigo.withOpacity(0.12),
                        fontSize: 13,
                      ),
                      codeblockDecoration: BoxDecoration(
                        color: AppColors.indigo.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: AppColors.indigo.withOpacity(0.2),
                        ),
                      ),
                      strong: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 14.5,
                      ),
                      em: GoogleFonts.inter(
                        color: Colors.white.withOpacity(0.85),
                        fontStyle: FontStyle.italic,
                        fontSize: 14.5,
                      ),
                      listBullet: GoogleFonts.inter(
                        color: AppColors.indigo,
                        fontSize: 14.5,
                      ),
                      blockquoteDecoration: BoxDecoration(
                        color: AppColors.violet.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border(
                          left: BorderSide(
                            color: AppColors.violet,
                            width: 3,
                          ),
                        ),
                      ),
                      blockquote: GoogleFonts.inter(
                        color: Colors.white.withOpacity(0.75),
                        fontSize: 14,
                        fontStyle: FontStyle.italic,
                      ),
                      tableHead: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 13.5,
                      ),
                      tableBody: GoogleFonts.inter(
                        color: Colors.white.withOpacity(0.85),
                        fontSize: 13,
                      ),
                      tableBorder: TableBorder.all(
                        color: AppColors.indigo.withOpacity(0.25),
                      ),
                    ),
                    selectable: true,
                  ),
                ),
              ),
            ],
          ),
          // Copy button
          Padding(
            padding: const EdgeInsets.only(left: 46, top: 4),
            child: GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: message.content));
                HapticFeedback.lightImpact();
              },
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.copy_rounded,
                    size: 12,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Copy',
                    style: GoogleFonts.inter(
                      color: AppColors.textSecondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.1, end: 0);
  }
}

// ─────────────────────────────────────────────────────────────
// Typing Indicator
// ─────────────────────────────────────────────────────────────

class _TypingIndicatorBubble extends StatelessWidget {
  const _TypingIndicatorBubble();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            width: 36,
            height: 36,
            margin: const EdgeInsets.only(right: 10, top: 2),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.indigo, AppColors.violet],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.psychology_rounded,
              color: Colors.white,
              size: 18,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(18),
                bottomRight: Radius.circular(18),
              ),
              border: Border.all(
                color: AppColors.indigo.withOpacity(0.18),
                width: 1,
              ),
            ),
            child: const _AnimatedDots(),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 200.ms);
  }
}

class _AnimatedDots extends StatefulWidget {
  const _AnimatedDots();

  @override
  State<_AnimatedDots> createState() => _AnimatedDotsState();
}

class _AnimatedDotsState extends State<_AnimatedDots>
    with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;
  late final List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      3,
      (i) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      ),
    );
    _animations = _controllers
        .map(
          (c) => Tween<double>(begin: 0, end: -8).animate(
            CurvedAnimation(parent: c, curve: Curves.easeInOut),
          ),
        )
        .toList();

    for (int i = 0; i < 3; i++) {
      Future.delayed(Duration(milliseconds: i * 180), () {
        if (mounted) _controllers[i].repeat(reverse: true);
      });
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (i) {
        return AnimatedBuilder(
          animation: _animations[i],
          builder: (context, _) => Transform.translate(
            offset: Offset(0, _animations[i].value),
            child: Container(
              width: 8,
              height: 8,
              margin: EdgeInsets.only(right: i < 2 ? 5 : 0),
              decoration: BoxDecoration(
                color: AppColors.indigo,
                shape: BoxShape.circle,
              ),
            ),
          ),
        );
      }),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Suggested Chips Bar (shown during chat)
// ─────────────────────────────────────────────────────────────

class _SuggestedChipsBar extends StatelessWidget {
  final void Function(String) onSelected;

  const _SuggestedChipsBar({required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      margin: const EdgeInsets.only(bottom: 4),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: _suggestedPrompts.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final prompt = _suggestedPrompts[i];
          return GestureDetector(
            onTap: () => onSelected(prompt['text']!),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.indigo.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(prompt['icon']!, style: const TextStyle(fontSize: 14)),
                  const SizedBox(width: 6),
                  Text(
                    prompt['text']!,
                    style: GoogleFonts.inter(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Chat Input Bar
// ─────────────────────────────────────────────────────────────

class _ChatInputBar extends StatefulWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isLoading;
  final void Function(String) onSend;

  const _ChatInputBar({
    required this.controller,
    required this.focusNode,
    required this.isLoading,
    required this.onSend,
  });

  @override
  State<_ChatInputBar> createState() => _ChatInputBarState();
}

class _ChatInputBarState extends State<_ChatInputBar> {
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onTextChanged);
  }

  void _onTextChanged() {
    final hasText = widget.controller.text.trim().isNotEmpty;
    if (hasText != _hasText) {
      setState(() => _hasText = hasText);
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onTextChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(
          top: BorderSide(
            color: AppColors.indigo.withOpacity(0.15),
            width: 1,
          ),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Mic button
          _IconCircleButton(
            icon: Icons.mic_none_rounded,
            onTap: () {},
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: 8),
          // Input field
          Expanded(
            child: Container(
              constraints: const BoxConstraints(minHeight: 48, maxHeight: 130),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: widget.focusNode.hasFocus
                      ? AppColors.indigo.withOpacity(0.5)
                      : AppColors.indigo.withOpacity(0.18),
                  width: 1.2,
                ),
              ),
              child: TextField(
                controller: widget.controller,
                focusNode: widget.focusNode,
                enabled: !widget.isLoading,
                maxLines: null,
                textInputAction: TextInputAction.newline,
                keyboardType: TextInputType.multiline,
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontSize: 14.5,
                  height: 1.5,
                ),
                decoration: InputDecoration(
                  hintText: 'Ask anything about medicine…',
                  hintStyle: GoogleFonts.inter(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 13,
                  ),
                ),
                onSubmitted: (_) {
                  if (_hasText && !widget.isLoading) {
                    widget.onSend(widget.controller.text);
                  }
                },
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Send button
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            transitionBuilder: (child, animation) => ScaleTransition(
              scale: animation,
              child: child,
            ),
            child: widget.isLoading
                ? _LoadingCircle(key: const ValueKey('loading'))
                : _SendButton(
                    key: const ValueKey('send'),
                    enabled: _hasText,
                    onTap: () => widget.onSend(widget.controller.text),
                  ),
          ),
        ],
      ),
    );
  }
}

class _IconCircleButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final Color color;

  const _IconCircleButton({
    required this.icon,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: AppColors.surface,
          shape: BoxShape.circle,
          border: Border.all(
            color: AppColors.indigo.withOpacity(0.18),
            width: 1,
          ),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
    );
  }
}

class _SendButton extends StatelessWidget {
  final bool enabled;
  final VoidCallback onTap;

  const _SendButton({super.key, required this.enabled, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          gradient: enabled
              ? LinearGradient(
                  colors: [AppColors.indigo, AppColors.violet],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: enabled ? null : AppColors.surface,
          shape: BoxShape.circle,
          boxShadow: enabled
              ? [
                  BoxShadow(
                    color: AppColors.indigo.withOpacity(0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
          border: enabled
              ? null
              : Border.all(
                  color: AppColors.indigo.withOpacity(0.18),
                  width: 1,
                ),
        ),
        child: Icon(
          Icons.arrow_upward_rounded,
          color: enabled ? Colors.white : AppColors.textSecondary,
          size: 20,
        ),
      ),
    );
  }
}

class _LoadingCircle extends StatelessWidget {
  const _LoadingCircle({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: AppColors.surface,
        shape: BoxShape.circle,
        border: Border.all(
          color: AppColors.indigo.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.indigo),
        ),
      ),
    );
  }
}
