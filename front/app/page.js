"use client";
import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@mui/material";

export default function Home() {
  const [file, setFile] = useState(null);

  const handleFileSelectDialog = async () => {
    const selected = await open({
      multiple: false,
      directory: false,
    });
    setFile(selected);
  };

  return (
    <div>
      <Button onClick={handleFileSelectDialog}>ファイル選択</Button>
      {!file ? <div>ファイルを選択してください</div> : <div>{file}</div>}
    </div>
  );
}
