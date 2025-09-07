import { Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';

interface QuranTextProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export function QuranText({ text, size = 'medium', style }: QuranTextProps) {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme, size);

  return (
    <Text style={[styles.arabicText, style]} accessibilityRole="text">
      {text}
    </Text>
  );
}

function createStyles(colorScheme: 'light' | 'dark' | null | undefined, size: string) {
  const isDark = colorScheme === 'dark';
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: 16, lineHeight: 24 };
      case 'large':
        return { fontSize: 24, lineHeight: 36 };
      default:
        return { fontSize: 20, lineHeight: 32 };
    }
  };

  return StyleSheet.create({
    arabicText: {
      ...getSizeStyles(),
      fontWeight: '500',
      textAlign: 'right',
      color: isDark ? '#FFFFFF' : '#1F2937',
      fontFamily: 'System', // Fallback to system Arabic font
    },
  });
}