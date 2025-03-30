"use client";
import { open } from "@tauri-apps/plugin-dialog";

/**
 * ファイル選択ボタンコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Function} props.onFileSelect - ファイル選択時のコールバック関数
 */
const FileSelectButton = ({ onFileSelect }) => {
  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });
      
      if (selected) {
        onFileSelect(selected);
      }
    } catch (error) {
      console.error("ファイル選択エラー:", error);
    }
  };

  return (
    <button 
      className="w-full px-4 py-2 mb-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
      onClick={handleSelectFile}
    >
      ファイル選択
    </button>
  );
};

export default FileSelectButton;