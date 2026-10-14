"use client";

import Editor, { loader } from "@monaco-editor/react";
import { Center, Loader } from "@mantine/core";

// Monaco is served from /public/monaco (copied from node_modules by
// scripts/copy-monaco.js) instead of a CDN, so the editor also works on
// networks that block jsdelivr.
loader.config({ paths: { vs: "/monaco/vs" } });

const CodeEditor = ({ language, value, onChange, path, onMount }) => (
  <Editor
    height="100%"
    path={path}
    language={language}
    value={value}
    theme="vs-dark"
    onChange={(next) => onChange(next ?? "")}
    onMount={onMount}
    loading={
      <Center h="100%">
        <Loader color="gray" />
      </Center>
    }
    options={{
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
    }}
  />
);

export default CodeEditor;
