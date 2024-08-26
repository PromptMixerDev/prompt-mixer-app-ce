import React from 'react';
import styles from './FormHeader.module.css';

interface FormHeaderProps {
  children: React.ReactNode;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  children,
}): JSX.Element => {
  return <div className={styles.header}>{children}</div>;
};
