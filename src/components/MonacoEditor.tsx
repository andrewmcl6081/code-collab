"use client"

import { Editor } from "@monaco-editor/react";

const MonacoEditor = () => {
  return (
    <Editor
      height="500px"
      defaultLanguage="javascript"
      theme="vs-dark"
    />
  );
}

export default MonacoEditor;