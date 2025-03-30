"use client";
import Link from "next/link";
import { FileManager } from "./components";
import Image from "next/image";

/**
 * ホームページコンポーネント
 */
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-3">
        ファイル管理アプリ
      </h1>
      
      <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-300 max-w-xl mb-6">
        簡単なファイル管理、CSVデータの取り込み、テキスト編集ができます。
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow transition duration-200 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-3">
            <Image src="/file.svg" alt="CSV Icon" width={36} height={36} />
          </div>
          <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-2">
            CSVデータ取り込み
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
            CSVファイルの読み込みと管理を行います。
          </p>
          <div className="text-center">
            <Link 
              href="/csvimport" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 text-sm rounded transition duration-200"
            >
              CSV取込へ
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow transition duration-200 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-3">
            <Image src="/window.svg" alt="Editor Icon" width={36} height={36} />
          </div>
          <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-2">
            テキストエディタ
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
            シンプルで使いやすいテキストエディタ機能です。
          </p>
          <div className="text-center">
            <Link 
              href="/texteditor" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 text-sm rounded transition duration-200"
            >
              エディタへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
