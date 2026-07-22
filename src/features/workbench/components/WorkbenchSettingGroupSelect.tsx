import { WorkbenchHeaderSelect } from './WorkbenchHeaderSelect';

type WorkbenchSettingGroupSelectProps = {
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function WorkbenchSettingGroupSelect({
  value,
  options,
  disabled = false,
  onChange,
}: WorkbenchSettingGroupSelectProps) {
  if (options.length === 0) return null;

  return (
    <WorkbenchHeaderSelect
      label="所属分组"
      ariaLabel="当前设定分组"
      value={value}
      options={options}
      width={180}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
