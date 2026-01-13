import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../theme/app_theme.dart';
import '../models/journal_entry.dart';

class JournalForm extends StatefulWidget {
  final String transcript;
  final Function(JournalEntry) onSave;
  final VoidCallback onBack;

  const JournalForm({
    super.key,
    required this.transcript,
    required this.onSave,
    required this.onBack,
  });

  @override
  State<JournalForm> createState() => _JournalFormState();
}

class _JournalFormState extends State<JournalForm> {
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  // Form fields
  String? _instrument, _tradeType, _timeframe, _outcome, _emotionState;
  String? _tradeReason, _strategyLogic, _whatWentWell, _whatWentWrong, _improvement;
  double? _entryPrice, _stopLoss, _target, _riskReward;
  String? _screenshotBase64;
  File? _screenshotFile;
  
  // Checklist
  bool _htfBiasAligned = false, _liquidityTaken = false, _entryAtPOI = false;
  bool _riskManaged = false, _bosConfirmed = false, _mssConfirmed = false;
  bool _chochConfirmed = false, _orderBlockEntry = false, _fvgEntry = false;
  bool _killZoneEntry = false;
  
  // Sessions
  bool _asianSession = false, _londonSession = false, _nySession = false, _londonClose = false;

  final _instruments = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'US30', 'NAS100'];
  final _tradeTypes = ['BUY', 'SELL'];
  final _timeframes = ['1M', '5M', '15M', '1H', '4H', 'D'];
  final _outcomes = ['WIN', 'LOSS', 'BE', 'RUNNING'];
  final _emotions = ['CALM', 'CONFIDENT', 'FEAR', 'FOMO', 'REVENGE', 'ANXIOUS'];

  @override
  void initState() {
    super.initState();
    _parseTranscript();
  }

  void _parseTranscript() {
    final text = widget.transcript.toUpperCase();
    
    // Parse instrument
    for (var inst in _instruments) {
      if (text.contains(inst)) {
        _instrument = inst;
        break;
      }
    }
    
    // Parse trade type
    if (text.contains('BUY') || text.contains('LONG')) _tradeType = 'BUY';
    if (text.contains('SELL') || text.contains('SHORT')) _tradeType = 'SELL';
    
    // Parse prices with regex
    final priceRegex = RegExp(r'(\d+\.?\d*)');
    final prices = priceRegex.allMatches(text).map((m) => double.tryParse(m.group(0) ?? '')).where((p) => p != null && p > 0).toList();
    if (prices.length >= 1) _entryPrice = prices[0];
    if (prices.length >= 2) _stopLoss = prices[1];
    if (prices.length >= 3) _target = prices[2];
    
    // Parse timeframe
    for (var tf in _timeframes) {
      if (text.contains(tf) || text.contains('${tf}M') || text.contains('${tf}H')) {
        _timeframe = tf;
        break;
      }
    }

    // Parse strategies
    if (text.contains('BOS')) _bosConfirmed = true;
    if (text.contains('MSS')) _mssConfirmed = true;
    if (text.contains('CHOCH')) _chochConfirmed = true;
    if (text.contains('ORDER BLOCK') || text.contains('OB')) _orderBlockEntry = true;
    if (text.contains('FVG') || text.contains('IMBALANCE')) _fvgEntry = true;
    if (text.contains('KILL ZONE') || text.contains('KILLZONE')) _killZoneEntry = true;
    
    // Parse sessions
    if (text.contains('ASIAN')) _asianSession = true;
    if (text.contains('LONDON') && !text.contains('CLOSE')) _londonSession = true;
    if (text.contains('NEW YORK') || text.contains('NY')) _nySession = true;
    if (text.contains('LONDON CLOSE')) _londonClose = true;
    
    setState(() {});
  }

  void _calculateRR() {
    if (_entryPrice != null && _stopLoss != null && _target != null) {
      final risk = (_entryPrice! - _stopLoss!).abs();
      final reward = (_target! - _entryPrice!).abs();
      if (risk > 0) {
        setState(() => _riskReward = double.parse((reward / risk).toStringAsFixed(2)));
      }
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: source,
        maxWidth: 1200,
        maxHeight: 1200,
        imageQuality: 80,
      );
      
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _screenshotFile = File(image.path);
          _screenshotBase64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        });
      }
    } catch (e) {
      debugPrint('Failed to pick image: $e');
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isSubmitting = true);

    final entry = JournalEntry(
      id: '',
      instrument: _instrument,
      tradeType: _tradeType,
      timeframe: _timeframe,
      entryPrice: _entryPrice,
      stopLoss: _stopLoss,
      target: _target,
      riskReward: _riskReward,
      outcome: _outcome,
      tradeReason: _tradeReason,
      strategyLogic: _strategyLogic,
      htfBiasAligned: _htfBiasAligned,
      liquidityTaken: _liquidityTaken,
      entryAtPOI: _entryAtPOI,
      riskManaged: _riskManaged,
      bosConfirmed: _bosConfirmed,
      mssConfirmed: _mssConfirmed,
      chochConfirmed: _chochConfirmed,
      orderBlockEntry: _orderBlockEntry,
      fvgEntry: _fvgEntry,
      killZoneEntry: _killZoneEntry,
      asianSession: _asianSession,
      londonSession: _londonSession,
      nySession: _nySession,
      londonClose: _londonClose,
      emotionState: _emotionState,
      whatWentWell: _whatWentWell,
      whatWentWrong: _whatWentWrong,
      improvement: _improvement,
      rawTranscript: widget.transcript,
      screenshot: _screenshotBase64,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    await widget.onSave(entry);
    if (mounted) setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: widget.onBack,
                ),
                const Expanded(
                  child: Text(
                    '📝 Trade Details',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Trade Info Section
            _buildSectionCard('Trade Info', [
              Row(
                children: [
                  Expanded(child: _buildDropdown('Instrument', _instrument, _instruments, (v) => setState(() => _instrument = v))),
                  const SizedBox(width: 12),
                  Expanded(child: _buildDropdown('Type', _tradeType, _tradeTypes, (v) => setState(() => _tradeType = v))),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildDropdown('Timeframe', _timeframe, _timeframes, (v) => setState(() => _timeframe = v))),
                  const SizedBox(width: 12),
                  Expanded(child: _buildDropdown('Outcome', _outcome, _outcomes, (v) => setState(() => _outcome = v))),
                ],
              ),
            ]),
            const SizedBox(height: 12),

            // Prices Section
            _buildSectionCard('Prices', [
              Row(
                children: [
                  Expanded(child: _buildPriceField('Entry', _entryPrice, (v) { _entryPrice = v; _calculateRR(); })),
                  const SizedBox(width: 12),
                  Expanded(child: _buildPriceField('Stop Loss', _stopLoss, (v) { _stopLoss = v; _calculateRR(); })),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildPriceField('Target', _target, (v) { _target = v; _calculateRR(); })),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.bgTertiary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('R:R', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                          Text(
                            _riskReward != null ? '1:${_riskReward!.toStringAsFixed(1)}' : '-',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.accent),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ]),
            const SizedBox(height: 12),

            // ICT Checklist
            _buildSectionCard('ICT Checklist', [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildCheckChip('HTF Bias', _htfBiasAligned, (v) => setState(() => _htfBiasAligned = v)),
                  _buildCheckChip('Liquidity', _liquidityTaken, (v) => setState(() => _liquidityTaken = v)),
                  _buildCheckChip('POI Entry', _entryAtPOI, (v) => setState(() => _entryAtPOI = v)),
                  _buildCheckChip('Risk Managed', _riskManaged, (v) => setState(() => _riskManaged = v)),
                  _buildCheckChip('BOS', _bosConfirmed, (v) => setState(() => _bosConfirmed = v)),
                  _buildCheckChip('MSS', _mssConfirmed, (v) => setState(() => _mssConfirmed = v)),
                  _buildCheckChip('CHoCH', _chochConfirmed, (v) => setState(() => _chochConfirmed = v)),
                  _buildCheckChip('Order Block', _orderBlockEntry, (v) => setState(() => _orderBlockEntry = v)),
                  _buildCheckChip('FVG', _fvgEntry, (v) => setState(() => _fvgEntry = v)),
                  _buildCheckChip('Kill Zone', _killZoneEntry, (v) => setState(() => _killZoneEntry = v)),
                ],
              ),
            ]),
            const SizedBox(height: 12),

            // Sessions
            _buildSectionCard('Sessions', [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildCheckChip('🌏 Asian', _asianSession, (v) => setState(() => _asianSession = v)),
                  _buildCheckChip('🇬🇧 London', _londonSession, (v) => setState(() => _londonSession = v)),
                  _buildCheckChip('🇺🇸 New York', _nySession, (v) => setState(() => _nySession = v)),
                  _buildCheckChip('🌅 London Close', _londonClose, (v) => setState(() => _londonClose = v)),
                ],
              ),
            ]),
            const SizedBox(height: 12),

            // Reflection
            _buildSectionCard('Reflection', [
              _buildDropdown('Emotion', _emotionState, _emotions, (v) => setState(() => _emotionState = v)),
              const SizedBox(height: 12),
              _buildTextField('Trade Reason', (v) => _tradeReason = v),
              const SizedBox(height: 12),
              _buildTextField('Strategy Logic', (v) => _strategyLogic = v),
              const SizedBox(height: 12),
              _buildTextField('What went well?', (v) => _whatWentWell = v),
              const SizedBox(height: 12),
              _buildTextField('What went wrong?', (v) => _whatWentWrong = v),
              const SizedBox(height: 12),
              _buildTextField('Improvement', (v) => _improvement = v),
            ]),
            const SizedBox(height: 12),

            // Screenshot Upload
            _buildSectionCard('📸 Trade Screenshot', [
              if (_screenshotFile != null)
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.file(
                        _screenshotFile!,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        style: IconButton.styleFrom(backgroundColor: Colors.black54),
                        onPressed: () => setState(() {
                          _screenshotFile = null;
                          _screenshotBase64 = null;
                        }),
                      ),
                    ),
                  ],
                )
              else
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppTheme.bgTertiary,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.border, style: BorderStyle.solid),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.image_outlined, size: 48, color: AppTheme.textMuted),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          ElevatedButton.icon(
                            onPressed: () => _pickImage(ImageSource.camera),
                            icon: const Icon(Icons.camera_alt),
                            label: const Text('Camera'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.accent,
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton.icon(
                            onPressed: () => _pickImage(ImageSource.gallery),
                            icon: const Icon(Icons.photo_library),
                            label: const Text('Gallery'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.bgTertiary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
            ]),
            const SizedBox(height: 24),

            // Submit Button
            ElevatedButton.icon(
              onPressed: _isSubmitting ? null : _submit,
              icon: _isSubmitting
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.save),
              label: Text(_isSubmitting ? 'Saving...' : 'Save Entry'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard(String title, List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown(String label, String? value, List<String> items, Function(String?) onChanged) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(labelText: label),
      items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
      onChanged: onChanged,
    );
  }

  Widget _buildPriceField(String label, double? value, Function(double?) onChanged) {
    return TextFormField(
      initialValue: value?.toString(),
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      decoration: InputDecoration(labelText: label),
      onChanged: (v) => onChanged(double.tryParse(v)),
    );
  }

  Widget _buildTextField(String label, Function(String) onSaved) {
    return TextFormField(
      decoration: InputDecoration(labelText: label),
      onSaved: (v) => onSaved(v ?? ''),
    );
  }

  Widget _buildCheckChip(String label, bool checked, Function(bool) onChanged) {
    return FilterChip(
      label: Text(label),
      selected: checked,
      onSelected: onChanged,
      selectedColor: AppTheme.accentGlow,
      checkmarkColor: AppTheme.accent,
    );
  }
}
