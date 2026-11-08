import { Switch } from '@/components/ui';
import SettingsTileRow from './SettingsTileRow';

type Props = {
  pushEnabled: boolean;
  disabled: boolean;
  onChange: (pushEnabled: boolean) => void;
};

/** Công tắc push chung cho mọi loại thông báo, theo nhịp dòng cài đặt của tab Hồ sơ. */
export default function PushToggleRow({ pushEnabled, disabled, onChange }: Props) {
  return (
    <SettingsTileRow
      icon="bell"
      title="Nhận thông báo đẩy"
      subtitle="Gọi vốn, hợp đồng, giải ngân, trả nợ, ví và các cập nhật khác"
      right={<Switch value={pushEnabled} onValueChange={onChange} disabled={disabled} label="Nhận thông báo đẩy" />}
    />
  );
}
