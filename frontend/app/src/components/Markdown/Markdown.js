"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ActionIcon, CopyButton, Table, Title, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/light";
import bash from "react-syntax-highlighter/dist/cjs/languages/hljs/bash";
import css from "react-syntax-highlighter/dist/cjs/languages/hljs/css";
import javascript from "react-syntax-highlighter/dist/cjs/languages/hljs/javascript";
import json from "react-syntax-highlighter/dist/cjs/languages/hljs/json";
import python from "react-syntax-highlighter/dist/cjs/languages/hljs/python";
import sql from "react-syntax-highlighter/dist/cjs/languages/hljs/sql";
import xml from "react-syntax-highlighter/dist/cjs/languages/hljs/xml";
import { tomorrowNight } from "react-syntax-highlighter/dist/cjs/styles/hljs";

import classes from "./Markdown.module.css";

// Only the languages used in lessons; the full build added ~400 kB.
const LANGUAGES = { bash, css, javascript, json, python, sql, xml };
Object.entries(LANGUAGES).forEach(([name, language]) => SyntaxHighlighter.registerLanguage(name, language));
const ALIASES = { sh: "bash", shell: "bash", js: "javascript", py: "python", html: "xml", mysql: "sql" };

const CodeBlock = ({ language, code }) => (
  <div className={classes.codeBlock}>
    <CopyButton value={code} timeout={1500}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Kopyalandı" : "Kopyala"} withArrow position="left">
          <ActionIcon
            className={classes.copyButton}
            variant="subtle"
            color={copied ? "teal" : "gray"}
            onClick={copy}
            aria-label="Kodu kopyala"
          >
            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
    <SyntaxHighlighter language={language} style={tomorrowNight} customStyle={{ margin: 0, padding: "1rem", borderRadius: 8 }}>
      {code}
    </SyntaxHighlighter>
  </div>
);

// react-markdown v9 renders fenced code as <pre><code>; only that is a block.
// Previously every `code` (also inline code inside a paragraph) became a
// full-height highlighted block, which was invalid HTML (<pre> inside <p>).
const Pre = ({ children }) => {
  const code = Array.isArray(children) ? children[0] : children;
  const requested = /language-(\w+)/.exec(code?.props?.className || "")?.[1] || "text";
  const language = ALIASES[requested] || requested;
  const text = String(code?.props?.children ?? "").replace(/\n$/, "");
  return <CodeBlock language={language} code={text} />;
};

const InlineCode = ({ node, ...props }) => <code className={classes.inlineCode} {...props} />;

const Link = ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />;

const COMPONENTS = {
  h1: ({ node, ...props }) => <Title order={2} className={classes.heading} {...props} />,
  h2: ({ node, ...props }) => <Title order={3} className={classes.heading} {...props} />,
  h3: ({ node, ...props }) => <Title order={4} className={classes.heading} {...props} />,
  h4: ({ node, ...props }) => <Title order={5} className={classes.heading} {...props} />,
  a: Link,
  pre: Pre,
  code: InlineCode,
  table: ({ node, ...props }) => (
    <Table.ScrollContainer minWidth={320} className={classes.table}>
      <Table striped withTableBorder withColumnBorders {...props} />
    </Table.ScrollContainer>
  ),
  thead: ({ node, ...props }) => <Table.Thead {...props} />,
  tbody: ({ node, ...props }) => <Table.Tbody {...props} />,
  tr: ({ node, ...props }) => <Table.Tr {...props} />,
  th: ({ node, ...props }) => <Table.Th {...props} />,
  td: ({ node, ...props }) => <Table.Td {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className={classes.blockquote} {...props} />,
};

const Markdown = ({ children, components }) => (
  <div className={classes.markdown}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ ...COMPONENTS, ...components }}>
      {children || ""}
    </ReactMarkdown>
  </div>
);

export default Markdown;
