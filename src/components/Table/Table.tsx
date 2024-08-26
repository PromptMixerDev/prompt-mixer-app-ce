/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useState } from 'react';
import { useTable } from 'react-table';
import { List, AutoSizer, type ListRowProps } from 'react-virtualized';
import { useWindowResize } from 'hooks';
import classnames from 'classnames';
import styles from './Table.module.css';
import './Table.custom.css';

export interface CellInfo {
  columnName: string;
  row: number;
}

interface TableProps {
  headers: string[];
  data: any[];
  onCellClick: (value: CellInfo) => void;
  activeCell: CellInfo | null;
}

export const Table: React.FC<TableProps> = ({
  headers,
  data,
  onCellClick,
  activeCell,
}) => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const columns = React.useMemo(
    () =>
      headers.map((header) => ({
        Header: header,
        accessor: header,
      })),
    [headers]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  useWindowResize(() => {
    setViewportHeight(window.innerHeight);
  });

  const rowRenderer = ({
    index,
    key,
    style,
  }: ListRowProps): React.ReactNode => {
    if (index === 0) {
      return (
        <div key={key} style={style} className={styles.header}>
          {headerGroups.map((headerGroup) => (
            <React.Fragment key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <div
                  {...column.getHeaderProps()}
                  className={styles.headerColumn}
                  key={column.id}
                >
                  {column.render('Header')}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      );
    }

    const bodyRow = rows[index - 1];
    prepareRow(bodyRow);

    return (
      <div {...bodyRow.getRowProps({ style, key })} className={styles.row}>
        {bodyRow.cells.map((cell) => {
          const isActive =
            activeCell &&
            activeCell.columnName === cell.column.id &&
            activeCell.row === index;
          return (
            <div
              {...cell.getCellProps()}
              className={classnames(
                styles.cellWrapper,
                isActive && styles.active
              )}
              key={cell.column.id}
              onClick={() =>
                onCellClick({
                  columnName: cell.column.id,
                  row: index,
                })
              }
            >
              <div className={styles.cell}>{cell.render('Cell')}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div {...getTableProps()} className={styles.table}>
      <div {...getTableBodyProps()} className={styles.body}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <List
              height={viewportHeight}
              rowCount={rows.length + 1}
              rowHeight={72}
              rowRenderer={rowRenderer}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};
