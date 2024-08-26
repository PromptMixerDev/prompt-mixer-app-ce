/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
import React, { useEffect } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import { useThemeMode } from 'hooks';
import './MarkdownContent.module.css';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';

const components: Components = {
  code: ({ node, className, children, ...props }) => {
    let language: string | undefined;
    let grammar: Prism.Grammar | undefined;
    let html: string = '';

    if (className) {
      const match = /language-(\w+)/.exec(className);
      if (match) {
        language = match[1];
        grammar = Prism.languages[language];
      }
    }

    if (language && grammar) {
      html = Prism.highlight(children?.toString() ?? '', grammar, language);
    }

    const { ref, ...rest } = props;

    return html ? (
      <pre className={className} {...rest}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  img: ({ node, ...props }) => <img style={{ maxWidth: '100%' }} {...props} />,
};

interface MarkdownContentProps {
  content: string | null;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
}) => {
  const { theme } = useThemeMode();

  useEffect(() => {
    if (theme === 'dark') {
      require('prismjs/themes/prism-tomorrow.css');
    } else {
      require('prismjs/themes/prism.css');
    }

    Prism.highlightAll();
  }, [content, theme]);

  const markdownOptions = {
    components,
    remarkPlugins: [remarkGfm],
    urlTransform: (value: string) => value,
  };

  return <ReactMarkdown {...markdownOptions}>{content}</ReactMarkdown>;
};
