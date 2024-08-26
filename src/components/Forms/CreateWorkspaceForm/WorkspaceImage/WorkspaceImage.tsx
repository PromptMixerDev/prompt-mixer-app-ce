/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import { ReactComponent as ComputerIcon } from 'assets/icons/computer.svg';
import classnames from 'classnames';
import styles from './WorkspaceImage.module.css';

interface WorkspaceImageProps {
  imagePreview: string | undefined | null;
  name: string;
  imageClass?: string;
  imagePlaceholderClass?: string;
  isDefault: boolean;
}

export const WorkspaceImage: React.FC<WorkspaceImageProps> = ({
  imagePreview,
  name,
  imageClass,
  imagePlaceholderClass,
  isDefault,
}): JSX.Element => {
  if (isDefault) {
    return <ComputerIcon className={classnames(styles.icon)} />;
  }
  if (imagePreview) {
    return (
      <img
        src={imagePreview}
        alt="preview"
        className={classnames(styles.image, imageClass)}
      />
    );
  }

  const placeholder = name ? name[0].toUpperCase() : 'A';
  return (
    <div className={classnames(styles.imagePlaceholder, imagePlaceholderClass)}>
      {placeholder}
    </div>
  );
};
