import React, { type FunctionComponent, type SVGAttributes } from 'react';
import styles from './ToolCard.module.css';
import { generateIdFromString } from '../../../utils';

interface ToolCardProps {
  icon: FunctionComponent<SVGAttributes<SVGElement>>;
  label: string;
  className: string;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  icon: Icon,
  label,
  className,
  onClick,
}) => {
  const toolId = generateIdFromString(label);
  return (
    <div id={toolId} className={styles.wrapper} onClick={onClick}>
      <div className={`${styles.iconWrapper} ${styles[className]}`}>
        <Icon className={styles.icon} />
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};
