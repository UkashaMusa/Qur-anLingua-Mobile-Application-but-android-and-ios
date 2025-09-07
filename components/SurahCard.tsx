import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';

interface SurahCardProps {
  surah: {
    id: number;
    name: string;
    arabicName: string;
    verses: number;
    type: string;
  };
  onPress: (id: number) => void;
}

export function SurahCard({ surah, onPress }: SurahCardProps) {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(surah.id)}
      accessibilityRole="button"
      accessibilityLabel={`Surah ${surah.name}, ${surah.verses} verses, ${surah.type}`}
    >
      <View style={styles.numberBadge}>
        <Text style={styles.number}>{surah.id}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{surah.name}</Text>
          <Text style={styles.arabicName}>{surah.arabicName}</Text>
        </View>
        <Text style={styles.meta}>
          {surah.verses} verses • {surah.type}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colorScheme: 'light' | 'dark' | null | undefined) {
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    numberBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#059669',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    number: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    name: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      flex: 1,
    },
    arabicName: {
      fontSize: 16,
      color: isDark ? '#D1D5DB' : '#4B5563',
      textAlign: 'right',
      marginLeft: 12,
    },
    meta: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
  });
}