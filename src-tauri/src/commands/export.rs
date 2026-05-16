use pulldown_cmark::{Parser, html};
use std::path::Path;

#[derive(Debug, thiserror::Error)]
pub enum ExportError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Read file error: {0}")]
    Read(String),
    #[error("Export error: {0}")]
    Other(String),
}

impl serde::Serialize for ExportError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

fn md_to_html(markdown: &str) -> String {
    let parser = Parser::new(markdown);
    let mut html_buf = String::new();
    html::push_html(&mut html_buf, parser);
    html_buf
}

fn wrap_html(body: &str) -> String {
    format!(
        r#"<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DartBinEditor Export</title>
<style>
  body {{
    font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
    font-size: 16px;
    line-height: 1.75;
    max-width: 780px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    color: #1a1a2e;
    background: #fff;
  }}
  h1, h2, h3 {{ font-family: 'Literata', 'Noto Serif SC', serif; font-weight: 600; }}
  h1 {{ font-size: 2rem; margin: 1.5em 0 0.5em; }}
  h2 {{ font-size: 1.5rem; margin: 1.25em 0 0.4em; }}
  h3 {{ font-size: 1.25rem; margin: 1em 0 0.3em; }}
  code {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875em;
    background: #f0f0f5;
    padding: 0.15em 0.3em;
    border-radius: 0.25rem;
  }}
  pre {{
    background: #f0f0f5;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }}
  pre code {{ background: none; padding: 0; }}
  blockquote {{
    border-left: 3px solid #4a6cf7;
    margin: 1em 0;
    padding-left: 1rem;
    color: #666;
  }}
  img {{ max-width: 100%; border-radius: 0.5rem; }}
  table {{ border-collapse: collapse; width: 100%; margin: 1em 0; }}
  th, td {{ border: 1px solid #ddd; padding: 0.5rem; text-align: left; }}
  th {{ background: #f5f5f5; }}
  @media print {{
    body {{ padding: 0; }}
    pre {{ break-inside: avoid; }}
  }}
</style>
</head>
<body>{}</body>
</html>"#,
        body
    )
}

#[tauri::command]
pub fn export_html(file_path: String) -> Result<String, ExportError> {
    let path = Path::new(&file_path);
    if !path.exists() {
        return Err(ExportError::Read(format!("File not found: {}", file_path)));
    }
    let markdown =
        std::fs::read_to_string(path).map_err(|e| ExportError::Read(e.to_string()))?;
    let body = md_to_html(&markdown);
    Ok(wrap_html(&body))
}

#[tauri::command]
pub fn export_pdf(file_path: String) -> Result<String, ExportError> {
    let path = Path::new(&file_path);
    if !path.exists() {
        return Err(ExportError::Read(format!("File not found: {}", file_path)));
    }
    let markdown =
        std::fs::read_to_string(path).map_err(|e| ExportError::Read(e.to_string()))?;
    let body = md_to_html(&markdown);
    Ok(wrap_html(&body))
}

#[tauri::command]
pub fn save_export(path: String, content: String) -> Result<(), ExportError> {
    std::fs::write(&path, &content).map_err(ExportError::Io)
}
