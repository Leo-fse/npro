"use client";
import { useState, useRef, useEffect } from "react";
import FolderSelectButton from "./FolderSelectButton";
import FolderDisplay from "./FolderDisplay";

// クライアントサイドでのみTauri APIをインポート
let invoke;
if (typeof window !== 'undefined') {
  // ブラウザ環境でのみインポート
  try {
    const tauri = require('@tauri-apps/api/tauri');
    invoke = tauri.invoke;
  } catch (e) {
    // Tauri APIが利用できない環境の場合
    console.warn('Tauri API is not available in this environment');
    invoke = async () => {
      throw new Error('Tauri API is not available');
    };
  }
}

/**
 * CSVインポートコンポーネント
 * フォルダ選択と表示を管理するコンテナ
 */
const CSVImporter = () => {
  // ステップ管理
  const [currentStep, setCurrentStep] = useState(1);
  // 1: 取り込み条件指定, 2: フォルダ選択・ファイル選択, 3: メタ情報設定, 4: 取り込み確認・完了

  const [folder, setFolder] = useState(null);
  const [fileConditions, setFileConditions] = useState({
    fileNamePattern: "",
    includePatterns: [], // OR条件で複数のパターンを指定
    fileExtension: "csv",
    includeZip: true, // ZIPファイルも含めるかどうか（デフォルトはtrue）
  });
  const [shouldFetchFiles, setShouldFetchFiles] = useState(false);
  const [metaInfo, setMetaInfo] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    author: "",
    createdDate: new Date().toISOString().split('T')[0], // 今日の日付をデフォルト設定
    customFields: [],
  });
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // success, error, warning, info, null
  const [importMessage, setImportMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const folderDisplayRef = useRef(null);
  
  // フォルダが選択されたときの処理
  const handleFolderSelect = (selectedFolder) => {
    setFolder(selectedFolder);
    // フォルダ選択時に自動的にファイルリストを取得
    setTimeout(() => {
      setShouldFetchFiles(true);
      setTimeout(() => setShouldFetchFiles(false), 100);
    }, 500);
  };

  const handleConditionChange = (e) => {
    const { name, value } = e.target;
    setFileConditions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 複数の条件（OR条件）を追加
  const handleAddIncludePattern = () => {
    // 空でない場合のみ追加
    if (fileConditions.fileNamePattern) {
      setFileConditions((prev) => ({
        ...prev,
        includePatterns: [...prev.includePatterns, prev.fileNamePattern],
        fileNamePattern: "",
      }));
    }
  };

  // 特定の条件を削除
  const handleRemoveIncludePattern = (indexToRemove) => {
    setFileConditions((prev) => ({
      ...prev,
      includePatterns: prev.includePatterns.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  // メタ情報の変更処理
  const handleMetaInfoChange = (e) => {
    const { name, value } = e.target;
    setMetaInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // タグの追加処理
  const [newTag, setNewTag] = useState("");
  const handleAddTag = () => {
    if (newTag.trim()) {
      setMetaInfo((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  // タグの削除処理
  const handleRemoveTag = (tagToRemove) => {
    setMetaInfo((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // カスタムフィールドの追加
  const [newCustomField, setNewCustomField] = useState({ name: "", value: "" });
  const handleAddCustomField = () => {
    if (newCustomField.name.trim() && newCustomField.value.trim()) {
      setMetaInfo((prev) => ({
        ...prev,
        customFields: [...prev.customFields, { ...newCustomField }],
      }));
      setNewCustomField({ name: "", value: "" });
    }
  };

  // カスタムフィールドの削除
  const handleRemoveCustomField = (index) => {
    setMetaInfo((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  // ファイルリスト取得処理
  const handleFetchFiles = () => {
    if (folder) {
      setShouldFetchFiles(true);
      // fetchFilesが完了したら自動的にfalseに戻す
      setTimeout(() => setShouldFetchFiles(false), 100);
    }
  };

  // ZIPファイル処理関数
  const handleZipFile = async (zipFilePath) => {
    try {
      setLoading(true);
      
      // Tauri環境かどうかチェック
      if (!invoke) {
        setImportStatus("error");
        setImportMessage("ZIPファイル処理はTauriアプリでのみ利用可能です");
        return false;
      }
      
      // ZIPファイルからCSVファイルを展開
      const extractedFiles = await invoke("extract_zip", { zipPath: zipFilePath });
      
      // 展開されたCSVファイルを処理
      if (extractedFiles && extractedFiles.length > 0) {
        // 展開されたCSVファイルをインポート処理用のファイルリストに追加
        const mappedFiles = extractedFiles.map(file => ({
          name: file.name.split('/').pop() || file.name, // ファイル名のみを抽出
          path: file.path,
          isFromZip: true, // ZIPから展開されたことを示すフラグ
          size: 0, // ファイルサイズ情報は不明
          mtime: Date.now(),
        }));
        
        setSelectedFiles(mappedFiles);
        setImportStatus("info");
        setImportMessage(`ZIPファイルから${extractedFiles.length}件のCSV/TSV/TXTファイルを抽出しました`);
        return true;
      } else {
        setImportStatus("error");
        setImportMessage("ZIPファイル内にCSV/TSV/TXTファイルが見つかりませんでした");
        return false;
      }
    } catch (error) {
      console.error("ZIPファイル処理エラー:", error);
      setImportStatus("error");
      setImportMessage(`ZIPファイルの処理中にエラーが発生しました: ${error}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ファイル選択処理
  const handleFileSelection = async (files) => {
    // ステータスをリセット
    setImportStatus(null);
    setImportMessage("");
    
    // ZIPファイルが選択されたかをチェック
    const zipFiles = files.filter(file => file.name.toLowerCase().endsWith('.zip'));
    
    if (zipFiles.length > 0) {
      // ZIPファイルがある場合は特別な処理
      if (zipFiles.length === 1) {
        // 1つのZIPファイルのみ処理
        await handleZipFile(zipFiles[0].path);
      } else {
        // 複数のZIPファイルがある場合は最初のものだけ処理
        setImportStatus("warning");
        setImportMessage("複数のZIPファイルが選択されましたが、最初の1つのみ処理します");
        await handleZipFile(zipFiles[0].path);
      }
    } else {
      // 通常のファイル選択処理
      setSelectedFiles(files);
    }
  };

  // 次のステップに進む
  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 前のステップに戻る
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // CSVインポート処理
  const handleImportCSV = async () => {
    if (!folder || selectedFiles.length === 0) {
      setImportStatus("error");
      setImportMessage("フォルダとファイルを選択してください");
      return;
    }

    setIsImporting(true);
    setImportStatus(null);
    setImportMessage("");

    try {
      // 実際のインポート処理をここに実装
      // 例: Tauri APIを使用してバックエンドに処理を委譲するなど
      
      // モックの処理（実際の実装に置き換える）
      await new Promise(resolve => setTimeout(resolve, 2000)); // 処理を模擬
      
      // ZIPから展開されたファイルの場合も同様に処理
      const zipFiles = selectedFiles.filter(file => file.isFromZip);
      const normalFiles = selectedFiles.filter(file => !file.isFromZip);
      
      console.log('取り込み実行:', { 
        folder, 
        fileConditions, 
        metaInfo,
        zipFiles,
        normalFiles,
        totalFiles: selectedFiles.length
      });
      
      setImportStatus("success");
      setImportMessage(`${selectedFiles.length}件のCSVファイルをインポートしました`);
      setCurrentStep(4); // 完了ステップに進む
    } catch (error) {
      console.error("CSVインポートエラー:", error);
      setImportStatus("error");
      setImportMessage("インポート処理中にエラーが発生しました");
    } finally {
      setIsImporting(false);
    }
  };

  // 条件が変更されたときに自動的にファイルリストを更新
  useEffect(() => {
    if (folder && currentStep === 2) {
      const timer = setTimeout(() => {
        handleFetchFiles();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fileConditions, currentStep]);

  // ステッププログレスの表示
  const StepIndicator = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
          <span className="text-xs mt-1">条件指定</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
          <span className="text-xs mt-1">ファイル選択</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
          <span className="text-xs mt-1">メタ情報</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>4</div>
          <span className="text-xs mt-1">完了</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <StepIndicator />
      
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {currentStep === 1 && "CSVファイルの取り込み条件を指定してください。"}
          {currentStep === 2 && "フォルダを選択して、取り込むCSVファイルを確認してください。"}
          {currentStep === 3 && "取り込むCSVファイルのメタ情報を設定してください。"}
          {currentStep === 4 && "CSVファイルの取り込み処理を確認・実行します。"}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        {/* ステップ1: 取り込み条件指定 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              取り込み条件の指定
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label
                  htmlFor="fileNamePattern"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  ファイル名パターン（OR条件）
                </label>
                <div className="flex flex-row space-x-2">
                  <input
                    type="text"
                    id="fileNamePattern"
                    name="fileNamePattern"
                    value={fileConditions.fileNamePattern}
                    onChange={handleConditionChange}
                    placeholder="例：Cond または User"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddIncludePattern}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm whitespace-nowrap"
                  >
                    追加
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  * でワイルドカード指定できます。複数条件はOR条件で適用されます。
                </p>

                {/* 追加済みの条件リスト */}
                {fileConditions.includePatterns.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      指定中の条件:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {fileConditions.includePatterns.map((pattern, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full px-2 py-1"
                        >
                          <span className="mr-1">{pattern}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIncludePattern(index)}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label
                  htmlFor="fileExtension"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  ファイル拡張子
                </label>
                <select
                  id="fileExtension"
                  name="fileExtension"
                  value={fileConditions.fileExtension}
                  onChange={handleConditionChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="csv">CSV (.csv)</option>
                  <option value="txt">テキスト (.txt)</option>
                  <option value="tsv">TSV (.tsv)</option>
                </select>
                
                <div className="mt-3">
                  <label className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      name="includeZip"
                      checked={fileConditions.includeZip}
                      onChange={(e) => setFileConditions(prev => ({...prev, includeZip: e.target.checked}))}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    ZIP化されたファイルも含める
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                    チェックを入れると、ZIP内の{fileConditions.fileExtension.toUpperCase()}ファイルも取り込み対象になります
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
              >
                次へ進む
              </button>
            </div>
          </div>
        )}

        {/* ステップ2: フォルダ選択とファイルリスト確認 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              フォルダ選択とファイル確認
            </h3>
            
            <div className="flex flex-row items-center space-x-3">
              <FolderSelectButton onFolderSelect={handleFolderSelect} />
              {folder && (
                <div className="flex items-center flex-grow p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs font-medium break-all">{folder}</p>
                </div>
              )}
            </div>

            {/* 取得ボタン */}
            {folder && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFetchFiles}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  ファイルリスト更新
                </button>
              </div>
            )}

            {/* ファイルリスト表示 */}
            <div className="mt-2 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">ZIPファイル処理中...</p>
                  </div>
                </div>
              )}
              
              {importStatus === "info" && (
                <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{importMessage}</p>
                  </div>
                </div>
              )}
              
              {importStatus === "warning" && (
                <div className="mb-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm">{importMessage}</p>
                  </div>
                </div>
              )}
              
              {importStatus === "error" && (
                <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{importMessage}</p>
                  </div>
                </div>
              )}
              
              <FolderDisplay
                ref={folderDisplayRef}
                folder={folder}
                fileConditions={fileConditions}
                shouldFetchFiles={shouldFetchFiles}
                onFileSelect={handleFileSelection}
                selectable={true}
              />
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
              >
                戻る
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!folder || selectedFiles.length === 0}
                className={`px-4 py-2 text-white rounded-md text-sm font-medium shadow-sm transition-colors ${
                  !folder || selectedFiles.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                次へ進む
              </button>
            </div>
          </div>
        )}

        {/* ステップ3: メタ情報設定 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              CSVメタ情報の設定
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 基本メタ情報 */}
              <div className="space-y-3">
                <div>
                  <label 
                    htmlFor="title" 
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    id="title"
                    name="title"
                    value={metaInfo.title}
                    onChange={handleMetaInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="データのタイトル"
                    required
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="category" 
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    カテゴリ
                  </label>
                  <input 
                    type="text"
                    id="category"
                    name="category"
                    value={metaInfo.category}
                    onChange={handleMetaInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="データのカテゴリ"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="author" 
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    作成者
                  </label>
                  <input 
                    type="text"
                    id="author"
                    name="author"
                    value={metaInfo.author}
                    onChange={handleMetaInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="データの作成者"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="createdDate" 
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    作成日
                  </label>
                  <input 
                    type="date"
                    id="createdDate"
                    name="createdDate"
                    value={metaInfo.createdDate}
                    onChange={handleMetaInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* 説明とタグ */}
              <div className="space-y-3">
                <div>
                  <label 
                    htmlFor="description" 
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    説明
                  </label>
                  <textarea 
                    id="description"
                    name="description"
                    value={metaInfo.description}
                    onChange={handleMetaInfoChange}
                    rows="3"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="データの説明"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    タグ
                  </label>
                  <div className="flex flex-row space-x-2">
                    <input 
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="新しいタグ"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm whitespace-nowrap"
                    >
                      追加
                    </button>
                  </div>
                  
                  {metaInfo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {metaInfo.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full px-2 py-1"
                        >
                          <span className="mr-1">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* カスタムフィールド */}
            <div className="mt-5">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                カスタムフィールド
              </h4>
              <div className="flex flex-row space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="フィールド名"
                  value={newCustomField.name}
                  onChange={(e) => setNewCustomField({...newCustomField, name: e.target.value})}
                  className="w-1/3 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="値"
                  value={newCustomField.value}
                  onChange={(e) => setNewCustomField({...newCustomField, value: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm whitespace-nowrap"
                >
                  追加
                </button>
              </div>

              {metaInfo.customFields.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md mt-2">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">フィールド名</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">値</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {metaInfo.customFields.map((field, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{field.name}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{field.value}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomField(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
              >
                戻る
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!metaInfo.title}
                className={`px-4 py-2 text-white rounded-md text-sm font-medium shadow-sm transition-colors ${
                  !metaInfo.title
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                次へ進む
              </button>
            </div>
          </div>
        )}

        {/* ステップ4: 確認と完了 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              取り込み確認
            </h3>
            
            {/* 取り込み概要 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                取り込み内容の確認
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-500 dark:text-gray-400">フォルダ:</div>
                  <div className="text-gray-900 dark:text-white font-medium break-all">{folder}</div>
                  
                  <div className="text-gray-500 dark:text-gray-400">ファイル数:</div>
                  <div className="text-gray-900 dark:text-white font-medium">{selectedFiles.length}件</div>
                  
                  <div className="text-gray-500 dark:text-gray-400">タイトル:</div>
                  <div className="text-gray-900 dark:text-white font-medium">{metaInfo.title}</div>
                  
                  {metaInfo.category && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">カテゴリ:</div>
                      <div className="text-gray-900 dark:text-white font-medium">{metaInfo.category}</div>
                    </>
                  )}
                  
                  {metaInfo.tags.length > 0 && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">タグ:</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {metaInfo.tags.join(", ")}
                      </div>
                    </>
                  )}
                </div>
                
                {/* 選択したファイルのリスト */}
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    取り込むファイル:
                  </h5>
                  <ul className="max-h-32 overflow-y-auto text-xs space-y-1 bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">
                          {file.name}
                          {file.isFromZip && (
                            <span className="ml-1 text-xs text-blue-500 dark:text-blue-300 font-medium">
                              (ZIP展開)
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* インポートステータス表示 */}
            {importStatus && (
              <div className={`p-3 rounded-lg ${
                importStatus === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center">
                  {importStatus === 'success' ? (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <p className="text-sm font-medium">{importMessage}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={isImporting || importStatus === 'success'}
                className={`px-4 py-2 text-white rounded-md text-sm font-medium shadow-sm transition-colors ${
                  isImporting || importStatus === 'success'
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                戻る
              </button>
              
              {importStatus === 'success' ? (
                <button
                  type="button"
                  onClick={() => {
                    // 最初から始める
                    setCurrentStep(1);
                    setFolder(null);
                    setFileConditions({
                      fileNamePattern: "",
                      includePatterns: [],
                      fileExtension: "csv",
                      includeZip: true,
                    });
                    setMetaInfo({
                      title: "",
                      description: "",
                      category: "",
                      tags: [],
                      author: "",
                      createdDate: new Date().toISOString().split('T')[0],
                      customFields: [],
                    });
                    setSelectedFiles([]);
                    setImportStatus(null);
                    setImportMessage("");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  新規取り込みを開始
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImportCSV}
                  disabled={isImporting}
                  className={`px-4 py-2 text-white rounded-md text-sm font-medium shadow-sm transition-colors ${
                    isImporting
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isImporting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      取り込み中...
                    </div>
                  ) : "メタ情報を設定して取り込む"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVImporter;
