import React, { useEffect, useState } from 'react';
import { ReactComponent as EyeIcon } from 'assets/icons/eye.svg';
import { ReactComponent as EyeOffIcon } from 'assets/icons/eye-off.svg';
import styles from './ConnectorField.module.css';

interface ConnectorFieldProps {
  id: string;
  label: string;
  fieldValue?: string;
  onBlur?: (id: string, value: string) => void;
  onChange?: (id: string, value: string) => void;
}

const API_KEY_SETTING_ID = 'API_KEY';

export const ConnectorField: React.FC<ConnectorFieldProps> = ({
  id,
  label,
  fieldValue,
  onBlur,
  onChange,
}) => {
  const [value, setValue] = useState<string>('');
  const [showValue, setShowValue] = useState<boolean>(false);
  const isApiKey = id === API_KEY_SETTING_ID;

  const toggleShowValue = (): void => {
    setShowValue(!showValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value;
    setValue(event.target.value);
    if (onChange) {
      onChange(id, newValue);
    }
  };

  const handleBlur = (): void => {
    if (onBlur) {
      onBlur(id, value);
    }
  };

  useEffect(() => {
    if (fieldValue) {
      setValue(fieldValue);
    }
  }, [fieldValue]);

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          id={id}
          className={styles.input}
          type={isApiKey && !showValue ? 'password' : undefined}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {isApiKey && (
          <div className={styles.eye} onClick={toggleShowValue}>
            {showValue ? <EyeOffIcon /> : <EyeIcon />}
          </div>
        )}
      </div>
    </div>
  );
};
