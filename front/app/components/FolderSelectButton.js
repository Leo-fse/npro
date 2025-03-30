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
      className="px-4 py-2 mb-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
      onClick={handleFolderSelect}
    >
      CSV取り込み
    </button>
  );
};

export default FolderSelectButton;