"use client";
import { CSVImporter } from "../components";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          CSVデータ取り込み
        </h1>
        <CSVImporter />
      </div>
    </div>
  );
}
