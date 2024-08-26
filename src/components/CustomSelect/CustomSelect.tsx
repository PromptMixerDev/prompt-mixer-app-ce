import React, { useState } from 'react';
import { ReactComponent as ArrowUpIcon } from 'assets/icons/arrow-up.svg';
import { ReactComponent as ArrowDownIcon } from 'assets/icons/arrow-down.svg';
import { useOutsideClick } from 'hooks';
import styles from './CustomSelect.module.css';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  selectedOption?: Option;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  selectedOption,
  options,
  onChange,
  placeholder = 'Select...',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    selectedOption?.label ?? null
  );

  const toggleDropdown = (): void => setIsOpen(!isOpen);

  const handleOptionClick = (option: Option): void => {
    setSelectedLabel(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  const ref = useOutsideClick(() => setIsOpen(false));

  return (
    <div className={styles.wrapper} ref={ref} id={id}>
      <div className={styles.selected} onClick={toggleDropdown}>
        {selectedLabel ?? placeholder}
        {isOpen ? (
          <ArrowUpIcon className={styles.arrowIcon} />
        ) : (
          <ArrowDownIcon className={styles.arrowIcon} />
        )}
      </div>
      {isOpen && (
        <div className={styles.options}>
          {options.map((option, index) => (
            <div
              key={index}
              className={styles.option}
              onClick={() => handleOptionClick(option)}
              data-name={option.label}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
