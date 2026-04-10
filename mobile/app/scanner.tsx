import { StyleSheet, Text, View, TouchableOpacity, Alert, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/contexts/app-theme';

const BACKEND_IP = '10.0.77.135';
const FASTAPI_URL = `http://${BACKEND_IP}:8000`;

type ScanState = {
  status: 'IDLE' | 'VALIDATING' | 'VALID' | 'EXPIRED' | 'INVALID';
  name?: string;
  qrCode?: string;
};

export default function ScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>({ status: 'IDLE' });

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.textSubtle} />
          <Text style={[styles.message, { color: colors.textMuted }]}>
            We need your permission to show the camera
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanState.status !== 'IDLE') return;

    if (!data.startsWith('VISITOR:')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScanState({ status: 'INVALID' });
      setTimeout(() => setScanState({ status: 'IDLE' }), 3000);
      return;
    }

    const qrCode = data.replace('VISITOR:', '');
    setScanState({ status: 'VALIDATING' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await fetch(`${FASTAPI_URL}/api/visitor/validate/${qrCode}`);
      const result = await response.json();

      if (result.status === 'VALID') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScanState({ status: 'VALID', name: result.name, qrCode });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setScanState({ status: result.status });
        setTimeout(() => setScanState({ status: 'IDLE' }), 3000);
      }
    } catch (error) {
      console.log(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScanState({ status: 'INVALID' });
      setTimeout(() => setScanState({ status: 'IDLE' }), 3000);
    }
  };

  const handleCheckout = async () => {
    if (!scanState.qrCode) return;

    try {
      await fetch(`${FASTAPI_URL}/api/visitor/checkout/${scanState.qrCode}`, {
        method: 'POST',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Visitor checked out successfully');
      setScanState({ status: 'IDLE' });
    } catch {
      Alert.alert('Error', 'Could not check out visitor');
    }
  };

  const statusColor =
    scanState.status === 'VALID'
      ? colors.success
      : scanState.status === 'EXPIRED' || scanState.status === 'INVALID'
        ? colors.danger
        : scanState.status === 'VALIDATING'
          ? colors.warning
          : colors.tint;

  const overlayBg = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(15,23,42,0.45)';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Scan QR</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.cameraContainer, { borderColor: colors.border }]}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={handleBarcodeScanned}>
          <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
            <View style={[styles.scanBox, { borderColor: statusColor }]} />
          </View>
        </CameraView>
      </View>

      <View style={[styles.detailsContainer, { backgroundColor: colors.bg }]}>
        {scanState.status === 'IDLE' && (
          <Text style={[styles.idleText, { color: colors.textSubtle }]}>
            Point at a visitor QR code to validate their pass.
          </Text>
        )}

        {scanState.status === 'VALIDATING' && (
          <Text style={[styles.validatingText, { color: colors.warning }]}>Verifying pass…</Text>
        )}

        {scanState.status === 'VALID' && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={[styles.resultName, { color: colors.text }]}>{scanState.name}</Text>
            <Text style={[styles.resultStatus, { color: colors.success }]}>ACTIVE PASS</Text>

            <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: colors.tint }]} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>Check out visitor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setScanState({ status: 'IDLE' })}>
              <Text style={[styles.cancelBtnText, { color: colors.textSubtle }]}>Reset scanner</Text>
            </TouchableOpacity>
          </View>
        )}

        {(scanState.status === 'EXPIRED' || scanState.status === 'INVALID') && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="close-circle" size={48} color={colors.danger} />
            <Text style={[styles.resultName, { color: colors.text }]}>
              {scanState.status === 'EXPIRED' ? 'Pass expired' : 'Unauthorized pass'}
            </Text>
            <Text style={[styles.resultStatus, { color: colors.danger }]}>DENY ENTRY</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  cameraContainer: {
    height: 360,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 220,
    height: 220,
    borderWidth: 4,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  detailsContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  validatingText: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultCard: {
    alignItems: 'center',
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  resultName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  checkoutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelBtnText: {
    fontWeight: '600',
  },
});
