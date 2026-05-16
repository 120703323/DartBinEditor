use crate::search::{SearchError, SearchIndex, SearchResult};
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub fn search_files(
    query: String,
    state: State<'_, Mutex<SearchIndex>>,
) -> Result<Vec<SearchResult>, SearchError> {
    let index = state.lock().unwrap();
    index.search(&query)
}

#[tauri::command]
pub fn rebuild_index(
    root_path: String,
    state: State<'_, Mutex<SearchIndex>>,
) -> Result<usize, SearchError> {
    let index = state.lock().unwrap();
    index.rebuild(&root_path)
}
