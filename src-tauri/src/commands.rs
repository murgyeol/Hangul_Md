use serde::Serialize;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_dialog::MessageDialogButtons;
use std::fs;

#[derive(Serialize, Clone)]
pub struct FileData {
    pub path: String,
    pub content: String,
}

#[tauri::command]
pub fn confirm_unsaved(app: tauri::AppHandle, message: String) -> Result<String, String> {
    // Use a simple three-button dialog
    let answer = app
        .dialog()
        .message(&message)
        .title("한글MD")
        .buttons(MessageDialogButtons::OkCancelCustom("Save".to_string(), "Cancel".to_string()))
        .blocking_show();

    match answer {
        true => Ok("save".to_string()),
        false => Ok("cancel".to_string()),
    }
}

#[tauri::command]
pub fn open_file(app: tauri::AppHandle) -> Result<Option<FileData>, String> {
    let file_path = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md"])
        .blocking_pick_file();

    match file_path {
        Some(path) => {
            let path_str = path.to_string();
            // Remove file:// prefix if present
            let clean_path = if path_str.starts_with("file://") {
                path_str.trim_start_matches("file://").to_string()
            } else {
                path_str
            };
            let content = fs::read_to_string(&clean_path)
                .map_err(|e| format!("Failed to read file: {}", e))?;
            Ok(Some(FileData {
                path: clean_path,
                content,
            }))
        }
        None => Ok(None),
    }
}

#[tauri::command]
pub fn save_file(path: String, content: String) -> Result<bool, String> {
    fs::write(&path, &content).map_err(|e| format!("Failed to save file: {}", e))?;
    Ok(true)
}

#[tauri::command]
pub fn save_file_as(app: tauri::AppHandle, content: String) -> Result<Option<String>, String> {
    let file_path = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md"])
        .set_file_name("untitled.md")
        .blocking_save_file();

    match file_path {
        Some(path) => {
            let path_str = path.to_string();
            let clean_path = if path_str.starts_with("file://") {
                path_str.trim_start_matches("file://").to_string()
            } else {
                path_str
            };
            fs::write(&clean_path, &content)
                .map_err(|e| format!("Failed to save file: {}", e))?;
            Ok(Some(clean_path))
        }
        None => Ok(None),
    }
}
