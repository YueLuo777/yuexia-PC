type WorkbenchNameFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  title?: string;
  testId?: string;
  width?: number;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
};

export function WorkbenchNameField({
  label,
  value,
  placeholder,
  disabled = false,
  title,
  testId,
  width,
  onValueChange,
  onBlur,
}: WorkbenchNameFieldProps) {
  return (
    <div
      data-testid={testId}
      data-workbench-header-control="true"
      className="xy-workbench-name-field"
      style={width ? { flexBasis: width, width, minWidth: width, maxWidth: width } : undefined}
    >
      <span aria-hidden="true" className="xy-border-embedded-transparent-backplate xy-workbench-name-field-caption">
        {label}
      </span>
      <input
        data-no-modal-drag="true"
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        title={title}
        className="xy-workbench-name-field-input"
      />
    </div>
  );
}
