import React, { useContext, useEffect, useState } from 'react';
import { type ConnectableElement } from 'react-dnd';
import { type TreeItem } from 'db/workspaceDb';
import { WorkspaceDatabaseContext } from 'contexts';
import { useAppDispatch, useAppSelector, useResizeObserver } from 'hooks';
import { DICTIONARY } from 'dictionary';
import { TreeNode } from './TreeNode';
import { TreeButtons } from './TreeButtons';
import { Spinner } from '../Spinner';
import {
  getTree,
  handleTreeDrop,
  updateButtonPosition,
  useTreeDrop,
} from './Tree.helper';
import styles from './Tree.module.css';

interface TreeProps {
  setSideBarReady: (value: boolean) => void;
}

export const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  ({ setSideBarReady }: TreeProps, ref) => {
    const db = useContext(WorkspaceDatabaseContext)!;
    const dispatch = useAppDispatch();
    const { treeData, loading } = useAppSelector((state) => state.tree);
    const [buttonPosition, setButtonPosition] = useState<{
      top: number;
      left: number;
    }>({ top: 0, left: 0 });
    const handleDrop = handleTreeDrop(db, dispatch);
    const updatePosition = updateButtonPosition(setButtonPosition);

    useResizeObserver(ref as React.RefObject<Element>, updatePosition);

    const [, drop] = useTreeDrop(handleDrop);

    useEffect(() => {
      if ((ref as React.RefObject<Element>).current) {
        setSideBarReady(true);
      }
    }, []);

    useEffect(() => {
      getTree(db, dispatch);
    }, [db]);

    drop(ref as ConnectableElement);

    return (
      <div id="tree" ref={ref} className={styles.wrapper}>
        <TreeButtons buttonPosition={buttonPosition} />
        {loading && (
          <div className={styles.loader}>
            <Spinner />
          </div>
        )}
        {!loading && !treeData.length && (
          <div className={styles.placeholder}>
            {DICTIONARY.placeholders.emptyLibrary}
          </div>
        )}
        <div className={loading ? styles.transparent : ''}>
          {treeData.map((node: TreeItem) => (
            <TreeNode key={node.id} node={node} handleDrop={handleDrop} />
          ))}
        </div>
        <div className={styles.bottom}></div>
      </div>
    );
  }
);

Tree.displayName = 'Tree';
