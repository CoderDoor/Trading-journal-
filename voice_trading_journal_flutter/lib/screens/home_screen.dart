import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../models/journal_entry.dart';
import '../providers/journal_provider.dart';
import '../widgets/journal_form.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  final SpeechToText _speech = SpeechToText();
  bool _isVoiceMode = true;
  bool _isRecording = false;
  bool _isFormStep = false;
  bool _speechAvailable = false;
  String _transcript = '';
  String _textInput = '';
  final TextEditingController _textController = TextEditingController();
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _initSpeech();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )..repeat(reverse: true);
  }

  Future<void> _initSpeech() async {
    final status = await Permission.microphone.request();
    if (status.isGranted) {
      _speechAvailable = await _speech.initialize(
        onError: (error) {
          setState(() => _isRecording = false);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Speech error: ${error.errorMsg}'),
                backgroundColor: AppTheme.loss,
              ),
            );
          }
        },
      );
      setState(() {});
    } else if (status.isPermanentlyDenied) {
      // Show dialog to open settings
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: AppTheme.bgCard,
            title: const Row(
              children: [
                Icon(Icons.mic_off, color: AppTheme.loss),
                SizedBox(width: 8),
                Text('Microphone Permission Needed', style: TextStyle(color: Colors.white)),
              ],
            ),
            content: const Text(
              'TrackEdge needs microphone access to record your trade journal entries via voice. Please enable it in Settings.',
              style: TextStyle(color: Colors.white70),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  openAppSettings();
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accent),
                child: const Text('Open Settings'),
              ),
            ],
          ),
        );
      }
    } else {
      // Permission denied - show snackbar
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Microphone permission is required for voice recording. Tap to enable.'),
            backgroundColor: AppTheme.accent,
            action: SnackBarAction(
              label: 'Enable',
              textColor: Colors.white,
              onPressed: () => _initSpeech(),
            ),
          ),
        );
      }
    }
  }

  void _toggleRecording() async {
    if (_isRecording) {
      await _speech.stop();
      setState(() => _isRecording = false);
    } else {
      if (_speechAvailable) {
        setState(() {
          _isRecording = true;
          _transcript = '';
        });
        await _speech.listen(
          onResult: (result) {
            setState(() {
              _transcript = result.recognizedWords;
            });
          },
          listenFor: const Duration(minutes: 5),
          pauseFor: const Duration(seconds: 3),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Speech recognition not available. Please enable microphone permission.'),
            backgroundColor: AppTheme.neutral,
          ),
        );
      }
    }
  }

  void _proceedToForm() {
    setState(() => _isFormStep = true);
  }

  void _goBack() {
    setState(() => _isFormStep = false);
  }

  Future<void> _saveEntry(JournalEntry entry) async {
    final provider = context.read<JournalProvider>();
    final success = await provider.createEntry(entry);
    
    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: const [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 8),
                Text('Trade saved successfully!'),
              ],
            ),
            backgroundColor: AppTheme.profit,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
        setState(() {
          _isFormStep = false;
          _transcript = '';
          _textInput = '';
          _textController.clear();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${provider.error}'),
            backgroundColor: AppTheme.loss,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _isFormStep
            ? JournalForm(
                transcript: _isVoiceMode ? _transcript : _textInput,
                onSave: _saveEntry,
                onBack: _goBack,
              )
            : _buildInputStep(),
      ),
    );
  }

  Widget _buildInputStep() {
    final provider = context.watch<JournalProvider>();
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Row(
            children: [
              const Text('🎙️', style: TextStyle(fontSize: 32)),
              const SizedBox(width: 12),
              ShaderMask(
                shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                child: const Text(
                  'Voice Trading Journal',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Speak or type your trade details',
            style: TextStyle(color: AppTheme.textMuted, fontSize: 14),
          ),
          const SizedBox(height: 24),

          // Quick Stats
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.bgTertiary, AppTheme.bgSecondary],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildQuickStat('Total', provider.totalTrades.toString(), AppTheme.accent),
                _buildQuickStat('Wins', provider.wins.toString(), AppTheme.profit),
                _buildQuickStat('Losses', provider.losses.toString(), AppTheme.loss),
                _buildQuickStat('Win Rate', '${provider.winRate.toStringAsFixed(0)}%', 
                    provider.winRate >= 50 ? AppTheme.profit : AppTheme.loss),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Mode Toggle
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppTheme.bgTertiary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(child: _buildModeButton('🎙️ Voice', _isVoiceMode, () => setState(() => _isVoiceMode = true))),
                const SizedBox(width: 4),
                Expanded(child: _buildModeButton('⌨️ Text', !_isVoiceMode, () => setState(() => _isVoiceMode = false))),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Voice Mode
          if (_isVoiceMode) ...[
            Center(
              child: GestureDetector(
                onTap: _toggleRecording,
                child: AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    return Container(
                      width: 140,
                      height: 140,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: _isRecording ? null : AppTheme.primaryGradient,
                        color: _isRecording ? AppTheme.loss : null,
                        boxShadow: [
                          BoxShadow(
                            color: (_isRecording ? AppTheme.loss : AppTheme.accent)
                                .withOpacity(_isRecording ? 0.3 + _pulseController.value * 0.3 : 0.4),
                            blurRadius: _isRecording ? 30 + _pulseController.value * 20 : 30,
                            spreadRadius: _isRecording ? _pulseController.value * 10 : 0,
                          ),
                        ],
                      ),
                      child: Icon(
                        _isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                        size: 56,
                        color: Colors.white,
                      ),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),
            Center(
              child: AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  color: _isRecording ? AppTheme.loss : AppTheme.textMuted,
                  fontSize: 16,
                  fontWeight: _isRecording ? FontWeight.w600 : FontWeight.normal,
                ),
                child: Text(_isRecording ? '🔴 Recording... Tap to stop' : 'Tap the microphone to start'),
              ),
            ),
            if (_transcript.isNotEmpty) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.bgTertiary,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.accent.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.text_snippet, color: AppTheme.accent, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'Transcript',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AppTheme.accent,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _transcript,
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        height: 1.5,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],

          // Text Mode
          if (!_isVoiceMode) ...[
            TextField(
              controller: _textController,
              maxLines: 6,
              onChanged: (v) => setState(() => _textInput = v),
              style: const TextStyle(fontSize: 15, height: 1.5),
              decoration: InputDecoration(
                hintText: 'Describe your trade...\n\nExample: "Sold EURUSD at 1.0850, stop loss 1.0880, target 1.0780, BOS confirmed on 15M, London session"',
                hintStyle: TextStyle(color: AppTheme.textMuted.withOpacity(0.6)),
                filled: true,
                fillColor: AppTheme.bgTertiary,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppTheme.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppTheme.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppTheme.accent),
                ),
              ),
            ),
          ],

          const SizedBox(height: 32),

          // Proceed Button
          if ((_isVoiceMode && _transcript.isNotEmpty) || (!_isVoiceMode && _textInput.isNotEmpty))
            Container(
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accent.withOpacity(0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ElevatedButton(
                onPressed: _proceedToForm,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Text('Continue to Form', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    SizedBox(width: 8),
                    Icon(Icons.arrow_forward_rounded),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildQuickStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: AppTheme.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildModeButton(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          color: active ? AppTheme.accent : Colors.transparent,
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: active ? Colors.white : AppTheme.textMuted,
              fontWeight: active ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    _pulseController.dispose();
    _speech.stop();
    super.dispose();
  }
}
