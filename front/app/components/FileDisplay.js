"use client";

/**
 * ファイル表示コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string|null} props.file - 選択されたファイルパス
 */
const FileDisplay = ({ file }) => {
  if (!file) {
    return (
      <div className="py-6 text-center text-gray-500">
        ファイルを選択してください
      </div>
    );
  }

  return (
    <div className="p-4 mt-2 bg-gray-50 border border-gray-200 rounded-lg break-all">
      <p className="text-sm text-gray-700">{file}</p>
    </div>
  );
};

export default FileDisplay;