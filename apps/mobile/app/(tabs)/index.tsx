import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <View className='bg-surface-700'>
      <Text className="will-change-variable text-foreground-600 underline text-2xl font-bold">Tab One</Text>
      <View className="bg-surface-800" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

