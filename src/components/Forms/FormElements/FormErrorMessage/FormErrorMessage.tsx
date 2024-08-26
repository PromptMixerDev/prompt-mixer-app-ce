import React from 'react';
import styles from './FormErrorMessage.module.css';

interface FormErrorMessageProps {
  errorMessage: string;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  errorMessage,
}): JSX.Element => {
  return <div className={styles.errorMessage}>{errorMessage}</div>;
};
