
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { colors } from '@/theme/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ title: 'Criar conta' }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="game/[id]" options={{ title: 'Jogo' }} />
              <Stack.Screen name="game-form" options={{ presentation: 'modal' }} />
              <Stack.Screen name="payment" options={{ title: 'Pagamento' }} />
              <Stack.Screen name="wishlist" options={{ title: 'Lista de desejos' }} />
            </Stack>
          </SafeAreaProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
