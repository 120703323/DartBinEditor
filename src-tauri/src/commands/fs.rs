use std::path::PathBuf;

#[derive(Debug, thiserror::Error)]
pub enum FsError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Path not found: {0}")]
    NotFound(String),
    #[error("Invalid path: {0}")]
    InvalidPath(String),
}

impl serde::Serialize for FsError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, FsError> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err(FsError::NotFound(path));
    }
    std::fs::read_to_string(&p).map_err(FsError::Io)
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), FsError> {
    let p = PathBuf::from(&path);
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&p, &content).map_err(FsError::Io)
}

#[tauri::command]
pub fn list_directory(path: String) -> Result<Vec<serde_json::Value>, FsError> {
    let p = PathBuf::from(&path);
    if !p.is_dir() {
        return Err(FsError::NotFound(path));
    }

    let mut entries = Vec::new();
    for entry in std::fs::read_dir(&p)? {
        let entry = entry?;
        let ft = entry.file_type()?;
        entries.push(serde_json::json!({
            "name": entry.file_name().to_string_lossy(),
            "path": entry.path().to_string_lossy(),
            "is_dir": ft.is_dir(),
            "is_file": ft.is_file(),
        }));
    }
    entries.sort_by(|a, b| {
        let a_dir = a["is_dir"].as_bool().unwrap_or(false);
        let b_dir = b["is_dir"].as_bool().unwrap_or(false);
        b_dir.cmp(&a_dir).then(a["name"].as_str().cmp(&b["name"].as_str()))
    });
    Ok(entries)
}
