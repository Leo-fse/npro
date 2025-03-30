"use client";
import { FileManager } from "../components";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-start">
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
          テキストエディタ
        </h1>
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            テキストエディタは現在開発中です。近日公開予定！
          </p>
        </div>
      </div>
    </div>
  );
}
