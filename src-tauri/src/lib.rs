mod commands;
mod search;
mod syntax;

use std::sync::Mutex;

pub struct AppState {
    pub active_file: Option<String>,
    pub pending_open_file: Option<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .init();

    let search_index = search::SearchIndex::new().expect("Failed to create search index");

    // 解析启动参数中的文件路径
    let pending_file = {
        let args: Vec<String> = std::env::args().collect();
        tracing::info!("启动参数: {:?}", args);
        if args.len() > 1 {
            let file_path = &args[1];
            let path = std::path::Path::new(file_path);
            let absolute_path = if path.is_absolute() {
                path.to_path_buf()
            } else {
                std::env::current_dir()
                    .unwrap_or_else(|_| std::path::PathBuf::from("."))
                    .join(path)
            };
            if absolute_path.exists() {
                tracing::info!("待打开文件: {:?}", absolute_path);
                Some(absolute_path.to_string_lossy().to_string())
            } else {
                tracing::warn!("文件不存在: {:?}", absolute_path);
                None
            }
        } else {
            None
        }
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(AppState {
            active_file: None,
            pending_open_file: pending_file,
        }))
        .manage(Mutex::new(syntax::SyntaxHighlighter::new()))
        .manage(Mutex::new(search_index))
        .invoke_handler(tauri::generate_handler![
            commands::fs::read_file,
            commands::fs::write_file,
            commands::fs::list_directory,
            commands::syntax::highlight_code,
            commands::export::export_html,
            commands::export::export_pdf,
            commands::export::save_export,
            commands::search::search_files,
            commands::search::rebuild_index,
            get_pending_open_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_pending_open_file(state: tauri::State<'_, Mutex<AppState>>) -> Option<String> {
    let mut s = state.lock().unwrap();
    s.pending_open_file.take()
}
