import { useEffect, useRef } from 'react';

export function ProfessionalHierarchyCheckbox({
  checked,
  indeterminate = false,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      aria-label={label}
      onChange={onChange}
      className="h-4 w-4 shrink-0 cursor-pointer accent-[#08AACE]"
    />
  );
}
