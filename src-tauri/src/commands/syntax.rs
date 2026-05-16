use crate::syntax::SyntaxHighlighter;
use std::sync::Mutex;

#[derive(Debug, thiserror::Error)]
pub enum SyntaxError {
    #[error("Highlight error: {0}")]
    Highlight(String),
}

impl serde::Serialize for SyntaxError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
pub fn highlight_code(
    code: String,
    lang: String,
    dark_mode: bool,
    highlighter: tauri::State<'_, Mutex<SyntaxHighlighter>>,
) -> Result<String, SyntaxError> {
    highlighter
        .lock()
        .map_err(|e| SyntaxError::Highlight(e.to_string()))?
        .highlight(&code, &lang, dark_mode)
        .map_err(SyntaxError::Highlight)
}
