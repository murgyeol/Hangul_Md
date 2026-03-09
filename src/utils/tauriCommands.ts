/**
 * tauriCommands.ts — Tauri backend command wrappers
 * Provides browser-compatible stubs when not running in Tauri.
 */

import type { FileData } from './types';

// Check if running in Tauri
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Confirm unsaved changes dialog
 * Returns: "save" | "discard" | "cancel"
 */
export async function confirmUnsaved(message: string): Promise<string> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<string>('confirm_unsaved', { message });
  }
  // Browser fallback
  const result = window.confirm(message + '\n\nOK = Save, Cancel = Discard');
  return result ? 'save' : 'discard';
}

/**
 * Open file dialog and read .md file
 * Returns FileData or null if cancelled
 */
export async function openFile(): Promise<FileData | null> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<FileData | null>('open_file');
  }
  // Browser fallback: use file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const content = await file.text();
      resolve({
        path: file.name,
        content,
      });
    };
    input.click();
  });
}

/**
 * Save file to existing path
 */
export async function saveFile(path: string, content: string): Promise<boolean> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<boolean>('save_file', { path, content });
  }
  // Browser fallback: download
  downloadFile(content, path.split(/[\\/]/).pop() || 'untitled.md');
  return true;
}

/**
 * Save As dialog
 * Returns new path or null if cancelled
 */
export async function saveFileAs(content: string): Promise<string | null> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<string | null>('save_file_as', { content });
  }
  // Browser fallback: download
  downloadFile(content, 'untitled.md');
  return 'untitled.md';
}

// Helper: browser file download
function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Window management stubs (Tauri-only)
 */
export async function minimizeWindow(): Promise<void> {
  if (isTauri()) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().minimize();
  }
}

export async function maximizeWindow(): Promise<void> {
  if (isTauri()) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    const isMaximized = await win.isMaximized();
    if (isMaximized) {
      await win.unmaximize();
    } else {
      await win.maximize();
    }
  }
}

export async function closeWindow(): Promise<void> {
  if (isTauri()) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().close();
  }
}
