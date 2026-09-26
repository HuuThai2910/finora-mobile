import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { IconSize, Radius } from '@/theme';
import { Icon } from '@/components/ui';

/** Cùng cỡ ô biểu tượng của các dòng cài đặt ở màn Hồ sơ, để hai màn liền mạch khi chuyển qua lại. */
export const INFO_TILE_SIZE = 40;

/** Ô vuông bo góc nền xanh nhạt chứa icon Lucide xanh — dùng ở đầu thẻ và đầu mỗi dòng. */
export default function AccountInfoTile({ icon }: { icon: IconName }) {
  return (
    <View style={styles.tile}>
      <Icon name={icon} size={IconSize.xs} color={Colors.authPrimary} strokeWidth={1.9} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: INFO_TILE_SIZE,
    height: INFO_TILE_SIZE,
    borderRadius: Radius.sm,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
