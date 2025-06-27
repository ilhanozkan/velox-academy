"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Tabs } from "@mantine/core";
import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";

// Components
import FileTabs from "@/components/FileTabs/FileTabs";
import CodeEditor from "@/components/CodeEditor/CodeEditor";
import FileTree from "./FileTree/FileTree";
// Configs
import { useSocket } from "@/contexts/SocketContext";
// Utils
import { getFileMode } from "@/utils/getFileMode";
// Styles
import classes from "./Playground.module.css";

const Playground = ({ activeTab, setActiveTab, ...props }) => {
  const params = useParams();
  const trainingId = params.trainingId;

  // Get sandbox details from Redux store
  const { sandboxDetails } = useSelector((state) => state.trainings);
  const sandboxData = sandboxDetails[trainingId];

  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [fileTree, setFileTree] = useState({});
  const [code, setCode] = useState("");

  const isSaved = selectedFileContent === code;

  // Get shared socket connection
  const { socket, isConnected } = useSocket();

  const getFileContents = useCallback(async () => {
    if (!selectedFile || !sandboxData?.accessUrl) return;

    try {
      const response = await fetch(
        `${sandboxData.accessUrl}/files/content?path=/${selectedFile}`
      );
      const result = await response.json();

      setSelectedFileContent(result.content);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  }, [selectedFile, sandboxData?.accessUrl]);

  const getFileTree = useCallback(async () => {
    if (!sandboxData?.accessUrl) return;

    try {
      const response = await fetch(`${sandboxData.accessUrl}/files`);
      const result = await response.json();
      setFileTree(result.tree);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  }, [sandboxData?.accessUrl]);

  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  useEffect(() => {
    setCode(selectedFileContent);
  }, [selectedFileContent]);

  useEffect(() => {
    if (!isSaved && code && socket) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: "/" + selectedFile,
          content: code,
        });
      }, 1 * 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved, socket]);

  useEffect(() => {
    if (selectedFile) getFileContents();
  }, [selectedFile, getFileContents]);

  useEffect(() => {
    if (!socket) return;

    getFileTree();
  }, [socket, isConnected]);

  useEffect(() => {
    // Select first file in the tree
    if (Object.keys(fileTree).length > 0)
      setSelectedFile(Object.keys(fileTree)[0]);
  }, [fileTree]);

  return (
    <>
      <FileTree
        onSelect={(path) => {
          setSelectedFileContent("");
          setSelectedFile(path);
        }}
        tree={fileTree}
      />
      <Tabs
        value={selectedFile}
        onChange={(val) => {
          setSelectedFile(val);
        }}
        variant="unstyled"
        classNames={classes}
        {...props}
      >
        <FileTabs data={Object.keys(fileTree)} value={selectedFile} />

        {Object.keys(fileTree)?.map((file) => (
          <Tabs.Panel key={file} value={file} style={{ position: "relative" }}>
            <>
              <CodeEditor
                // language={
                //   langMap.languages(fileExtension)[0] == "plsql" ||
                //   langMap.languages(fileExtension)[0] == "sqlite"
                //     ? "sql"
                //     : langMap.languages(fileExtension)[0]
                // }
                language={getFileMode({ selectedFile })}
                value={code}
                onChange={setCode}
              />
              <Button
                className={classes.runButton}
                onClick={() => {
                  // socket.emit("run:query", {
                  //   path: "/" + selectedFile,
                  //   content: code,
                  // });
                  if (activeTab != "results") setActiveTab("results");

                  if (socket) {
                    socket.emit("run:file", {
                      path: "/" + selectedFile,
                    });
                  }
                }}
                size="lg"
              >
                Çalıştır
              </Button>
            </>
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  );
};

export default Playground;
