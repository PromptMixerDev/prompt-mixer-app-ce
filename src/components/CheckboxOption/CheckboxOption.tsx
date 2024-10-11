import React from 'react';
import styles from './CheckboxOption.module.css';

interface CheckboxOptionProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export const CheckboxOption: React.FC<CheckboxOptionProps> = ({
  checked,
  onChange,
  label,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);
  };

  return (
    <label className={styles.checkboxContainer}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className={styles.hiddenCheckbox}
      />
      <span
        className={`${styles.customCheckbox} ${checked ? styles.checked : ''}`}
      >
        {checked && <span className={styles.checkmark}>&#10003;</span>}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
