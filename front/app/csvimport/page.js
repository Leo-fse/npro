import Link from "next/link";
import { CSVImporter } from "../components";

export default function Page() {
  return (
    <div className="flex flex-col items-start justify-center min-h-screen p-4">
      <Link href={"/"}>トップに戻る</Link>
      <CSVImporter />
    </div>
  );
}
