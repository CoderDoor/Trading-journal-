import 'package:flutter/material.dart';

class AppTheme {
  // Premium Dark Theme - Vibrant Blue-Purple
  static const Color bgPrimary = Color(0xFF0c0a15);      // Deep dark
  static const Color bgSecondary = Color(0xFF161129);    // Rich purple-black
  static const Color bgTertiary = Color(0xFF1f1836);     // Card background
  static const Color bgCard = Color(0xFF1a1430);         // Elevated cards
  
  static const Color accent = Color(0xFF8b5cf6);         // Vibrant purple
  static const Color accentSecondary = Color(0xFF3b82f6); // Blue
  static const Color accentHover = Color(0xFFa78bfa);    // Light purple
  static const Color accentGlow = Color(0x608b5cf6);     // Glow effect
  
  static const Color profit = Color(0xFF34d399);         // Bright emerald green
  static const Color profitGlow = Color(0x5034d399);
  static const Color loss = Color(0xFFf87171);           // Soft red
  static const Color lossGlow = Color(0x50f87171);
  static const Color neutral = Color(0xFFfbbf24);        // Amber
  static const Color running = Color(0xFF60a5fa);        // Sky blue
  
  static const Color textPrimary = Color(0xFFF8FAFC);    // Bright white
  static const Color textSecondary = Color(0xFFCBD5E1);  // Light gray
  static const Color textMuted = Color(0xFF64748B);      // Muted
  
  static const Color border = Color(0x25FFFFFF);         // Subtle border
  static const Color borderFocus = Color(0xFF8b5cf6);    // Focus state

  // Premium Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF8b5cf6), Color(0xFF6366f1), Color(0xFF3b82f6)],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1f1836), Color(0xFF161129)],
  );

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgPrimary,
      primaryColor: accent,
      colorScheme: const ColorScheme.dark(
        primary: accent,
        secondary: accentHover,
        surface: bgSecondary,
        error: loss,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardThemeData(
        color: bgCard,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bgTertiary,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: accent, width: 2),
        ),
        labelStyle: const TextStyle(color: textSecondary),
        hintStyle: const TextStyle(color: textMuted),
        floatingLabelStyle: const TextStyle(color: accent),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textPrimary,
          side: const BorderSide(color: border),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: accent,
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: bgTertiary,
        selectedColor: accentGlow,
        labelStyle: const TextStyle(color: textPrimary, fontWeight: FontWeight.w500),
        side: const BorderSide(color: border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: bgSecondary,
        selectedItemColor: accent,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        showUnselectedLabels: true,
        elevation: 0,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
      ),
      dividerTheme: const DividerThemeData(color: border, thickness: 1),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: bgSecondary,
        contentTextStyle: const TextStyle(color: textPrimary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w800, letterSpacing: -1),
        headlineMedium: TextStyle(color: textPrimary, fontWeight: FontWeight.w700, letterSpacing: -0.5),
        headlineSmall: TextStyle(color: textPrimary, fontWeight: FontWeight.w600),
        titleLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: textPrimary, fontWeight: FontWeight.w500),
        titleSmall: TextStyle(color: textSecondary),
        bodyLarge: TextStyle(color: textPrimary),
        bodyMedium: TextStyle(color: textSecondary),
        bodySmall: TextStyle(color: textMuted),
        labelLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w600),
      ),
    );
  }

  // Light Theme - Complete
  static ThemeData get lightTheme {
    const bgPrimaryLight = Color(0xFFF8FAFC);
    const bgSecondaryLight = Color(0xFFFFFFFF);
    const bgTertiaryLight = Color(0xFFF1F5F9);
    const textPrimaryLight = Color(0xFF0f172a);
    const textSecondaryLight = Color(0xFF475569);
    const textMutedLight = Color(0xFF94a3b8);
    const borderLight = Color(0xFFE2E8F0);
    const accentLight = Color(0xFF7c3aed);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: bgPrimaryLight,
      primaryColor: accentLight,
      colorScheme: const ColorScheme.light(
        primary: accentLight,
        secondary: Color(0xFF6d28d9),
        surface: bgSecondaryLight,
        error: loss,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: textPrimaryLight,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: textPrimaryLight,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardThemeData(
        color: bgSecondaryLight,
        elevation: 2,
        shadowColor: Colors.black12,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderLight),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bgTertiaryLight,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: accentLight, width: 2),
        ),
        labelStyle: const TextStyle(color: textSecondaryLight),
        hintStyle: const TextStyle(color: textMutedLight),
        floatingLabelStyle: const TextStyle(color: accentLight),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentLight,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textPrimaryLight,
          side: const BorderSide(color: borderLight),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: accentLight,
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: bgTertiaryLight,
        selectedColor: accentLight.withOpacity(0.15),
        labelStyle: const TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w500),
        side: const BorderSide(color: borderLight),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgSecondaryLight,
        selectedItemColor: accentLight,
        unselectedItemColor: textMutedLight,
        type: BottomNavigationBarType.fixed,
        showUnselectedLabels: true,
        elevation: 8,
        selectedLabelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
        unselectedLabelStyle: TextStyle(fontSize: 11),
      ),
      dividerTheme: const DividerThemeData(color: borderLight, thickness: 1),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: textPrimaryLight,
        contentTextStyle: const TextStyle(color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w800, letterSpacing: -1),
        headlineMedium: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w700, letterSpacing: -0.5),
        headlineSmall: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w600),
        titleLarge: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w500),
        titleSmall: TextStyle(color: textSecondaryLight),
        bodyLarge: TextStyle(color: textPrimaryLight),
        bodyMedium: TextStyle(color: textSecondaryLight),
        bodySmall: TextStyle(color: textMutedLight),
        labelLarge: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w600),
      ),
    );
  }

  // Outcome color helper
  static Color getOutcomeColor(String? outcome) {
    switch (outcome) {
      case 'WIN': return profit;
      case 'LOSS': return loss;
      case 'BE': return neutral;
      case 'RUNNING': return running;
      default: return textMuted;
    }
  }
}

