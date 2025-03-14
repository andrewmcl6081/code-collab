"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { OnMount } from "@monaco-editor/react";
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const CodeEditor = () => {
  const [isConnected, setIsConnected] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ydocRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bindingRef = useRef<any>(null);

  const handleEditorMount = useCallback(async (editor: Parameters<OnMount>[0]) => {
    if (!editor) return;

    editorRef.current = editor;

    try {
      if (!ydocRef.current) {
        const Y = await import("yjs");
        const { WebsocketProvider } = await import("y-websocket");
        const { MonacoBinding } = await import("y-monaco");

        // Create a Y.js document only once
        ydocRef.current = new Y.Doc();

        // Connect to the Y.js WebSocket server only once
        providerRef.current = new WebsocketProvider(
          "ws://localhost:4000/yjs",
          "room1",
          ydocRef.current
        );

        // Create a shared text object in Y.js
        const yText = ydocRef.current.getText("monaco");

        // Monitor WebSocket connection status
        providerRef.current.on("status", (event) => {
          console.log("WebSocket Status:", event.status);
          setIsConnected(event.status === "connected");
        });

        // Bind Y.js document with Monaco Editor only after it is mounted
        const model = editor.getModel();
        if (model) {
          bindingRef.current = new  MonacoBinding(
            yText,
            model,
            new Set([editor]),
            providerRef.current.awareness
          );
        }
      }
    } catch (error) {
      console.error("Failed to initialize collaborative features:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    }
  }, []);

  return (
    <>
      <h1>Real-Time Code Collaboration {isConnected ? "✅ Connected" : "❌ Disconnected"}</h1>
      <Editor
        height="500px"
        defaultLanguage="javascript"
        theme="vs-dark"
        onMount={handleEditorMount}
      />
    </>
  );
};

export default CodeEditor;