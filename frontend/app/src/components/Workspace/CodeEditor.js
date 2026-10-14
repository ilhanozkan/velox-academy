"use client";

import Editor, { loader } from "@monaco-editor/react";
import { Center, Loader } from "@mantine/core";

// Monaco is served from /public/monaco (copied from node_modules by
// scripts/copy-monaco.js) instead of a CDN, so the editor also works on
// networks that block jsdelivr.
loader.config({ paths: { vs: "/monaco/vs" } });

// Dark theme in the workspace's navy palette (theme.js `navy`), so the editor,
// file tree and terminal look like one surface.
const defineVeloxTheme = (monaco) =>
  monaco.editor.defineTheme("velox-dark", {
    base: "vs-dark",
    inherit: true,
    // Comments and line numbers with at least 4.5:1 contrast on the background.
    rules: [{ token: "comment", foreground: "7fb069" }],
    colors: {
      "editor.background": "#121738",
      "editorGutter.background": "#121738",
      "editor.lineHighlightBackground": "#191e45",
      "editor.lineHighlightBorder": "#191e45",
      "editorLineNumber.foreground": "#7a82b0",
      "editorLineNumber.activeForeground": "#bfc3df",
      "editor.selectionBackground": "#34408f",
      "editor.inactiveSelectionBackground": "#2a3270",
      "editorCursor.foreground": "#95a1de",
      "editorIndentGuide.background1": "#222852",
      "editorWidget.background": "#191e45",
      "editorWidget.border": "#2e3563",
      "scrollbarSlider.background": "#2e356399",
      "scrollbarSlider.hoverBackground": "#444b7dcc",
      "scrollbarSlider.activeBackground": "#646b98cc",
    },
  });

/**
 * Monaco editor. `onMount(editor, monaco)` lets the caller register
 * keyboard shortcuts.
 */
const CodeEditor = ({ language, value, onChange, path, fileName, onMount }) => (
  <Editor
    height="100%"
    path={path}
    language={language}
    value={value}
    theme="velox-dark"
    beforeMount={defineVeloxTheme}
    onChange={(next) => onChange(next ?? "")}
    onMount={onMount}
    loading={
      <Center h="100%">
        <Loader color="navy.2" />
      </Center>
    }
    options={{
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      padding: { top: 12 },
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      ariaLabel: fileName ? `${fileName} dosyası` : "Kod editörü",
    }}
  />
);

export default CodeEditor;
