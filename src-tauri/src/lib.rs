mod commands;
mod search;
mod syntax;

use std::sync::Mutex;

pub struct AppState {
    pub active_file: Option<String>,
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

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(AppState { active_file: None }))
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
