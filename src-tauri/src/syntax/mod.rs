use syntect::highlighting::ThemeSet;
use syntect::html::highlighted_html_for_string;
use syntect::parsing::SyntaxSet;

pub struct SyntaxHighlighter {
    ss: SyntaxSet,
    ts: ThemeSet,
}

impl SyntaxHighlighter {
    pub fn new() -> Self {
        Self {
            ss: SyntaxSet::load_defaults_newlines(),
            ts: ThemeSet::load_defaults(),
        }
    }

    pub fn highlight(&self, code: &str, lang: &str, dark_mode: bool) -> Result<String, String> {
        let syntax = if lang.is_empty() {
            self.ss.find_syntax_plain_text()
        } else {
            self.ss
                .find_syntax_by_token(lang)
                .unwrap_or_else(|| self.ss.find_syntax_plain_text())
        };

        let theme_name = if dark_mode {
            "Base16-Eighties.Dark"
        } else {
            "InspiredGitHub"
        };

        let theme = self
            .ts
            .themes
            .get(theme_name)
            .ok_or_else(|| format!("theme '{}' not found", theme_name))?;

        highlighted_html_for_string(code, &self.ss, syntax, theme)
            .map_err(|e| format!("highlight error: {}", e))
    }
}
