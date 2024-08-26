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
  onChange: (key: number, newValue: string) => void;
  wrapperClass?: string;
  labelClass?: string;
  inputClass?: string;
  icon?: FunctionComponent<SVGAttributes<SVGElement>>;
}

export const InputProperty: React.FC<InputPropertyProps> = ({
  index,
  property,
  onChange,
  wrapperClass,
  labelClass,
  inputClass,
  icon: Icon,
}) => {
  const [inputValue, setInputValue] = useState<string>(property.Value ?? '');
  useEffect(() => {
    setInputValue(property.Value ?? '');
  }, [property.Value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(index, newValue);
  };

  return (
    <div className={classnames(styles.wrapper, wrapperClass)}>
      <div className={classnames(styles.label, labelClass)}>
        {Icon && <Icon />}
        {property.Name}
      </div>
      <Textarea
        className={classnames(styles.input, inputClass)}
        value={inputValue}
        onChange={handleChange}
        rows={1}
      />
    </div>
  );
};
