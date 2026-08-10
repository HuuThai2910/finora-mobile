import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/providers/AuthProvider';
import { FontProvider } from '@/providers/FontProvider';
import RootNavigator from '@/navigation/RootNavigator';
import { ServerStateProvider } from '@/app/providers';

export default function App() {
  return (
    <SafeAreaProvider>
      <ServerStateProvider>
        <FontProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </AuthProvider>
        </FontProvider>
      </ServerStateProvider>
    </SafeAreaProvider>
  );
}
