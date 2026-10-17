import { Switch } from '@/components/ui';
import { categoryCopy } from '../constants/categories';
import SettingsTileRow from './SettingsTileRow';

type Props = {
  category: string;
  pushEnabled: boolean;
  disabled: boolean;
  divider: boolean;
  onChange: (pushEnabled: boolean) => void;
};

/** Một nhóm thông báo: ô icon của nhóm, tên, mô tả ngắn và công tắc push, theo nhịp dòng cài đặt của tab Hồ sơ. */
export default function PreferenceToggleRow({ category, pushEnabled, disabled, divider, onChange }: Props) {
  const copy = categoryCopy(category);

  return (
    <SettingsTileRow
      icon={copy.icon}
      title={copy.title}
      subtitle={copy.description}
      divider={divider}
      right={(
        <Switch
          value={pushEnabled}
          onValueChange={onChange}
          disabled={disabled}
          label={`Thông báo đẩy: ${copy.title}`}
        />
      )}
    />
  );
}
