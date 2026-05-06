import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/theme';

// Existing Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import AlertsScreen from './screens/AlertsScreen';
import MapScreen from './screens/MapScreen';
import SettingsScreen from './screens/SettingsScreen';
import CameraScreen from './screens/CameraScreen';

// Responder Screens
import ResponderDispatchScreen from './screens/ResponderDispatchScreen';
import ResponderCommsScreen from './screens/ResponderCommsScreen';
import ResponderLogsScreen from './screens/ResponderLogsScreen';

// Role Dashboards
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import StationDashboardScreen from './screens/StationDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Status') {
            iconName = focused ? 'pulse' : 'pulse-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.emerald,
        tabBarInactiveTintColor: COLORS.slate400,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.slate200,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Status" component={DashboardScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function ResponderTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dispatch"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dispatch') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'Comms') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'Logs') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.warning, // Yellow for tactical visibility
        tabBarInactiveTintColor: COLORS.slate500,
        tabBarStyle: {
          backgroundColor: '#121212', // Dark tactical theme
          borderTopColor: '#333',
          borderTopWidth: 2,
          height: 70, // Slightly taller for glove-friendliness
          paddingBottom: 15,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 1,
        },
      })}
    >
      <Tab.Screen name="Dispatch" component={ResponderDispatchScreen} />
      <Tab.Screen name="Comms" component={ResponderCommsScreen} />
      <Tab.Screen name="Logs" component={ResponderLogsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Overview: focused ? 'shield' : 'shield-outline',
            Incidents: focused ? 'warning' : 'warning-outline',
            Units: focused ? 'people' : 'people-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.emerald,
        tabBarInactiveTintColor: COLORS.slate400,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Overview" component={AdminDashboardScreen} />
      <Tab.Screen name="Incidents" component={AdminDashboardScreen} />
      <Tab.Screen name="Units" component={AdminDashboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function StationTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'business' : 'business-outline',
            Reports: focused ? 'document-text' : 'document-text-outline',
            Map: focused ? 'map' : 'map-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.emerald,
        tabBarInactiveTintColor: COLORS.slate400,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={StationDashboardScreen} />
      <Tab.Screen name="Reports" component={StationDashboardScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ResponderTabs"
          component={ResponderTabs}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="AdminTabs"
          component={AdminTabs}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="StationTabs"
          component={StationTabs}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
