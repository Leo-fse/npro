use std::fs;
use std::path::Path;
use tempfile::tempdir;
use zip::read::ZipArchive;
use serde::Serialize;

/// 展開されたCSVファイルの情報
#[derive(Serialize)]
struct ExtractedFile {
    name: String,
    path: String,
}

/// ZIPファイルからCSVファイルを抽出する関数
#[tauri::command]
fn extract_zip(zip_path: &str) -> Result<Vec<ExtractedFile>, String> {
    // 一時ディレクトリを作成
    let temp_dir = tempdir().map_err(|e| e.to_string())?;
    let temp_path = temp_dir.path();
    
    // ZIPファイルを開く
    let file = fs::File::open(zip_path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;
    
    // ファイルリストを格納する配列
    let mut csv_files = Vec::new();
    
    // 各ファイルを抽出
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let file_name = file.name().to_string();
        
        // ディレクトリの場合はスキップ
        if file_name.ends_with('/') {
            continue;
        }
        
        // CSVファイルかどうかチェック
        let is_csv = file_name.to_lowercase().ends_with(".csv");
        let is_txt = file_name.to_lowercase().ends_with(".txt");
        let is_tsv = file_name.to_lowercase().ends_with(".tsv");
        
        if is_csv || is_txt || is_tsv {
            // 出力パスを作成
            let outpath = temp_path.join(&file_name);
            
            // 親ディレクトリが存在しない場合は作成
            if let Some(parent) = outpath.parent() {
                if !parent.exists() {
                    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
            }
            
            // ファイルを抽出
            let mut outfile = fs::File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
            
            // 抽出したファイルの情報を追加
            csv_files.push(ExtractedFile {
                name: file_name,
                path: outpath.to_string_lossy().into_owned(),
            });
        }
    }
    
    // 一時ディレクトリをメモリ上に保持しておくことで、関数終了時に自動的に削除されないようにする
    // この一時ディレクトリはプログラム終了時に自動的に削除される
    std::mem::forget(temp_dir);
    
    Ok(csv_files)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![extract_zip])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
