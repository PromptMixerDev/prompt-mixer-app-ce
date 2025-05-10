/* eslint-disable @typescript-eslint/no-unsafe-argument */
import classnames from 'classnames';
import React, {
  type FunctionComponent,
  type SVGAttributes,
  useState,
  useEffect,
} from 'react';
import { Textarea } from 'components/Textarea';
import styles from './InputProperty.module.css';

interface IProperty {
  Name: string;
  Value?: string;
}

interface InputPropertyProps {
  index: number;
  property: IProperty;
  placeholder?: string;
  onChange: (key: number, newValue: string) => void;
  wrapperClass?: string;
  labelClass?: string;
  inputClass?: string;
  icon?: FunctionComponent<SVGAttributes<SVGElement>>;
  validate?: (value: string) => string | null;
}

export const InputProperty: React.FC<InputPropertyProps> = ({
  index,
  property,
  placeholder,
  onChange,
  wrapperClass,
  labelClass,
  inputClass,
  icon: Icon,
  validate,
}) => {
  const [inputValue, setInputValue] = useState<string>(property.Value ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const value = property.Value ?? '';
    setInputValue(value);
  }, [property.Value]);

  useEffect(() => {
    if (validate) {
      setError(validate(inputValue));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(index, newValue);
    setError(null);
  };

  const handleBlur = (): void => {
    if (validate) {
      setError(validate(inputValue));
    }
  };

  return (
    <div className={styles.container}>
      <div className={classnames(styles.wrapper, wrapperClass)}>
        <div className={classnames(styles.label, labelClass)}>
          {Icon && <Icon />}
          {property.Name}
        </div>
        <Textarea
          className={classnames(styles.input, inputClass, {
            [styles.inputError]: error,
          })}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={1}
        />
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};
