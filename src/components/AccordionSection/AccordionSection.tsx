/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useState } from 'react';
import classNames from 'classnames';
import { ReactComponent as ArrowRightIcon } from 'assets/icons/arrow-right.svg';
import { Button, ButtonTypes } from '../Button';
import styles from './AccordionSection.module.css';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  custom?: React.ReactNode;
  onToggle?: (value: boolean) => void;
  showArrowButton?: boolean;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  children,
  custom,
  onToggle,
  showArrowButton = true,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <>
      <div className={styles.wrapper}>
        <Button
          type={ButtonTypes.icon}
          buttonWrapperClass={classNames(!showArrowButton && styles.hidden)}
          buttonClass={styles.arrowButton}
          onClick={() => {
            setIsOpen(!isOpen);
            if (onToggle) {
              onToggle(!isOpen);
            }
          }}
        >
          <ArrowRightIcon className={classNames(isOpen && styles.expanded)} />
        </Button>
        <div className={styles.title}>{title}</div>
        {custom}
      </div>
      {isOpen && children}
    </>
  );
};
