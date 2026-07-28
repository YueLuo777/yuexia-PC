import { WORKBENCH_SHORT_SELECT_WIDTH, WorkbenchHeaderSelect } from './WorkbenchHeaderSelect';

type WorkbenchSurvivalStatus = '存活' | '死亡';

type WorkbenchSurvivalStatusToggleProps = {
  value: WorkbenchSurvivalStatus;
  disabled?: boolean;
  onChange: (value: WorkbenchSurvivalStatus) => void;
};

const SURVIVAL_STATUSES: WorkbenchSurvivalStatus[] = ['存活', '死亡'];

export function WorkbenchSurvivalStatusToggle({
  value,
  disabled = false,
  onChange,
}: WorkbenchSurvivalStatusToggleProps) {
  const current = disabled ? '存活' : value === '死亡' ? '死亡' : '存活';
  const options = disabled ? ['存活'] : SURVIVAL_STATUSES;

  return (
    <WorkbenchHeaderSelect
      label="生存状态"
      value={current}
      options={options}
      width={WORKBENCH_SHORT_SELECT_WIDTH}
      disabled={disabled}
      title={disabled ? '男主角固定为存活状态' : undefined}
      onChange={(next) => onChange(next === '死亡' ? '死亡' : '存活')}
    />
  );
}
