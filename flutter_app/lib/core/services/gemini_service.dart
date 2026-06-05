import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_constants.dart';

final geminiServiceProvider = Provider<GeminiService>((ref) {
  return GeminiService(Dio());
});

class ChatMessage {
  final String role; // 'user' | 'model'
  final String text;
  final DateTime timestamp;

  const ChatMessage({
    required this.role,
    required this.text,
    required this.timestamp,
  });
}

class GeminiService {
  final Dio _dio;

  // Dr. Astro system prompt — mirrors the web app's AI behavior
  static const String _systemPrompt = '''
You are Dr. Astro, an expert AI medical education assistant for MBBS students. 
You specialize in helping medical students understand complex concepts, prepare for exams, 
and learn clinical medicine effectively.

Guidelines:
- Provide accurate, evidence-based medical information
- Use clear, student-friendly explanations
- Reference mnemonics and memory aids where helpful  
- Always encourage students to consult textbooks and clinical experience
- For clinical decisions, always remind students to consult a qualified physician
- Be encouraging and supportive in your tone
- Format responses with bullet points and headers for clarity

You assist with: Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology, 
Medicine, Surgery, Obstetrics & Gynecology, Pediatrics, and all other medical subjects.
''';

  GeminiService(this._dio);

  final List<Map<String, dynamic>> _conversationHistory = [];

  Future<String> sendMessage(String userMessage) async {
    _conversationHistory.add({
      'role': 'user',
      'parts': [{'text': userMessage}],
    });

    final requestBody = {
      'system_instruction': {
        'parts': [{'text': _systemPrompt}],
      },
      'contents': _conversationHistory,
      'generationConfig': {
        'temperature': 0.7,
        'topP': 0.95,
        'maxOutputTokens': 2048,
      },
    };

    try {
      final response = await _dio.post(
        '${AppConstants.geminiApiUrl}?key=${AppConstants.geminiApiKey}',
        data: json.encode(requestBody),
        options: Options(
          headers: {'Content-Type': 'application/json'},
          receiveTimeout: const Duration(seconds: 30),
        ),
      );

      final data = response.data as Map<String, dynamic>;
      final candidates = data['candidates'] as List<dynamic>;
      final content = candidates[0]['content'] as Map<String, dynamic>;
      final parts = content['parts'] as List<dynamic>;
      final text = parts[0]['text'] as String;

      _conversationHistory.add({
        'role': 'model',
        'parts': [{'text': text}],
      });

      return text;
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception('API Error: ${e.response?.statusCode} — ${e.response?.data}');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  void clearHistory() {
    _conversationHistory.clear();
  }
}
