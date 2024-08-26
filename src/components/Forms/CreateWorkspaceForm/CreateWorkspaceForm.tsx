/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { type ChangeEvent, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DICTIONARY } from 'dictionary';
import { CommonDatabaseContext } from 'contexts';
import { createWorkspace } from 'db/commonDb';
import { DEFAULT_USER_ID } from 'db/workspaceDb';
import { ButtonTypes } from '../../Button';
import { WorkspaceImage } from './WorkspaceImage/WorkspaceImage';
import { FormWrapper } from '../FormElements/FormWrapper';
import { FormHeader } from '../FormElements/FormHeader';
import { Form } from '../FormElements/Form';
import { MainButton } from '../FormElements/MainButton';
import { FormErrorMessage } from '../FormElements/FormErrorMessage';
import { InputField } from '../FormElements/InputField';
import styles from './CreateWorkspaceForm.module.css';

interface CreateWorkspaceFormProps {
  onCreateWorkspaceSuccess: (id: string) => void;
}

export const CreateWorkspaceForm: React.FC<CreateWorkspaceFormProps> = ({
  onCreateWorkspaceSuccess,
}): JSX.Element => {
  const db = useContext(CommonDatabaseContext)!;
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formDisabled, setFormDisabled] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  );

  const handleCreateWorkspace = async (
    event: React.FormEvent
  ): Promise<void> => {
    event.preventDefault();
    const id = uuidv4();
    try {
      setFormDisabled(true);
      createWorkspace(db, id, name, DEFAULT_USER_ID, imagePreview)
        .then(() => {
          onCreateWorkspaceSuccess(id);
        })
        .catch((error) => {
          setFormDisabled(false);
          console.error(error);
        });
    } catch (error) {
      console.error(error);
      setErrorMessage(DICTIONARY.workspaceErrors.faildCreateWorkspace);
      setFormDisabled(false);
    }

    setErrorMessage('');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.size > 5242880) {
      alert('File size should not exceed 5MB.');
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(undefined);
    }
  };

  return (
    <FormWrapper>
      <FormHeader>
        {DICTIONARY.labels.createWorkspace}
        <div className={styles.info}>{DICTIONARY.labels.fillDetails}</div>
      </FormHeader>
      <Form onSubmit={handleCreateWorkspace}>
        <div className={styles.imageSection}>
          <WorkspaceImage
            imagePreview={imagePreview}
            name={name}
            isDefault={false}
          />
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className={styles.fileLabel}>
            {DICTIONARY.labels.addImage}
          </label>
        </div>
        <div className={styles.inputWithLabel}>
          <label className={styles.label} htmlFor="workspaceName">
            {DICTIONARY.labels.workspaceName}
          </label>
          <InputField
            id="workspaceName"
            type="text"
            placeholder={DICTIONARY.placeholders.acmeInc}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <MainButton
          type={ButtonTypes.text}
          disabled={!name || formDisabled}
          label={DICTIONARY.labels.continue}
        />
      </Form>
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
    </FormWrapper>
  );
};
