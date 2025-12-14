// Mobile Application Template Generator
// Generates React Native + Expo Router files

import type { UnifiedAppSchema, PageSchema, NavigationSchema } from '@/types/app-schema'

export interface MobileFile {
  path: string
  content: string
  language: string
}

export function generateMobileTemplate(schema: UnifiedAppSchema): MobileFile[] {
  const files: MobileFile[] = []
  const { meta, design, structure, features } = schema

  // package.json
  files.push({
    path: 'package.json',
    content: generatePackageJson(meta, features),
    language: 'json',
  })

  // app.json (Expo config)
  files.push({
    path: 'app.json',
    content: generateAppJson(meta),
    language: 'json',
  })

  // tsconfig.json
  files.push({
    path: 'tsconfig.json',
    content: generateTsConfig(),
    language: 'json',
  })

  // babel.config.js
  files.push({
    path: 'babel.config.js',
    content: `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};`,
    language: 'javascript',
  })

  // expo-env.d.ts
  files.push({
    path: 'expo-env.d.ts',
    content: `/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your .gitignore`,
    language: 'typescript',
  })

  // Constants
  files.push({
    path: 'constants/Colors.ts',
    content: generateColors(design),
    language: 'typescript',
  })

  // App layout
  files.push({
    path: 'app/_layout.tsx',
    content: generateRootLayout(schema),
    language: 'typescript',
  })

  // Determine navigation type
  const navType = structure.navigation?.type || 'tabs'

  if (navType === 'tabs') {
    // Tab navigation layout
    files.push({
      path: 'app/(tabs)/_layout.tsx',
      content: generateTabsLayout(structure.navigation),
      language: 'typescript',
    })

    // Generate tab screens
    const tabPages = structure.pages.filter((p) =>
      structure.navigation?.items?.some((item) => item.path === p.path)
    )

    tabPages.forEach((page, index) => {
      const fileName = index === 0 ? 'index' : page.path.replace(/^\//, '').replace(/\//g, '-')
      files.push({
        path: `app/(tabs)/${fileName}.tsx`,
        content: generateScreen(schema, page),
        language: 'typescript',
      })
    })
  } else {
    // Stack navigation
    files.push({
      path: 'app/index.tsx',
      content: generateHomeScreen(schema),
      language: 'typescript',
    })
  }

  // Additional screens (non-tab)
  structure.pages
    .filter(
      (p) =>
        p.path !== '/' && !structure.navigation?.items?.some((item) => item.path === p.path)
    )
    .forEach((page) => {
      const fileName = page.path.replace(/^\//, '').replace(/\//g, '-')
      files.push({
        path: `app/${fileName}.tsx`,
        content: generateScreen(schema, page),
        language: 'typescript',
      })
    })

  // Components
  files.push({
    path: 'components/Button.tsx',
    content: generateButtonComponent(design),
    language: 'typescript',
  })

  files.push({
    path: 'components/Card.tsx',
    content: generateCardComponent(design),
    language: 'typescript',
  })

  files.push({
    path: 'components/ThemedText.tsx',
    content: generateThemedText(),
    language: 'typescript',
  })

  files.push({
    path: 'components/ThemedView.tsx',
    content: generateThemedView(),
    language: 'typescript',
  })

  // Lib files
  files.push({
    path: 'lib/utils.ts',
    content: `export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}`,
    language: 'typescript',
  })

  if (features.database || features.auth) {
    files.push({
      path: 'lib/supabase.ts',
      content: generateSupabaseClient(),
      language: 'typescript',
    })
  }

  // Hooks
  files.push({
    path: 'hooks/useColorScheme.ts',
    content: generateUseColorScheme(),
    language: 'typescript',
  })

  // Auth screens if enabled
  if (features.auth?.enabled) {
    files.push({
      path: 'app/login.tsx',
      content: generateLoginScreen(features.auth),
      language: 'typescript',
    })

    files.push({
      path: 'app/signup.tsx',
      content: generateSignupScreen(features.auth),
      language: 'typescript',
    })
  }

  return files
}

function generatePackageJson(meta: any, features: any): string {
  const deps: Record<string, string> = {
    expo: '~50.0.0',
    'expo-router': '~3.4.0',
    'expo-status-bar': '~1.11.0',
    'expo-linking': '~6.2.0',
    'expo-constants': '~15.4.0',
    'expo-font': '~11.10.0',
    'expo-splash-screen': '~0.26.0',
    'expo-system-ui': '~2.9.0',
    react: '18.2.0',
    'react-native': '0.73.0',
    'react-native-safe-area-context': '4.8.2',
    'react-native-screens': '~3.29.0',
    '@expo/vector-icons': '^14.0.0',
  }

  if (features.database || features.auth) {
    deps['@supabase/supabase-js'] = '^2.38.0'
    deps['expo-secure-store'] = '~12.8.0'
    deps['@react-native-async-storage/async-storage'] = '1.21.0'
  }

  return JSON.stringify(
    {
      name: meta.name.toLowerCase().replace(/\s+/g, '-'),
      version: meta.version || '1.0.0',
      main: 'expo-router/entry',
      scripts: {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
      },
      dependencies: deps,
      devDependencies: {
        '@babel/core': '^7.20.0',
        '@types/react': '~18.2.14',
        typescript: '^5.1.3',
      },
      private: true,
    },
    null,
    2
  )
}

function generateAppJson(meta: any): string {
  return JSON.stringify(
    {
      expo: {
        name: meta.name,
        slug: meta.name.toLowerCase().replace(/\s+/g, '-'),
        version: meta.version || '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: meta.name.toLowerCase().replace(/\s+/g, ''),
        userInterfaceStyle: 'automatic',
        splash: {
          image: './assets/images/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
        assetBundlePatterns: ['**/*'],
        ios: {
          supportsTablet: true,
          bundleIdentifier: `com.${meta.name.toLowerCase().replace(/\s+/g, '')}`,
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/images/adaptive-icon.png',
            backgroundColor: '#ffffff',
          },
          package: `com.${meta.name.toLowerCase().replace(/\s+/g, '')}`,
        },
        web: {
          bundler: 'metro',
          output: 'static',
          favicon: './assets/images/favicon.png',
        },
        plugins: ['expo-router'],
        experiments: {
          typedRoutes: true,
        },
      },
    },
    null,
    2
  )
}

function generateTsConfig(): string {
  return JSON.stringify(
    {
      extends: 'expo/tsconfig.base',
      compilerOptions: {
        strict: true,
        paths: {
          '@/*': ['./*'],
        },
      },
      include: ['**/*.ts', '**/*.tsx', '.expo/types/**/*.ts', 'expo-env.d.ts'],
    },
    null,
    2
  )
}

function generateColors(design: any): string {
  const { colors } = design
  return `const tintColorLight = '${colors.primary}';
const tintColorDark = '${colors.accent}';

export default {
  light: {
    text: '${colors.foreground}',
    background: '${colors.background}',
    tint: tintColorLight,
    tabIconDefault: '${colors.muted}',
    tabIconSelected: tintColorLight,
    primary: '${colors.primary}',
    secondary: '${colors.secondary}',
    accent: '${colors.accent}',
    border: '${colors.border}',
    muted: '${colors.muted}',
  },
  dark: {
    text: '${colors.background}',
    background: '${colors.foreground}',
    tint: tintColorDark,
    tabIconDefault: '${colors.muted}',
    tabIconSelected: tintColorDark,
    primary: '${colors.primary}',
    secondary: '${colors.secondary}',
    accent: '${colors.accent}',
    border: '${colors.border}',
    muted: '${colors.muted}',
  },
};`
}

function generateRootLayout(schema: any): string {
  return `import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="signup" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}`
}

function generateTabsLayout(navigation: NavigationSchema | undefined): string {
  const items = navigation?.items || [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'explore', label: 'Explore', icon: 'compass' },
  ]

  return `import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}>
      ${items
        .map(
          (item, index) => `<Tabs.Screen
        name="${index === 0 ? 'index' : item.path?.replace(/^\//, '') || item.id}"
        options={{
          title: '${item.label}',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? '${item.icon || 'home'}' : '${item.icon || 'home'}-outline'} size={24} color={color} />
          ),
        }}
      />`
        )
        .join('\n      ')}
    </Tabs>
  );
}`
}

function generateHomeScreen(schema: any): string {
  return `import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.hero}>
        <ThemedText style={styles.title}>${schema.meta.name}</ThemedText>
        <ThemedText style={styles.subtitle}>${schema.meta.description}</ThemedText>
        <Button title="Get Started" onPress={() => {}} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
});`
}

function generateScreen(schema: any, page: PageSchema): string {
  return `import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ${page.name.replace(/\s+/g, '')}Screen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>${page.title}</ThemedText>
        ${page.description ? `<ThemedText style={styles.description}>${page.description}</ThemedText>` : ''}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
  },
});`
}

function generateButtonComponent(design: any): string {
  return `import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextColor = () => {
    return variant === 'outline' ? colors.text : '#ffffff';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});`
}

function generateCardComponent(design: any): string {
  return `import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});`
}

function generateThemedText(): string {
  return `import { Text, TextProps, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ThemedText({ style, ...props }: TextProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return <Text style={[{ color: colors.text }, style]} {...props} />;
}`
}

function generateThemedView(): string {
  return `import { View, ViewProps } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ThemedView({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return <View style={[{ backgroundColor: colors.background }, style]} {...props} />;
}`
}

function generateUseColorScheme(): string {
  return `import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  return _useColorScheme() ?? 'light';
}`
}

function generateSupabaseClient(): string {
  return `import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});`
}

function generateLoginScreen(auth: any): string {
  return `import { useState } from 'react';
import { StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Welcome Back</ThemedText>
        <ThemedText style={styles.subtitle}>Sign in to your account</ThemedText>

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={loading ? 'Signing in...' : 'Sign In'}
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        />

        <ThemedText style={styles.link}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: colors.primary }}>
            Sign up
          </Link>
        </ThemedText>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  link: {
    textAlign: 'center',
    marginTop: 24,
  },
});`
}

function generateSignupScreen(auth: any): string {
  return `import { useState } from 'react';
import { StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSignup = async () => {
    if (password.length < ${auth.passwordMinLength || 8}) {
      Alert.alert('Error', 'Password must be at least ${auth.passwordMinLength || 8} characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      ${auth.requireEmailVerification ? `Alert.alert('Success', 'Check your email for verification link');` : `router.replace('/');`}
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={loading ? 'Creating account...' : 'Sign Up'}
          onPress={handleSignup}
          disabled={loading}
          style={styles.button}
        />

        <ThemedText style={styles.link}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: colors.primary }}>
            Sign in
          </Link>
        </ThemedText>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  link: {
    textAlign: 'center',
    marginTop: 24,
  },
});`
}
