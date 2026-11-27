import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStoreProvider, useStore } from '@/store/AppStore';
import { useTheme } from '@/theme';

function RootStack() {
  const t = useTheme();
  const { ready } = useStore();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.card },
        headerTintColor: t.primary,
        headerTitleStyle: { color: t.text },
        contentStyle: { backgroundColor: t.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-food" options={{ title: 'Lebensmittel hinzufügen', presentation: 'modal' }} />
      <Stack.Screen name="custom-food" options={{ title: 'Eigenes Lebensmittel', presentation: 'modal' }} />
      <Stack.Screen name="workout" options={{ title: 'Training', presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <StatusBar style="auto" />
        <RootStack />
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
