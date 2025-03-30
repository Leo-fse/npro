"use client";

/**
 * フォルダ表示コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string|null} props.folder - 選択されたフォルダパス
 */
const FolderDisplay = ({ folder }) => {
  if (!folder) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p>フォルダを選択してください</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg">
        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium break-all">{folder}</p>
      </div>
      
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">ファイルリスト</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">ファイルリストは準備中です...</p>
      </div>
    </div>
  );
};

export default FolderDisplay;