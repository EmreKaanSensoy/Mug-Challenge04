import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Oyunlaştırma Ayarları
const XP_PER_LEVEL = 100;
const LEVELS = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Staff', 'Principal', 'CTO'];

export default function App() {
  // States
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(0);
  const [musaitMi, setMusaitMi] = useState(true);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  // Animasyon Değerleri
  const progressWidth = useSharedValue(0);
  const scale = useSharedValue(1);

  // Level Atlama Kontrolü
  useEffect(() => {
    if (xp >= XP_PER_LEVEL) {
      if (level < LEVELS.length - 1) {
        setLevel(prev => prev + 1);
        setXp(0);
        addAchievement('Level Up! 🚀');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setXp(XP_PER_LEVEL);
      }
    }
    progressWidth.value = withSpring((xp / XP_PER_LEVEL) * 100);
  }, [xp]);

  const addAchievement = (title: string) => {
    if (!achievements.includes(title)) {
      setAchievements(prev => [title, ...prev].slice(0, 3));
    }
  };

  const handleAction = (type: 'hire' | 'coffee' | 'review') => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (type) {
      case 'hire':
        if (musaitMi) {
          setMusaitMi(false);
          setXp(prev => prev + 50);
          addAchievement('İlk Maaş 💰');
        }
        break;
      case 'coffee':
        setXp(prev => prev + 15);
        addAchievement('Kafein Canavarı ☕');
        break;
      case 'review':
        setXp(prev => prev + 25);
        addAchievement('Bug Avcısı 🐛');
        break;
    }
  };

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.background}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>DevQuest RPG</Text>
          <Text style={styles.subtitle}>XP Kazan ve Seviye Atla</Text>
        </View>

        <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
          <BlurView intensity={80} tint="dark" style={styles.glassCard}>
            {/* Status & Level Badge */}
            <View style={styles.upperInfo}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>LVL {level + 1}</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusIndicator, { backgroundColor: musaitMi ? '#4ADE80' : '#F87171' }]} />
                <Text style={styles.statusText}>{musaitMi ? 'Müsait' : 'Meşgul'}</Text>
              </View>
            </View>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.avatarBorder}>
                <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
              </LinearGradient>
              {musaitMi && <View style={styles.onlineBadge} />}
            </View>

            {/* Title Section */}
            <View style={styles.infoSection}>
              <Text style={styles.nameText}>Antigravity Dev</Text>
              <Text style={styles.roleText}>{LEVELS[level]} Developer</Text>
            </View>

            {/* XP Bar */}
            <View style={styles.xpContainer}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>Deneyim (XP)</Text>
                <Text style={styles.xpValue}>{xp} / {XP_PER_LEVEL}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View style={[styles.progressBarFill, animatedProgressStyle]}>
                  <LinearGradient
                    colors={['#3B82F6', '#60A5FA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
            </View>

            {/* Achievements */}
            {achievements.length > 0 && (
              <View style={styles.achievementsContainer}>
                {achievements.map((item, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Interaction Buttons */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={[styles.actionBtn, !musaitMi && styles.disabledBtn]} 
                onPress={() => handleAction('hire')}
                disabled={!musaitMi}
              >
                <Ionicons name="briefcase" size={24} color="#FFF" />
                <Text style={styles.actionBtnText}>{musaitMi ? 'İşe Al' : 'İşe Alındı'}</Text>
                <Text style={styles.xpGainText}>+50 XP</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('coffee')}>
                <Ionicons name="cafe" size={24} color="#FFF" />
                <Text style={styles.actionBtnText}>Kahve Ismarla</Text>
                <Text style={styles.xpGainText}>+15 XP</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('review')}>
                <Ionicons name="code-working" size={24} color="#FFF" />
                <Text style={styles.actionBtnText}>Code Review</Text>
                <Text style={styles.xpGainText}>+25 XP</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>

        {/* Info Footer */}
        <TouchableOpacity style={styles.resetBtn} onPress={() => { setXp(0); setLevel(0); setMusaitMi(true); setAchievements([]); }}>
          <Text style={styles.resetText}>Kariyeri Sıfırla</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  background: { ...StyleSheet.absoluteFillObject },
  scrollContent: { padding: 20, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 5 },
  cardContainer: { width: '100%', borderRadius: 32, overflow: 'hidden', elevation: 15, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 15 },
  glassCard: { padding: 24, alignItems: 'center' },
  upperInfo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 15 },
  levelBadge: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  levelBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarBorder: { padding: 4, borderRadius: 100 },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#1E293B' },
  onlineBadge: { position: 'absolute', bottom: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: '#4ADE80', borderWidth: 3, borderColor: '#1E293B' },
  infoSection: { alignItems: 'center', marginBottom: 20 },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  roleText: { fontSize: 16, color: '#60A5FA', marginTop: 4, fontWeight: '600' },
  xpContainer: { width: '100%', marginBottom: 20 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { color: '#94A3B8', fontSize: 12 },
  xpValue: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  achievementsContainer: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  badgeText: { color: '#60A5FA', fontSize: 11, fontWeight: 'bold' },
  actionsGrid: { width: '100%', gap: 12 },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  disabledBtn: { opacity: 0.5 },
  actionBtnText: { color: '#FFF', flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '600' },
  xpGainText: { color: '#4ADE80', fontWeight: 'bold', fontSize: 13 },
  resetBtn: { marginTop: 30, opacity: 0.5 },
  resetText: { color: '#94A3B8', fontSize: 13, textDecorationLine: 'underline' }
});
