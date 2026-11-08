import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing, Text_ } from '@/theme';
import { WaveBackdrop } from '@/components/phone';
import LegalHeader from '../components/LegalHeader';
import TermsSectionView from '../components/TermsSectionView';
import { TERMS_INTRO, TERMS_SECTIONS, TERMS_UPDATED_AT } from '../constants/termsOfUse';

/** Cùng bề ngang cột nội dung với các màn của tab Hồ sơ (`PROFILE_MAX_WIDTH` của feature `account`). */
const CONTENT_MAX_WIDTH = 480;

/**
 * Hồ sơ › Điều khoản: điều khoản sử dụng FINORA, chỉ đọc. Nội dung tĩnh trong app nên không có trạng thái tải hay
 * lỗi. Vẽ theo màn "Thông tin tài khoản" (nền sóng, đầu màn không thẻ, thẻ trắng).
 */
export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, CONTENT_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn, để trên máy màn cao lớp sóng đáy vẫn sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={HOME_WAVES} width={width} />

        <View style={[styles.content, { paddingTop: insets.top + Spacing.xs }]}>
          <LegalHeader title="Điều khoản sử dụng" />
          <View style={styles.card}>
            <Text style={styles.updated}>Cập nhật ngày {TERMS_UPDATED_AT}</Text>
            <Text style={styles.intro}>{TERMS_INTRO}</Text>
            {TERMS_SECTIONS.map(section => (
              <Fragment key={section.title}>
                <View style={styles.divider} />
                <TermsSectionView section={section} />
              </Fragment>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng trên cùng của ảnh sóng: kéo quá đà lộ ra phía trên vẫn liền màu.
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  // Cùng lề với màn Hồ sơ để thẻ không nhảy ngang khi chuyển qua lại; đáy chừa một dải cho lớp sóng đáy.
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.page },
  card: {
    marginTop: Spacing.lg,
    gap: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    ...SoftShadow.card,
  },
  updated: { ...Text_.caption, color: Colors.authMuted },
  intro: { ...Text_.micro, color: Colors.ink2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.rowDivider },
});
