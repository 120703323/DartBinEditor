use std::path::Path;
use std::sync::Mutex;
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::*;
use tantivy::{doc, Index, IndexWriter, SnippetGenerator, TantivyDocument};

#[derive(Debug, thiserror::Error)]
pub enum SearchError {
    #[error("Tantivy error: {0}")]
    Tantivy(#[from] tantivy::TantivyError),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Query parse error: {0}")]
    QueryParse(String),
    #[error("Search error: {0}")]
    Other(String),
}

impl serde::Serialize for SearchError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(serde::Serialize, Clone)]
pub struct SearchResult {
    pub path: String,
    pub title: String,
    pub snippet: String,
    pub score: f32,
}

pub struct SearchIndex {
    index: Index,
    writer: Mutex<IndexWriter>,
    path_field: Field,
    title_field: Field,
    body_field: Field,
}

impl SearchIndex {
    pub fn new() -> Result<Self, SearchError> {
        let mut schema_builder = Schema::builder();
        let path_field = schema_builder.add_text_field("path", STRING | STORED);
        let title_field = schema_builder.add_text_field("title", TEXT | STORED);
        let body_field = schema_builder.add_text_field("body", TEXT);
        let schema = schema_builder.build();

        let index_path = std::env::temp_dir().join("dart-bin-editor-search");
        if index_path.exists() {
            std::fs::remove_dir_all(&index_path)?;
        }
        std::fs::create_dir_all(&index_path)?;
        let index = Index::create_in_dir(&index_path, schema)?;

        let writer = index.writer(50_000_000)?;

        Ok(SearchIndex {
            index,
            writer: Mutex::new(writer),
            path_field,
            title_field,
            body_field,
        })
    }

    pub fn add_document(&self, path: &str, title: &str, body: &str) -> Result<(), SearchError> {
        let mut writer = self.writer.lock().unwrap();
        let _ = writer.add_document(doc!(
            self.path_field => path,
            self.title_field => title,
            self.body_field => body,
        ));
        writer.commit()?;
        Ok(())
    }

    pub fn search(&self, query_str: &str) -> Result<Vec<SearchResult>, SearchError> {
        let reader = self.index.reader()?;
        let searcher = reader.searcher();

        let query_parser =
            QueryParser::for_index(&self.index, vec![self.title_field, self.body_field]);
        let query = query_parser
            .parse_query(query_str)
            .map_err(|e| SearchError::QueryParse(e.to_string()))?;

        let top_docs = searcher.search(&query, &TopDocs::with_limit(20))?;

        let mut snippet_generator =
            SnippetGenerator::create(&searcher, &query, self.body_field)?;
        snippet_generator.set_max_num_chars(200);

        let results: Vec<SearchResult> = top_docs
            .into_iter()
            .map(|(score, doc_address)| {
                let doc: TantivyDocument = searcher.doc::<TantivyDocument>(doc_address)?;
                let path_val = doc
                    .get_first(self.path_field)
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let title_val = doc
                    .get_first(self.title_field)
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();

                let snippet = snippet_generator.snippet_from_doc(&doc);
                let snippet_str = snippet.to_html();

                Ok(SearchResult {
                    path: path_val,
                    title: title_val,
                    snippet: snippet_str,
                    score,
                })
            })
            .collect::<Result<Vec<_>, SearchError>>()?;

        Ok(results)
    }

    pub fn rebuild(&self, root_path: &str) -> Result<usize, SearchError> {
        let mut writer = self.writer.lock().unwrap();
        writer.delete_all_documents()?;
        writer.commit()?;

        let root = Path::new(root_path);
        let mut count = 0;
        let mut dirs = vec![root.to_path_buf()];

        while let Some(dir) = dirs.pop() {
            if let Ok(entries) = std::fs::read_dir(&dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_dir() {
                        dirs.push(path);
                    } else if path.extension().map_or(false, |ext| ext == "md") {
                        if let Ok(content) = std::fs::read_to_string(&path) {
                            let title = path
                                .file_stem()
                                .map(|s| s.to_string_lossy().to_string())
                                .unwrap_or_default();
                            let _ = writer.add_document(doc!(
                                self.path_field => path.to_string_lossy().to_string(),
                                self.title_field => title,
                                self.body_field => content,
                            ));
                            count += 1;
                        }
                    }
                }
            }
        }

        writer.commit()?;
        Ok(count)
    }
}
