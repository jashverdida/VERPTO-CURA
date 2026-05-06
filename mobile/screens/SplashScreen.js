import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { COLORS } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslate = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslate, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate to Login after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Decorative glow orbs */}
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />
      <View style={styles.orbCenter} />

      {/* Logo Section */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconWrapper,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Image
            source={require('../assets/cura-logo.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.logoText}>CURA</Text>
        <Text style={styles.logoSubtext}>PROJECT</Text>
      </Animated.View>

      {/* Subtitle Section */}
      <Animated.View
        style={[
          styles.subtitleContainer,
          {
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslate }],
          },
        ]}
      >
        <Text style={styles.tagline}>
          Community-Unified Response Application
        </Text>
        <View style={styles.divider} />
        <Text style={styles.description}>
          AI-Powered Disaster Coordination
        </Text>
      </Animated.View>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: subtitleOpacity },
        ]}
      >
        <View style={styles.footerBrand}>
          <Text style={styles.footerBy}>by</Text>
          <Image
            source={require('../assets/VERPTO-logo.png')}
            style={styles.verptoLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: subtitleOpacity,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(16,185,129,0.10)',
  },
  orbCenter: {
    position: 'absolute',
    top: '55%',
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(52,211,153,0.07)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  iconImage: {
    width: 120,
    height: 120,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 12,
  },
  logoSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.emerald,
    letterSpacing: 8,
    marginTop: -5,
  },
  subtitleContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.emerald,
    borderRadius: 2,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.40)',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  footerBy: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.30)',
    letterSpacing: 2,
  },
  verptoLogo: {
    height: 18,
    width: 80,
    opacity: 0.5,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emerald,
  },
});
