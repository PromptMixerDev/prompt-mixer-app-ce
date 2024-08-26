/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import classnames from 'classnames';
import styles from './InputField.module.css';

interface InputFieldProps {
  id?: string;
  type?: string;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => any;
  inputClass?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  type,
  value,
  placeholder,
  inputClass,
  onChange,
  onBlur,
}): JSX.Element => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className={classnames(
        styles.inputField,
        value && styles.filledInputField,
        inputClass
      )}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      autoComplete="off"
    />
  );
};
