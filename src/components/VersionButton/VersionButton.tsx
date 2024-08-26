import React from 'react';
import { ReactComponent as BranchIcon } from 'assets/icons/branch.svg';
import { Button, ButtonTypes } from '../Button';
import styles from './VersionButton.module.css';

interface VersionButtonProps {
  number: number;
  onClick: any;
}

export const VersionButton = React.forwardRef<
  HTMLDivElement,
  VersionButtonProps
>(({ number, onClick }: VersionButtonProps, ref) => (
  <Button
    ref={ref}
    type={ButtonTypes.iconText}
    buttonClass={styles.button}
    buttonWrapperClass={styles.wrapper}
    onClick={onClick}
  >
    <BranchIcon />
    <span>{number}</span>
  </Button>
));

VersionButton.displayName = 'VersionButton';
