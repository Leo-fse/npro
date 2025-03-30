"use client";
import Link from "next/link";
import { FileManager } from "./components";
import Image from "next/image";

/**
 * ホームページコンポーネント
 */
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
        ファイル管理アプリケーション
      </h1>
      
      <p className="text-xl text-center text-gray-600 dark:text-gray-300 max-w-2xl mb-12">
        簡単なファイル管理、CSVデータの取り込み、テキスト編集ができる
        デスクトップアプリケーションです。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-4">
            <Image src="/file.svg" alt="CSV Icon" width={48} height={48} />
          </div>
          <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-4">
            CSVデータ取り込み
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            CSVファイルの読み込みと管理を行います。
          </p>
          <div className="text-center">
            <Link 
              href="/csvimport" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              CSV取込へ
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-4">
            <Image src="/window.svg" alt="Editor Icon" width={48} height={48} />
          </div>
          <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-4">
            テキストエディタ
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            シンプルで使いやすいテキストエディタ機能を提供します。
          </p>
          <div className="text-center">
            <Link 
              href="/texteditor" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              エディタへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
