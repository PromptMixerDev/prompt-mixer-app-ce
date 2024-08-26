import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import { DICTIONARY } from 'dictionary';
import { type DatasetInfo } from '../Dataset';
import { Spinner } from '../../Spinner';
import styles from './DatasetUploader.module.css';

interface DatasetUploaderProps {
  handleUpdateDataset: (value: DatasetInfo) => void;
}

type CsvRowData = Record<string, string | number>;

export const DatasetUploader: React.FC<DatasetUploaderProps> = ({
  handleUpdateDataset,
}) => {
  const [isLoading, setLoading] = useState(false);

  const parseCsv = (file: File): void => {
    Papa.parse(file, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: any[] = results.data;
        const headers = rows[0] as string[];

        const data = rows.slice(1).map((row) => {
          const rowData: CsvRowData = {};
          row.forEach((value: any, index: number) => {
            rowData[headers[index]] = value;
          });
          return rowData;
        });
        handleUpdateDataset({ headers, data });
        setLoading(false);
      },
      error: (error) => {
        console.error('Error while parsing CSV:', error);
      },
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && acceptedFiles[0].type === 'text/csv') {
      setLoading(true);
      parseCsv(acceptedFiles[0]);
    } else {
      alert('Please upload a valid CSV file.');
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
  });

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = event.target.files;
    if (files?.[0]) {
      setLoading(true);
      parseCsv(files?.[0]);
    }
  };

  return (
    <div className={styles.wrapper}>
      {isLoading && <Spinner />}
      {!isLoading && (
        <div className={styles.uploadArea} {...getRootProps()}>
          <input {...getInputProps({ onChange: handleFileUpload })} />
          {DICTIONARY.placeholders.uploadCSVFile}
        </div>
      )}
    </div>
  );
};
