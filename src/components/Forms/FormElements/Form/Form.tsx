import React from 'react';
import styles from './Form.module.css';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => any;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
}): JSX.Element => {
  return (
    <form
      className={styles.form}
      onSubmit={onSubmit as React.FormEventHandler<HTMLFormElement>}
    >
      {children}
    </form>
  );
};
