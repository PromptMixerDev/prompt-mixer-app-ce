import React from 'react';
import { MarkdownContent } from '../MarkdownContent';

interface JSONContentProps {
  content: string | null;
}

export const JSONContent: React.FC<JSONContentProps> = ({ content }) => {
  try {
    const jsonObject = JSON.parse(content ?? '');
    const markdown = `\`\`\`json\n${JSON.stringify(jsonObject, null, 2)}\n\`\`\``;
    return <MarkdownContent content={markdown} />;
  } catch (error) {
    console.error('Invalid JSON', error);
    return <span style={{ color: 'red' }}>Invalid JSON</span>;
  }
};
