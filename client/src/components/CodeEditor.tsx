"use client"

import { Editor } from "@monaco-editor/react";

const CodeEditor = () => {
  return (
    <Editor
      height="500px"
      defaultLanguage="javascript"
      theme="vs-dark"
    />
  );
}

export default CodeEditor;