import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Platform,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/contexts/app-theme';

const BACKEND_IP = '10.0.77.135';
const socket = io(`http://${BACKEND_IP}:4000`);
const FASTAPI_URL = `http://${BACKEND_IP}:8000`;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type DashboardStats = {
  entries_today: number;
  active_on_campus: number;
  total_visitors: number;
};

type OutpassItem = {
  id: string;
  student: string;
  room: string;
  until: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token retrieved:', token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
    token = 'ExponentPushToken[simulator-mock-token]';
  }

  return token;
}

export default function DashboardScreen() {
  const { colors, isDark, toggleMode } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [outpasses, setOutpasses] = useState<OutpassItem[]>([
    {
      id: '1',
      student: 'Aditya Sharma',
      room: 'B-204',
      until: '11:00 PM',
      reason: 'Medical appointment',
      status: 'pending',
    },
    {
      id: '2',
      student: 'Neha Krishnan',
      room: 'C-118',
      until: '10:30 PM',
      reason: 'Family visit',
      status: 'pending',
    },
    {
      id: '3',
      student: 'Vikram Patel',
      room: 'A-412',
      until: '9:00 PM',
      reason: 'Internship interview',
      status: 'pending',
    },
  ]);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchStats = useCallback(async () => {
    setStatsError(false);
    try {
      const res = await fetch(`${FASTAPI_URL}/api/stats`);
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      setStats({
        entries_today: data.entries_today ?? data.visitors ?? 0,
        active_on_campus: data.active_on_campus ?? 0,
        total_visitors: data.total_visitors ?? data.visitors ?? 0,
      });
    } catch {
      setStatsError(true);
      setStats(null);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    fetchStats();

    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      if (token && !token.startsWith('Error')) {
        fetch(`${FASTAPI_URL}/api/alerts/register-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }).catch((err) => console.log('Failed to register token with backend:', err));
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    socket.on('alert', (data) => {
      setAlerts((prev) => [data, ...prev]);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [fadeAnim, fetchStats]);

  const getStatusColor = (status: string) => {
    if (status === 'RED') return colors.danger;
    if (status === 'YELLOW') return colors.warning;
    if (status === 'GREEN') return colors.success;
    return colors.textSubtle;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'RED') return 'alert-circle';
    if (status === 'YELLOW') return 'warning';
    if (status === 'GREEN') return 'checkmark-circle';
    return 'information-circle';
  };

  const resolveOutpass = (id: string, next: 'approved' | 'denied') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOutpasses((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
  };

  const pendingOutpasses = outpasses.filter((o) => o.status === 'pending');

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <Animated.ScrollView
        style={[styles.container, { opacity: fadeAnim }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusPulse,
                      { backgroundColor: expoPushToken ? colors.success : colors.warning },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: colors.textSubtle }]}>
                    {expoPushToken ? 'Push alerts live' : 'Connecting…'}
                  </Text>
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Security dashboard</Text>
                <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
                  Live alerts · Entry stats · Outpass queue
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  toggleMode();
                }}
                style={[styles.themeToggle, { backgroundColor: colors.bgElevated, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.tint} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>ENTRY STATS</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              fetchStats();
            }}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="today-outline" size={22} color={colors.tint} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statsError ? '—' : stats?.entries_today ?? '…'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSubtle }]}>Passes today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              fetchStats();
            }}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="people-outline" size={22} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statsError ? '—' : stats?.active_on_campus ?? '…'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSubtle }]}>On campus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync();
              fetchStats();
            }}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="layers-outline" size={22} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statsError ? '—' : stats?.total_visitors ?? '…'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSubtle }]}>Total records</Text>
          </TouchableOpacity>
        </View>
        {statsError && (
          <Text style={[styles.hint, { color: colors.warning }]}>
            Could not load stats — check API or pull to refresh.
          </Text>
        )}

        <View style={styles.sectionHeadRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSubtle, marginBottom: 0 }]}>
            OUTPASS APPROVALS
          </Text>
          <Text style={[styles.badgeCount, { color: colors.textMuted }]}>
            {pendingOutpasses.length} pending
          </Text>
        </View>
        {pendingOutpasses.length === 0 ? (
          <View style={[styles.emptyOutpass, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="moon-outline" size={28} color={colors.textSubtle} />
            <Text style={[styles.emptyOutpassText, { color: colors.textMuted }]}>No pending outpasses</Text>
          </View>
        ) : (
          pendingOutpasses.map((o) => (
            <View key={o.id} style={[styles.outpassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.outpassTop}>
                <View>
                  <Text style={[styles.outpassName, { color: colors.text }]}>{o.student}</Text>
                  <Text style={[styles.outpassMeta, { color: colors.textSubtle }]}>
                    {o.room} · until {o.until}
                  </Text>
                </View>
              </View>
              <Text style={[styles.outpassReason, { color: colors.textMuted }]}>{o.reason}</Text>
              <View style={styles.outpassActions}>
                <TouchableOpacity
                  style={[styles.approveBtn, { backgroundColor: colors.success + '22' }]}
                  onPress={() => resolveOutpass(o.id, 'approved')}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={[styles.approveBtnText, { color: colors.success }]}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.denyBtn, { backgroundColor: colors.danger + '18' }]}
                  onPress={() => resolveOutpass(o.id, 'denied')}>
                  <Ionicons name="close-circle" size={18} color={colors.danger} />
                  <Text style={[styles.denyBtnText, { color: colors.danger }]}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {outpasses.some((o) => o.status !== 'pending') && (
          <View style={styles.recentRow}>
            <Text style={[styles.subSectionTitle, { color: colors.textSubtle }]}>Recent decisions</Text>
            {outpasses
              .filter((o) => o.status !== 'pending')
              .slice(0, 4)
              .map((o) => (
                <View
                  key={o.id}
                  style={[styles.decisionRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.decisionName, { color: colors.textMuted }]}>{o.student}</Text>
                  <Text
                    style={[
                      styles.decisionStatus,
                      { color: o.status === 'approved' ? colors.success : colors.danger },
                    ]}>
                    {o.status === 'approved' ? 'Approved' : 'Denied'}
                  </Text>
                </View>
              ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>REAL-TIME ALERTS</Text>

        {alerts.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="notifications-outline" size={32} color={colors.textSubtle} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No alerts yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSubtle }]}>
              Alerts from the gate AI appear here instantly.
            </Text>
          </View>
        ) : (
          alerts.map((alert, i) => {
            const color = getStatusColor(alert.status);
            return (
              <View key={i} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.cardBorder, { backgroundColor: color }]} />
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTime, { color: colors.textSubtle }]}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                    <Ionicons name={getStatusIcon(alert.status) as any} size={12} color={color} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color }]}>{alert.status} ALERT</Text>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
                    {alert.identity || 'Unknown subject'}
                  </Text>
                  <Text style={[styles.cardSub, { color: colors.textSubtle }]}>
                    Confidence:{' '}
                    {alert.confidence ? `${(alert.confidence * 100).toFixed(0)}%` : 'N/A'} · Gate feed
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </Animated.ScrollView>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/scanner');
        }}
        style={({ pressed }) => [
          styles.fab,
          {
            bottom: insets.bottom + 20,
            backgroundColor: colors.tint,
            opacity: pressed ? 0.92 : 1,
            shadowColor: isDark ? '#000' : '#1e293b',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open QR scanner">
        <Ionicons name="qr-code" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  themeToggle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
    paddingLeft: 2,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  outpassCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  outpassTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outpassName: {
    fontSize: 17,
    fontWeight: '700',
  },
  outpassMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  outpassReason: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  outpassActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  approveBtnText: {
    fontWeight: '800',
    fontSize: 14,
  },
  denyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  denyBtnText: {
    fontWeight: '800',
    fontSize: 14,
  },
  emptyOutpass: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyOutpassText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  recentRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  decisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  decisionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  decisionStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    paddingLeft: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
