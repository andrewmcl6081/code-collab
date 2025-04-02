"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { OnMount } from "@monaco-editor/react";
import { getAccessToken } from "@auth0/nextjs-auth0";
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Imported Types
import type * as Y from "yjs";
import type { WebsocketProvider } from "y-websocket";
import type { MonacoBinding } from "y-monaco";

// Constants
const YJS_SERVER_URL = "ws://localhost:4000/yjs";
const YJS_ROOM_NAME = "room1";

const loadYjsModules = async () => {
  const Y = await import("yjs");
  const { WebsocketProvider } = await import("y-websocket");
  const { MonacoBinding } = await import("y-monaco");
  return { Y, WebsocketProvider, MonacoBinding };
};

const CodeEditor = () => {
  const [isConnected, setIsConnected] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const initializeYjs = useCallback(async (editor: Parameters<OnMount>[0]) => {
    if (!editor || ydocRef.current) return;

    try {
      const { Y, WebsocketProvider, MonacoBinding } = await loadYjsModules();
      const accessToken = await getAccessToken();

      ydocRef.current = new Y.Doc();
      providerRef.current = new WebsocketProvider(
        YJS_SERVER_URL,
        YJS_ROOM_NAME,
        ydocRef.current,
        {
          params: {
            token: accessToken,
          },
        }
      );

      const yText = ydocRef.current.getText("monaco");

      providerRef.current.on("status", ({ status }: { status: string }) => {
        console.log("WebSocket Status:", status);
        setIsConnected(status === "connected");
      });

      const model = editor.getModel();
      if (model) {
        bindingRef.current = new MonacoBinding(yText, model, new Set([editor]), providerRef.current.awareness);
      }
    } catch (error) {
      console.error("Failed to initialize collaborative features:", error);
    }
  }, []);

  const handleEditorMount = useCallback((editor: Parameters<OnMount>[0]) => {
    editorRef.current = editor;
    initializeYjs(editor);
  }, [initializeYjs]);

  // Cleanup Y.js and WebSocket on unmount
  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
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
}

export default CodeEditor;