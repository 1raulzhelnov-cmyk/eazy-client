/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { validateEnv } from './src/utils/env';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

function SmokeScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode ? Colors.black : Colors.white }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: isDarkMode ? Colors.white : Colors.black }}>
        Client App is running
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    validateEnv();
    const timeoutId = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <SafeAreaView style={[backgroundStyle, { flex: 1 }] }>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundStyle.backgroundColor} />
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode ? Colors.black : Colors.white }}>
          <ActivityIndicator size="large" color={isDarkMode ? Colors.white : Colors.black} />
          <Text style={{ marginTop: 12, fontSize: 16, color: isDarkMode ? Colors.white : Colors.black }}>Загрузка…</Text>
        </View>
      ) : (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Smoke" component={SmokeScreen} options={{ title: 'Smoke Test' }} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
