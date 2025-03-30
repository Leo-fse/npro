"use client";
import { useState } from "react";
import FolderSelectButton from "./FolderSelectButton";
import FolderDisplay from "./FolderDisplay";

/**
 * CSVインポートコンポーネント
 * フォルダ選択と表示を管理するコンテナ
 */
const CSVImporter = () => {
  const [folder, setFolder] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-xl font-semibold text-center text-gray-800">
          CSVデータ取り込み
        </h1>
        <FolderSelectButton onFolderSelect={setFolder} />
        <FolderDisplay folder={folder} />
      </div>
    </div>
  );
};

export default CSVImporter;