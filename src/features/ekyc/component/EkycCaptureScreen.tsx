import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Screen, PItem } from '@/components/phone';
import { Button, Tag } from '@/components/ui';
import type { EkycStackParamList } from '@/navigation/types';
import { CAPTURE_HINT, CAPTURE_STEPS, FRAME_HINT } from '../constant';

type Nav = NativeStackNavigationProp<EkycStackParamList, 'EkycCapture'>;

/**
 * Màn 3 — eKYC chụp CCCD (luồng A1.2).
 * Giao diện tĩnh theo yêu cầu: khung ngắm được vẽ lại, không mở camera thật.
 */
export default function EkycCaptureScreen() {
  const nav = useNavigation<Nav>();
  const [stepIndex, setStepIndex] = useState(1);

  const statusOf = (i: number) =>
    i < stepIndex
      ? ({ tone: 'green', label: '✓ Xong' } as const)
      : i === stepIndex
        ? ({ tone: 'blue', label: 'Đang chụp' } as const)
        : ({ tone: 'gray', label: 'Chưa' } as const);

  const onCapture = () => {
    if (stepIndex < CAPTURE_STEPS.length - 1) {
      setStepIndex(i => i + 1);
      return;
    }
    nav.navigate('Liveness');
  };

  return (
    <Screen light>
      <Text style={styles.title} accessibilityRole="header">
        eKYC — định danh
      </Text>

      <View style={styles.frame} accessibilityLabel="Khung ngắm chụp căn cước">
        <Text style={styles.frameText}>{FRAME_HINT}</Text>
      </View>

      {CAPTURE_STEPS.map((s, i) => {
        const st = statusOf(i);
        return (
          <PItem
            key={s.key}
            label={s.label}
            value={<Tag tone={st.tone} small>{st.label}</Tag>}
            last={i === CAPTURE_STEPS.length - 1}
          />
        );
      })}

      <Button label="Chụp" icon="scan" onPress={onCapture} style={styles.action} />
      <Text style={styles.hint}>{CAPTURE_HINT}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...Text_.heading, color: Colors.ink, textAlign: 'center', marginTop: Spacing.xl },
  frame: {
    height: 225,
    marginVertical: Spacing.xxl,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: Colors.brand,
    borderRadius: Radius.xl,
    backgroundColor: Colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameText: {
    ...Text_.bodyBold,
    color: Colors.brand,
    textAlign: 'center',
  },
  action: { marginTop: Spacing.xxl },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
