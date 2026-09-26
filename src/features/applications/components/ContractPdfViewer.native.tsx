import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Paths } from 'expo-file-system';
import { Button, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { MIN_TOUCH, Spacing, Text_ } from '@/theme';

type Props = {
  visible: boolean;
  uri: string | null;
  title: string;
  onClose: () => void;
  onShare: () => void;
  sharing: boolean;
};

/** iOS hiển thị PDF cache bằng WKWebView; Android có nút mở ứng dụng hệ thống nếu WebView không hỗ trợ PDF. */
export default function ContractPdfViewer({
  visible,
  uri,
  title,
  onClose,
  onShare,
  sharing,
}: Props) {
  const [loadError, setLoadError] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      onShow={() => setLoadError(false)}
    >
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng PDF" onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Đóng</Text>
          </Pressable>
        </View>

        {uri && !loadError ? (
          <WebView
            source={{ uri }}
            style={styles.viewer}
            originWhitelist={['*']}
            allowFileAccess
            allowingReadAccessToURL={Paths.cache.uri}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.brand} />
                <Text style={styles.loadingText}>Đang mở hợp đồng…</Text>
              </View>
            )}
            onError={() => setLoadError(true)}
          />
        ) : (
          <View style={styles.fallback}>
            <InfoNote tone="warn">
              Trình xem trên thiết bị này chưa đọc được PDF. Bạn có thể mở bằng ứng dụng PDF của hệ điều hành.
            </InfoNote>
            <Button
              label="Mở bằng ứng dụng khác"
              icon="file"
              onPress={onShare}
              loading={sharing}
              disabled={sharing}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.card },
  header: {
    minHeight: 64,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  title: { ...Text_.bodyBold, color: Colors.ink, flex: 1 },
  close: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  closeText: { ...Text_.microBold, color: Colors.brand },
  viewer: { flex: 1, backgroundColor: Colors.surfaceMuted },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  loadingText: { ...Text_.micro, color: Colors.ink2 },
  fallback: { flex: 1, justifyContent: 'center', gap: Spacing.xl, padding: Spacing.xxl },
});
