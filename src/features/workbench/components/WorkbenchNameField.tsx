type WorkbenchNameFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  title?: string;
  testId?: string;
  onValueChange: (value: string) => void;
};

export function WorkbenchNameField({
  label,
  value,
  placeholder,
  disabled = false,
  title,
  testId,
  onValueChange,
}: WorkbenchNameFieldProps) {
  return (
    <div data-testid={testId} className="xy-workbench-name-field">
      <span aria-hidden="true" className="xy-workbench-name-field-caption">
        {label}
      </span>
      <input
        data-no-modal-drag="true"
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        title={title}
        className="xy-workbench-name-field-input"
      />
    </div>
  );
}
