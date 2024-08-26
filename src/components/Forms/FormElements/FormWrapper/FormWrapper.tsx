import React from 'react';
import styles from './FormWrapper.module.css';

interface FormWrapperProps {
  children: React.ReactNode;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
}): JSX.Element => {
  return <div className={styles.wrapper}>{children}</div>;
};
