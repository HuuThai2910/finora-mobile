import { createElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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

/** Trình xem web dùng blob URL đã tải có xác thực, không đưa bearer token vào iframe. */
export default function ContractPdfViewer({ visible, uri, title, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng PDF" onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Đóng</Text>
          </Pressable>
        </View>
        {uri
          ? createElement('iframe', {
              src: uri,
              title,
              style: { width: '100%', height: '100%', border: 0, backgroundColor: Colors.card },
            })
          : null}
      </View>
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
});
