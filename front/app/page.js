"use client";
import Link from "next/link";
import { CSVImporter } from "./components";

/**
 * ホームページコンポーネント
 */
export default function Home() {
  return (
    <div>
      <li>
        <Link href={"/csvimport"}>CSV IMPORT</Link>
      </li>
      <li>
        <Link href={"/texteditor"}>Text Editor</Link>
      </li>
    </div>
  );
}
