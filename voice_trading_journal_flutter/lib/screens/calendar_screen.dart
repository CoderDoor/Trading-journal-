import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../models/journal_entry.dart';
import '../providers/journal_provider.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JournalProvider>().loadEntries();
    });
  }

  List<JournalEntry> _getEventsForDay(DateTime day, List<JournalEntry> entries) {
    return entries.where((e) {
      return e.createdAt.year == day.year &&
          e.createdAt.month == day.month &&
          e.createdAt.day == day.day;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<JournalProvider>(
          builder: (ctx, provider, _) {
            final selectedEntries = _selectedDay != null
                ? _getEventsForDay(_selectedDay!, provider.entries)
                : <JournalEntry>[];

            return Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      const Text('📅', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      const Text('Calendar', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),

                // Calendar
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: TableCalendar<JournalEntry>(
                    firstDay: DateTime.utc(2020, 1, 1),
                    lastDay: DateTime.utc(2030, 12, 31),
                    focusedDay: _focusedDay,
                    selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                    eventLoader: (day) => _getEventsForDay(day, provider.entries),
                    startingDayOfWeek: StartingDayOfWeek.monday,
                    calendarStyle: CalendarStyle(
                      outsideDaysVisible: false,
                      defaultTextStyle: const TextStyle(color: AppTheme.textPrimary),
                      weekendTextStyle: const TextStyle(color: AppTheme.textSecondary),
                      todayDecoration: BoxDecoration(
                        color: AppTheme.accent.withOpacity(0.3),
                        shape: BoxShape.circle,
                      ),
                      todayTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      selectedDecoration: const BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        shape: BoxShape.circle,
                      ),
                      selectedTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      markerDecoration: const BoxDecoration(
                        color: AppTheme.accent,
                        shape: BoxShape.circle,
                      ),
                      markersMaxCount: 3,
                      cellMargin: const EdgeInsets.all(4),
                    ),
                    headerStyle: HeaderStyle(
                      formatButtonVisible: false,
                      titleCentered: true,
                      titleTextStyle: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      leftChevronIcon: const Icon(Icons.chevron_left, color: AppTheme.accent),
                      rightChevronIcon: const Icon(Icons.chevron_right, color: AppTheme.accent),
                      headerPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    daysOfWeekStyle: const DaysOfWeekStyle(
                      weekdayStyle: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w500),
                      weekendStyle: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w500),
                    ),
                    onDaySelected: (selectedDay, focusedDay) {
                      setState(() {
                        _selectedDay = selectedDay;
                        _focusedDay = focusedDay;
                      });
                    },
                    onPageChanged: (focusedDay) => _focusedDay = focusedDay,
                    calendarBuilders: CalendarBuilders(
                      markerBuilder: (context, day, events) {
                        if (events.isEmpty) return null;
                        
                        final wins = events.where((e) => e.outcome == 'WIN').length;
                        final losses = events.where((e) => e.outcome == 'LOSS').length;
                        Color dotColor = AppTheme.neutral;
                        if (wins > losses) dotColor = AppTheme.profit;
                        else if (losses > wins) dotColor = AppTheme.loss;
                        
                        return Positioned(
                          bottom: 1,
                          child: Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
                          ),
                        );
                      },
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Selected Day Entries
                Expanded(
                  child: selectedEntries.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.event_note, size: 40, color: AppTheme.textMuted.withOpacity(0.5)),
                              const SizedBox(height: 12),
                              Text(
                                _selectedDay != null
                                    ? 'No trades on ${DateFormat('MMM d').format(_selectedDay!)}'
                                    : 'Select a day to view trades',
                                style: TextStyle(color: AppTheme.textMuted),
                              ),
                            ],
                          ),
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 20),
                              child: Text(
                                DateFormat('EEEE, MMM d').format(_selectedDay!),
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Expanded(
                              child: ListView.builder(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                itemCount: selectedEntries.length,
                                itemBuilder: (ctx, i) => _buildEntryCard(selectedEntries[i]),
                              ),
                            ),
                          ],
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildEntryCard(JournalEntry entry) {
    final outcomeColor = AppTheme.getOutcomeColor(entry.outcome);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 40,
            decoration: BoxDecoration(color: outcomeColor, borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(entry.instrument ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(width: 8),
                    if (entry.tradeType != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: (entry.tradeType == 'BUY' ? AppTheme.profit : AppTheme.loss).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          entry.tradeType!,
                          style: TextStyle(
                            color: entry.tradeType == 'BUY' ? AppTheme.profit : AppTheme.loss,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      DateFormat('h:mm a').format(entry.createdAt),
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    ),
                    if (entry.riskReward != null) ...[
                      const SizedBox(width: 12),
                      Text('1:${entry.riskReward!.toStringAsFixed(1)}',
                          style: const TextStyle(color: AppTheme.accent, fontSize: 12)),
                    ],
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: outcomeColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              entry.outcome ?? 'N/A',
              style: TextStyle(color: outcomeColor, fontWeight: FontWeight.w600, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
