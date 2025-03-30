"use client";

/**
 * フォルダ表示コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string|null} props.folder - 選択されたフォルダパス
 */
const FolderDisplay = ({ folder }) => {
  if (!folder) {
    return (
      <div className="py-6 text-center text-gray-500">
        フォルダを選択してください
      </div>
    );
  }

  return (
    <div className="p-4 mt-2 bg-gray-50 border border-gray-200 rounded-lg break-all">
      <p className="text-sm text-gray-700">{folder}</p>
    </div>
  );
};

export default FolderDisplay;