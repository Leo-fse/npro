"use client";
import { open } from "@tauri-apps/plugin-dialog";

/**
 * フォルダ選択ボタンコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Function} props.onFolderSelect - フォルダ選択時のコールバック関数
 */
const FolderSelectButton = ({ onFolderSelect }) => {
  const handleFolderSelect = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: true,
      });
      
      if (selected) {
        onFolderSelect(selected);
      }
    } catch (error) {
      console.error("フォルダ選択エラー:", error);
    }
  };

  return (
    <button 
      className="flex items-center justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-auto"
      onClick={handleFolderSelect}
    >
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      フォルダを選択
    </button>
  );
};

export default FolderSelectButton;