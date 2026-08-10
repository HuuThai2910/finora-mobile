import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { IconSize, MIN_TOUCH, Radius, Spacing, Text_ } from '@/theme';

type Props = {
  title: string;
  /** Câu mô tả nội dung bên trong để người dùng biết có đáng mở hay không. */
  hint?: string;
  children: React.ReactNode;
};

/**
 * Nhóm thông tin tra cứu (dữ liệu đã khai, bằng chứng kỹ thuật) mặc định đóng.
 * Ở bản cũ mọi nhóm đều mở nên phần cần đọc và phần chỉ để đối chiếu trông
 * quan trọng ngang nhau.
 */
export default function DisclosureSection({ title, hint, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen(value => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? `Thu gọn ${title}` : `Mở ${title}`}
        style={({ pressed }) => [styles.header, open && styles.headerOpen, pressed && styles.pressed]}
      >
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
        <Icon
          name={open ? 'chevronLeft' : 'chevronRight'}
          size={IconSize.xs}
          color={Colors.ink3}
        />
      </Pressable>

      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.card,
  },
  headerOpen: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  pressed: { opacity: 0.75 },
  copy: { flex: 1, gap: Spacing.xxs },
  title: { ...Text_.bodyBold, color: Colors.ink },
  hint: { ...Text_.caption, color: Colors.ink3 },
  body: {
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.line,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    backgroundColor: Colors.card,
  },
});
