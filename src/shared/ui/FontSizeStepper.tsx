type FontSizeStepperProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
  ariaLabel?: string;
};

export function FontSizeStepper({
  value,
  min,
  max,
  onChange,
  className = '',
  ariaLabel = '字号',
}: FontSizeStepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className={`xy-font-size-stepper ${className}`} aria-label={ariaLabel}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="xy-font-size-stepper-button xy-font-size-stepper-decrement"
        title="缩小字号"
      >
        <svg className="xy-font-size-stepper-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1h16" />
        </svg>
      </button>
      <input
        readOnly
        value={value}
        className="xy-font-size-stepper-input"
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="xy-font-size-stepper-button xy-font-size-stepper-increment"
        title="放大字号"
      >
        <svg className="xy-font-size-stepper-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 1v16M1 9h16" />
        </svg>
      </button>
    </div>
  );
}
