import React, { useState, useEffect } from 'react';
import { DICTIONARY } from 'dictionary';
import { useAppSelector } from 'hooks';
import { Textarea } from 'components/Textarea';
import { selectTreeItemById } from 'store/tree/treeSelectors';
import styles from './Title.module.css';

interface TitleProps {
  entityId?: string;
  handleTitleBlur: (title: string) => void;
}

export const Title: React.FC<TitleProps> = ({ entityId, handleTitleBlur }) => {
  const entityInfo = useAppSelector(selectTreeItemById(entityId));
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    if (!entityId) {
      setTitle(DICTIONARY.labels.untitled);
    }
  }, []);

  useEffect(() => {
    if (entityInfo?.label) {
      setTitle(entityInfo?.label);
    }
  }, [entityInfo?.label]);

  const handleTitleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setTitle(e.target.value);
  };

  return (
    <Textarea
      id="title-input"
      value={title}
      onChange={handleTitleChange}
      onBlur={() => handleTitleBlur(title)}
      className={styles.inputTitle}
      rows={1}
    />
  );
};
