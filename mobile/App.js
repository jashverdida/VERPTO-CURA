import 'react-native-url-polyfill/auto';
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/theme';

// Screens
import SplashScreen              from './screens/SplashScreen';
import LoginScreen               from './screens/LoginScreen';
import RegistrationScreen        from './screens/RegistrationScreen';
import PasswordVerificationScreen from './screens/PasswordVerificationScreen';
import DashboardScreen           from './screens/DashboardScreen';
import AlertsScreen              from './screens/AlertsScreen';
import MapScreen                 from './screens/MapScreen';
import SettingsScreen            from './screens/SettingsScreen';
import UserProfileScreen         from './screens/UserProfileScreen';
import CameraScreen              from './screens/CameraScreen';
import ReportScreen              from './screens/ReportScreen';
import EmergencyTypeScreen       from './screens/EmergencyTypeScreen';
import TriageChatScreen          from './screens/TriageChatScreen';
import ResponderDispatchScreen   from './screens/ResponderDispatchScreen';
import ResponderCommsScreen      from './screens/ResponderCommsScreen';
import ResponderLogsScreen       from './screens/ResponderLogsScreen';
import AdminDashboardScreen      from './screens/AdminDashboardScreen';
import StationDashboardScreen    from './screens/StationDashboardScreen';
import LocationPickerScreen      from './screens/LocationPickerScreen';

// Responder screens
import ResponderMapScreen        from './screens/ResponderMapScreen';
import ResponderStatusScreen     from './screens/ResponderStatusScreen';
import ResponderChatScreen       from './screens/ResponderChatScreen';
import ResponderProfileScreen    from './screens/ResponderProfileScreen';
import ResponderAlertsScreen     from './screens/ResponderAlertsScreen';

/* ════════════════════════════════════════════════════════════════════
   CUSTOM BOTTOM TAB BAR  (shared by Citizens + Responders)
   ══════════════════════════════════════════════════════════════════ */

const { width: SCREEN_W } = Dimensions.get('window');
const N_TABS  = 5;
const TAB_W   = SCREEN_W / N_TABS;

const PROTRUDE  = 28;
const ORB_WRAP  = 66;
const ORB_SOLID = 50;
const BAR_H     = 58;

const orbTarget = (idx) => idx * TAB_W + (TAB_W - ORB_WRAP) / 2;

const FOCUSED_LBL_TOP  = 30 + 5;
const INACTIVE_ICON_TOP = Math.round((BAR_H - 21) / 2);
const INACTIVE_LBL_GAP  = 3;

const EMERALD = '#10B981';

// ── Citizen tab definitions ──
const CITIZEN_TABS = [
  { name: 'Profile',  on: 'person',        off: 'person-outline'       },
  { name: 'Status',   on: 'pulse',          off: 'pulse-outline'         },
  { name: 'Map',      on: 'map',            off: 'map-outline'           },
  { name: 'Alerts',   on: 'notifications',  off: 'notifications-outline' },
  { name: 'Settings', on: 'settings',       off: 'settings-outline'      },
];

// ── Responder tab definitions ──
const RESPONDER_TABS = [
  { name: 'Profile',  on: 'person',       off: 'person-outline'        },
  { name: 'Status',   on: 'list',          off: 'list-outline'          },
  { name: 'Map',      on: 'map',           off: 'map-outline'           },
  { name: 'Chat',     on: 'chatbubbles',   off: 'chatbubbles-outline'   },
  { name: 'Alerts',   on: 'notifications', off: 'notifications-outline' },
];

// ── Citizen colours ──
const CITIZEN_SCREEN_BASE = [
  '#04101E',  // Profile
  '#031929',  // Status
  '#F4F8FC',  // Map — light
  '#0C0518',  // Alerts
  '#0A1020',  // Settings
];
const CITIZEN_SCREEN_GRAD = [
  ['rgba(8,30,68,0.90)',   'rgba(2,8,18,1)'],
  ['rgba(4,38,68,0.90)',   'rgba(2,14,28,1)'],
  ['rgba(244,248,252,1)',  'rgba(225,236,248,1)'],
  ['rgba(26,6,52,0.90)',   'rgba(6,2,16,1)'],
  ['rgba(14,22,46,0.90)',  'rgba(4,10,22,1)'],
];

// ── Responder colours ──
const RESPONDER_SCREEN_BASE = [
  '#04101E',  // Profile
  '#031929',  // Status
  '#F4F8FC',  // Map — light
  '#090F1E',  // Chat
  '#0A1020',  // Alerts
];
const RESPONDER_SCREEN_GRAD = [
  ['rgba(8,30,68,0.90)',   'rgba(2,8,18,1)'],
  ['rgba(4,38,68,0.90)',   'rgba(2,14,28,1)'],
  ['rgba(244,248,252,1)',  'rgba(225,236,248,1)'],
  ['rgba(12,18,42,0.90)',  'rgba(4,8,22,1)'],
  ['rgba(14,22,46,0.90)',  'rgba(4,10,22,1)'],
];

// Map is always index 2 for both citizen and responder tabs
const isLight = (idx) => idx === 2;

/* ── Shared CustomTabBar — accepts tabDefs, screenBase, screenGrad as props ── */
function CustomTabBar({ state, navigation, tabDefs, screenBase, screenGrad }) {
  const insets = useSafeAreaInsets();
  const light  = isLight(state.index);

  const orbX            = useRef(new Animated.Value(orbTarget(state.index))).current;
  const bgAnim          = useRef(new Animated.Value(state.index)).current;
  const fadeIn          = useRef(new Animated.Value(0)).current;
  const prevGradOpacity = useRef(new Animated.Value(1)).current;
  const curGradOpacity  = useRef(new Animated.Value(0)).current;
  const curIdxRef       = useRef(state.index);
  const [gradIds, setGradIds] = useState({ prev: state.index, cur: state.index });

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const newIdx = state.index;
    const oldIdx = curIdxRef.current;
    if (newIdx === oldIdx) return;

    curIdxRef.current = newIdx;

    prevGradOpacity.setValue(1);
    curGradOpacity.setValue(0);
    setGradIds({ prev: oldIdx, cur: newIdx });

    Animated.parallel([
      Animated.spring(orbX, {
        toValue: orbTarget(newIdx),
        friction: 6, tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: newIdx, duration: 480,
        useNativeDriver: false,
      }),
      Animated.timing(prevGradOpacity, { toValue: 0, duration: 480, useNativeDriver: true }),
      Animated.timing(curGradOpacity,  { toValue: 1, duration: 480, useNativeDriver: true }),
    ]).start();
  }, [state.index]);

  const animBgColor = bgAnim.interpolate({
    inputRange:  [0, 1, 2, 3, 4],
    outputRange: screenBase,
  });

  const inactiveColor  = light ? 'rgba(0,0,0,0.40)'  : 'rgba(255,255,255,0.45)';
  const activeLblColor = light ? COLORS.emeraldDark   : EMERALD;
  const borderColor    = light ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.07)';

  const containerH = BAR_H + insets.bottom;

  return (
    <Animated.View style={{ height: containerH, opacity: fadeIn, overflow: 'visible' }}>

      <Animated.View
        style={[
          tb.barBg,
          {
            height:          BAR_H + insets.bottom,
            backgroundColor: animBgColor,
            borderTopColor:  borderColor,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { opacity: prevGradOpacity }]}
        >
          <LinearGradient
            colors={screenGrad[gradIds.prev]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { opacity: curGradOpacity }]}
        >
          <LinearGradient
            colors={screenGrad[gradIds.cur]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[tb.orbWrapper, { transform: [{ translateX: orbX }] }]}
      >
        <View style={tb.glow3} />
        <View style={tb.glow2} />
        <View style={tb.glow1} />
        <View style={tb.orbCircle} />
        <View style={tb.iconInOrb}>
          <Ionicons
            name={tabDefs[state.index]?.on ?? 'help-circle'}
            size={26}
            color="#FFFFFF"
          />
        </View>
      </Animated.View>

      <View style={[tb.tabRow, { bottom: insets.bottom, height: BAR_H }]}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const tab = tabDefs.find(t => t.name === route.name) ?? tabDefs[0];
          return (
            <TouchableOpacity
              key={route.key}
              style={tb.tabItem}
              onPress={() => {
                const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!ev.defaultPrevented) navigation.navigate(route.name);
              }}
              activeOpacity={0.7}
            >
              {!focused && (
                <Ionicons
                  name={tab.off}
                  size={21}
                  color={inactiveColor}
                  style={{ marginTop: INACTIVE_ICON_TOP }}
                />
              )}
              <Text
                style={[
                  tb.label,
                  {
                    color:      focused ? activeLblColor : inactiveColor,
                    fontWeight: focused ? '700' : '500',
                    marginTop:  focused ? FOCUSED_LBL_TOP : INACTIVE_LBL_GAP,
                  },
                ]}
              >
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </Animated.View>
  );
}

const tb = StyleSheet.create({
  barBg: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  orbWrapper: {
    position: 'absolute',
    top: -PROTRUDE,
    width:  ORB_WRAP,
    height: ORB_WRAP,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  glow3: {
    position: 'absolute',
    width: ORB_WRAP, height: ORB_WRAP,
    borderRadius: ORB_WRAP / 2,
    backgroundColor: 'rgba(16,185,129,0.13)',
  },
  glow2: {
    position: 'absolute',
    width: ORB_WRAP - 12, height: ORB_WRAP - 12,
    borderRadius: (ORB_WRAP - 12) / 2,
    backgroundColor: 'rgba(16,185,129,0.22)',
  },
  glow1: {
    position: 'absolute',
    width: ORB_WRAP - 20, height: ORB_WRAP - 20,
    borderRadius: (ORB_WRAP - 20) / 2,
    backgroundColor: 'rgba(16,185,129,0.34)',
  },
  orbCircle: {
    width: ORB_SOLID, height: ORB_SOLID,
    borderRadius: ORB_SOLID / 2,
    backgroundColor: EMERALD,
    shadowColor:   EMERALD,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius:  14,
    elevation: 0,
  },
  iconInOrb: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 1,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
});

/* ════════════════════════════════════════════════════════════════════
   NAVIGATORS
   ══════════════════════════════════════════════════════════════════ */

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          tabDefs={CITIZEN_TABS}
          screenBase={CITIZEN_SCREEN_BASE}
          screenGrad={CITIZEN_SCREEN_GRAD}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Profile"  component={UserProfileScreen} />
      <Tab.Screen name="Status"   component={DashboardScreen}   />
      <Tab.Screen name="Map"      component={MapScreen}         />
      <Tab.Screen name="Alerts"   component={AlertsScreen}      />
      <Tab.Screen name="Settings" component={SettingsScreen}    />
    </Tab.Navigator>
  );
}

function ResponderTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          tabDefs={RESPONDER_TABS}
          screenBase={RESPONDER_SCREEN_BASE}
          screenGrad={RESPONDER_SCREEN_GRAD}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Profile"  component={ResponderProfileScreen} />
      <Tab.Screen name="Status"   component={ResponderStatusScreen}  />
      <Tab.Screen name="Map"      component={ResponderMapScreen}     />
      <Tab.Screen name="Chat"     component={ResponderChatScreen}    />
      <Tab.Screen name="Alerts"   component={ResponderAlertsScreen}  />
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
            Overview:  focused ? 'shield'   : 'shield-outline',
            Incidents: focused ? 'warning'  : 'warning-outline',
            Units:     focused ? 'people'   : 'people-outline',
            Settings:  focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor:   COLORS.emerald,
        tabBarInactiveTintColor: COLORS.slate400,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor:  'rgba(255,255,255,0.08)',
          borderTopWidth:  1,
          height:          64,
          paddingBottom:   10,
          paddingTop:      8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Overview"  component={AdminDashboardScreen} />
      <Tab.Screen name="Incidents" component={AdminDashboardScreen} />
      <Tab.Screen name="Units"     component={AdminDashboardScreen} />
      <Tab.Screen name="Settings"  component={SettingsScreen}       />
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
            Dashboard: focused ? 'business'      : 'business-outline',
            Reports:   focused ? 'document-text' : 'document-text-outline',
            Map:       focused ? 'map'           : 'map-outline',
            Settings:  focused ? 'settings'      : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor:   COLORS.emerald,
        tabBarInactiveTintColor: COLORS.slate400,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor:  'rgba(255,255,255,0.08)',
          borderTopWidth:  1,
          height:          64,
          paddingBottom:   10,
          paddingTop:      8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={StationDashboardScreen} />
      <Tab.Screen name="Reports"   component={StationDashboardScreen} />
      <Tab.Screen name="Map"       component={MapScreen}              />
      <Tab.Screen name="Settings"  component={SettingsScreen}         />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: true }}
      >
        <Stack.Screen name="Splash"               component={SplashScreen}              options={{ animation: 'fade'              }} />
        <Stack.Screen name="Login"                component={LoginScreen}               options={{ animation: 'fade'              }} />
        <Stack.Screen name="Registration"         component={RegistrationScreen}        options={{ animation: 'slide_from_right'  }} />
        <Stack.Screen name="PasswordVerification" component={PasswordVerificationScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="MainTabs"             component={MainTabs}                  options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ResponderTabs"        component={ResponderTabs}             options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="AdminTabs"            component={AdminTabs}                 options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="StationTabs"          component={StationTabs}               options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Camera"               component={CameraScreen}              options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="ReportEmergency"      component={ReportScreen}              options={{ animation: 'slide_from_bottom', presentation: 'modal'           }} />
        <Stack.Screen name="EmergencyType"        component={EmergencyTypeScreen}       options={{ animation: 'fade',              presentation: 'transparentModal' }} />
        <Stack.Screen name="TriageChat"           component={TriageChatScreen}          options={{ animation: 'slide_from_right'  }} />
        <Stack.Screen name="LocationPicker"       component={LocationPickerScreen}      options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
