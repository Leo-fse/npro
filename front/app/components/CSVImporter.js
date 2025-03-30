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
    <div className="w-full">
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          CSVファイルを含むフォルダを選択してください。
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <FolderSelectButton onFolderSelect={setFolder} />
        <div className="mt-4">
          <FolderDisplay folder={folder} />
        </div>
      </div>
    </div>
  );
};

export default CSVImporter;