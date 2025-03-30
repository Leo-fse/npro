"use client";
import { useState } from "react";
import { FileManager, QuillEditor } from "../components";
import "quill/dist/quill.snow.css";

export default function Page() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col items-center justify-start p-4">
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
          テキストエディタ
        </h1>
        <div className="mb-4">
          <QuillEditor 
            value={value}
            onChange={setValue}
            placeholder="ここにテキストを入力してください..."
          />
        </div>
        <div className="mt-12 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h2 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
            編集内容のプレビュー:
          </h2>
          <div 
            className="prose dark:prose-invert max-w-none p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </div>
      </div>
    </div>
  );
}
