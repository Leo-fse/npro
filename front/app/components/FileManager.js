"use client";
import { useState } from "react";
import FileSelectButton from "./FileSelectButton";
import FileDisplay from "./FileDisplay";

/**
 * ファイルマネージャーコンポーネント
 * ファイル選択と表示を管理するメインコンテナ
 */
const FileManager = () => {
  const [file, setFile] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-xl font-semibold text-center text-gray-800">
          ファイルマネージャー
        </h1>
        
        <FileSelectButton onFileSelect={setFile} />
        <FileDisplay file={file} />
      </div>
    </div>
  );
};

export default FileManager;