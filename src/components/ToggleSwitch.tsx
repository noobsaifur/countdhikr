import { ReactNode } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  iconOn?: ReactNode;
  iconOff?: ReactNode;
}

export function ToggleSwitch({ checked, onChange, iconOn, iconOff }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="toggle-switch cursor-pointer"
      data-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch-thumb flex items-center justify-center">
        {iconOn || iconOff ? (
          checked ? iconOn : iconOff
        ) : null}
      </span>
    </button>
  );
}