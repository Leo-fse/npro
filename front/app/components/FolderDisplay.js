"use client";
import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { readDir } from "@tauri-apps/plugin-fs";

/**
 * パターンにワイルドカードが含まれているかどうかをチェックし、正規表現に変換する
 * @param {string} pattern - チェックするパターン
 * @returns {RegExp} 正規表現オブジェクト
 */
const wildcardToRegExp = (pattern) => {
  if (!pattern) return new RegExp('.*');
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const convertedPattern = escapedPattern.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
  return new RegExp(`^${convertedPattern}$`);
};

/**
 * フォルダ表示コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string|null} props.folder - 選択されたフォルダパス
 * @param {Object} props.fileConditions - ファイルの条件指定
 * @param {boolean} props.shouldFetchFiles - ファイルリストを明示的に取得するトリガー
 * @param {Function} props.onFileSelect - ファイル選択時のコールバック関数
 * @param {boolean} props.selectable - ファイルを選択可能にするかどうか
 */
const FolderDisplay = forwardRef(({ 
  folder, 
  fileConditions = {}, 
  shouldFetchFiles = false,
  onFileSelect = null,
  selectable = false
}, ref) => {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // 親コンポーネントから直接fetchFilesを呼び出せるようにする
  useImperativeHandle(ref, () => ({
    fetchFiles: () => fetchFiles(),
    getSelectedFiles: () => selectedFiles
  }));

  // 条件に基づいてフィルタリングされたファイルリスト
  const filteredFiles = useMemo(() => {
    if (!allFiles.length) return [];

    const {
      fileNamePattern = "",
      fileExtension = "csv",
      includeZip = true
    } = fileConditions;

    // 正規表現パターンを作成
    const includeRegex = wildcardToRegExp(fileNamePattern);

    // 条件に基づいてフィルタリング
    let filtered = allFiles.filter(file => {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const fileName = file.name;
      const fileExt = fileName.toLowerCase().split('.').pop();
      
      // 拡張子チェック（ZIPファイルの場合は特別処理）
      const isZipFile = fileExt === 'zip';
      const isRequestedExt = fileExt === fileExtension;
      
      // ZIP含むかどうかのチェックボックスに従って判定
      // - 含む場合: 指定された拡張子またはZIP
      // - 含まない場合: 指定された拡張子のみ
      if (includeZip) {
        // ZIPも含める場合
        if (!isRequestedExt && !isZipFile) return false;
      } else {
        // ZIPを含めない場合
        if (!isRequestedExt) return false;
      }
      
      // OR条件でパターンチェック
      const includePatterns = fileConditions.includePatterns || [];
      
      // メインのパターンと追加パターン（OR条件）をチェック
      let matchesAnyPattern = false;
      
      // メインの入力フィールドにパターンがある場合はチェック
      if (fileNamePattern) {
        matchesAnyPattern = includeRegex.test(fileName) || includeRegex.test(fileNameWithoutExt);
      }
      
      // 追加されたOR条件のパターンをチェック
      if (includePatterns.length > 0) {
        // いずれかのパターンに一致するかチェック
        const matchesAdditionalPattern = includePatterns.some(pattern => {
          const patternRegex = wildcardToRegExp(pattern);
          return patternRegex.test(fileName) || patternRegex.test(fileNameWithoutExt);
        });
        
        // OR条件なので、どちらか一方が真ならtrue
        matchesAnyPattern = matchesAnyPattern || matchesAdditionalPattern;
      }
      
      // パターンが指定されていない場合は全てマッチ
      if (!fileNamePattern && includePatterns.length === 0) {
        matchesAnyPattern = true;
      }
      
      // パターンに一致しなければスキップ
      if (!matchesAnyPattern) return false;
      
      return true;
    });

    // 名前でソート（昇順）
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [allFiles, fileConditions]);

  // ファイルリスト取得関数
  const fetchFiles = async () => {
    if (!folder) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const entries = await readDir(folder, { recursive: false });
      
      // 各ファイルの情報を取得
      const fileEntries = entries
        .filter(entry => !entry.isDir)
        .map(entry => ({
          name: entry.name,
          path: entry.path,
          // フィルタリングとソートに使用する追加情報
          mtime: new Date(entry.mtime || Date.now()).getTime(),
          size: entry.size || 0,
          selected: false
        }));
      
      setAllFiles(fileEntries);
      
      // フィルタリングされたファイルリストが更新されるのを待つために
      // 次のフレームでファイル選択処理を行う
      setTimeout(() => {
        // フィルタリングされたファイルを全選択状態にする
        if (fileEntries.length > 0) {
          // filteredFilesはuseMemoで計算されるため直接アクセスできない
          // 代わりにallFilesに対して同じフィルタリングを適用
          const { fileExtension = "csv", includeZip = true } = fileConditions;
          const filtered = fileEntries.filter(file => {
            const fileExt = file.name.toLowerCase().split('.').pop();
            const isZipFile = fileExt === 'zip';
            const isRequestedExt = fileExt === fileExtension;
            
            if (includeZip) {
              return isRequestedExt || isZipFile;
            } else {
              return isRequestedExt;
            }
          });
          
          setSelectedFiles(filtered);
          setSelectAll(true);
          
          // 親コンポーネントに選択ファイルの変更を通知
          if (onFileSelect) {
            onFileSelect(filtered);
          }
        } else {
          setSelectedFiles([]);
          setSelectAll(false);
          
          if (onFileSelect) {
            onFileSelect([]);
          }
        }
      }, 0);
    } catch (err) {
      console.error("フォルダ内のファイル読み込みエラー:", err);
      setError("フォルダ内のファイルを読み込めませんでした");
    } finally {
      setLoading(false);
    }
  };

  // shouldFetchFilesが変更されたときに実行
  useEffect(() => {
    if (shouldFetchFiles) {
      fetchFiles();
    }
  }, [shouldFetchFiles]);
  
  // 選択ファイルが変更されたら親コンポーネントに通知
  useEffect(() => {
    if (onFileSelect) {
      onFileSelect(selectedFiles);
    }
  }, [selectedFiles, onFileSelect]);
  
  // ファイル選択の切り替え
  const toggleFileSelection = (file) => {
    const isSelected = selectedFiles.some(f => f.path === file.path);
    
    if (isSelected) {
      // 選択解除
      setSelectedFiles(selectedFiles.filter(f => f.path !== file.path));
    } else {
      // 選択追加
      setSelectedFiles([...selectedFiles, file]);
    }
  };
  
  // 全選択/全解除の切り替え
  const toggleSelectAll = () => {
    if (selectAll) {
      // 全解除
      setSelectedFiles([]);
    } else {
      // 全選択
      setSelectedFiles([...filteredFiles]);
    }
    setSelectAll(!selectAll);
  };

  if (!folder) {
    return (
      <div className="py-6 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-xs">フォルダを選択してください</p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">CSVファイルリスト</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {!loading && (
              selectable 
                ? `${selectedFiles.length}件選択 / ${filteredFiles.length}件表示中 / 全${allFiles.length}件`
                : `${filteredFiles.length}件 / ${allFiles.length}件`
            )}
          </span>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {error && (
          <div className="py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        {!loading && !error && filteredFiles.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-xs py-2">
            条件に一致するCSVファイルが見つかりませんでした
          </p>
        )}
        
        {!loading && !error && filteredFiles.length > 0 && (
          <>
            {selectable && (
              <div className="mb-2 flex items-center">
                <label className="flex items-center text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="mr-1.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  全選択/解除
                </label>
                {selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="ml-3 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    選択をクリア
                  </button>
                )}
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFiles.map((file, index) => {
                  const isSelected = selectedFiles.some(f => f.path === file.path);
                  
                  return (
                    <li 
                      key={index} 
                      className={`py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {selectable && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFileSelection(file)}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}
                        <svg className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span 
                          className={`text-sm ${
                            isSelected 
                            ? 'text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-700 dark:text-gray-300'
                          }`}
                          onClick={selectable ? () => toggleFileSelection(file) : undefined}
                          style={selectable ? { cursor: 'pointer' } : {}}
                        >
                          {file.name}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {selectable && selectedFiles.length > 0 && (
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                <span className="font-medium">{selectedFiles.length}件</span>のファイルが選択されています
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

FolderDisplay.displayName = 'FolderDisplay';

export default FolderDisplay;