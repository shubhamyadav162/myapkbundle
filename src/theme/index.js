// Theme configuration for the application

// Color palette
const colors = {
  primary: '#E50914', // Netflix Brand Red
  secondary: '#E50914', // Netflix Brand Red
  background: '#000000', // Deep Black
  backgroundLight: '#1F1F1F', // Slightly lighter background
  text: '#FFFFFF', // Primary Text
  textSecondary: '#F5F5F5', // Muted Text
  accent: '#D4AF37', // Gold Accent
  highlight: '#E50914', // Netflix Brand Red
  border: '#333333', // Gray border
  success: '#2E7D32', // Green for success messages
  error: '#D32F2F', // Red for error messages
  warning: '#FFA000', // Amber for warnings
  inactive: '#9E9E9E', // Gray for inactive elements
  backdrop: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
};

// Typography
const typography = {
  fontFamily: 'System',
  fontSize: {
    tiny: 10,
    small: 12,
    medium: 14,
    regular: 16,
    large: 18,
    xlarge: 20,
    xxlarge: 24,
    title: 28,
    header: 32,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
};

// Spacing
const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

// Border radiuses
const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  circular: 100,
};

// Shadows
const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Theme for React Native Elements
export const theme = {
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    white: colors.text,
    black: colors.secondary,
    grey0: colors.textSecondary,
    grey1: colors.border,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
  },
  Button: {
    raised: true,
    buttonStyle: {
      borderRadius: borderRadius.medium,
      paddingVertical: spacing.medium,
    },
    titleStyle: {
      fontWeight: typography.fontWeight.medium,
    },
  },
  Input: {
    containerStyle: {
      paddingHorizontal: 0,
    },
    inputContainerStyle: {
      borderBottomColor: colors.border,
    },
    inputStyle: {
      color: colors.text,
    },
    labelStyle: {
      color: colors.textSecondary,
    },
    errorStyle: {
      color: colors.error,
    },
  },
  Card: {
    containerStyle: {
      backgroundColor: colors.backgroundLight,
      borderColor: colors.border,
      borderRadius: borderRadius.medium,
      ...shadows.medium,
    },
    titleStyle: {
      color: colors.text,
      fontSize: typography.fontSize.large,
    },
  },
};

// Export all the theme components
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
}; 
