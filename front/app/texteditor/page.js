"use client";
import { FileManager } from "../components";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          テキストエディタ
        </h1>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 text-center">
            テキストエディタは現在開発中です。近日公開予定！
          </p>
        </div>
      </div>
    </div>
  );
}
