import { Send, Square } from 'lucide-react';
import { forwardRef, type ChangeEvent, type KeyboardEventHandler, type TextareaHTMLAttributes } from 'react';

type AiInlineInputProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  onSend: () => void;
  onStop: () => void;
  sendDisabled?: boolean;
  stopDisabled?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  textareaClassName?: string;
  rows?: number;
  variant?: 'default' | 'neutral';
} & Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, 'aria-label'>;

export const AiInlineInput = forwardRef<HTMLTextAreaElement, AiInlineInputProps>(function AiInlineInput({
  value,
  onChange,
  onKeyDown,
  onSend,
  onStop,
  sendDisabled = false,
  stopDisabled = false,
  label = '请输入要求',
  placeholder,
  className = '',
  textareaClassName = 'scrollbar-hidden',
  rows = 1,
  variant = 'neutral',
  'aria-label': ariaLabel,
}, ref) {
  const variantClassName = variant === 'neutral' ? 'xy-ai-inline-neutral' : '';

  return (
    <div data-no-modal-drag="true" className={`xy-floating-field xy-floating-ai xy-floating-compact xy-floating-with-inline-actions ${variantClassName} ${value.trim() ? 'xy-has-value' : ''} ${className}`.trim()}>
      <textarea
        data-no-modal-drag="true"
        ref={ref}
        rows={rows}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={textareaClassName}
        aria-label={ariaLabel}
      />
      <label>{label}</label>
      <div className="xy-ai-inline-actions">
        <button
          type="button"
          onClick={onSend}
          disabled={sendDisabled}
          className="xy-ai-inline-send"
        >
          <span className="xy-ai-inline-send-icon"><Send className="h-6 w-6 stroke-[1.9]" /></span>
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={stopDisabled}
          className="xy-ai-inline-stop"
        >
          <Square className="h-[18px] w-[18px] fill-current stroke-[1.9]" />
        </button>
      </div>
    </div>
  );
});
