export interface PrintSettings {
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  excludeFirstPage: boolean;
}

export interface DocumentState {
  filePath: string | null;
  savedContent: string;
  isDirty: boolean;
  fileName: string;
  printSettings: PrintSettings;
}

export interface FileData {
  path: string;
  content: string;
}

export const DEFAULT_FILE_NAME = '새 문서';

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  headerLeft: '',
  headerCenter: '',
  headerRight: '',
  footerLeft: '',
  footerCenter: '',
  footerRight: '',
  excludeFirstPage: false,
};

export function isDefaultPrintSettings(settings: PrintSettings): boolean {
  return (
    settings.headerLeft === '' &&
    settings.headerCenter === '' &&
    settings.headerRight === '' &&
    settings.footerLeft === '' &&
    settings.footerCenter === '' &&
    settings.footerRight === '' &&
    settings.excludeFirstPage === false
  );
}

export function printSettingsToYaml(settings: PrintSettings): Record<string, unknown> {
  return {
    header_left: settings.headerLeft,
    header_center: settings.headerCenter,
    header_right: settings.headerRight,
    footer_left: settings.footerLeft,
    footer_center: settings.footerCenter,
    footer_right: settings.footerRight,
    exclude_first_page: settings.excludeFirstPage,
  };
}

export function yamlToPrintSettings(data: Record<string, unknown>): PrintSettings {
  return {
    headerLeft: (data.header_left as string) ?? '',
    headerCenter: (data.header_center as string) ?? '',
    headerRight: (data.header_right as string) ?? '',
    footerLeft: (data.footer_left as string) ?? '',
    footerCenter: (data.footer_center as string) ?? '',
    footerRight: (data.footer_right as string) ?? '',
    excludeFirstPage: (data.exclude_first_page as boolean) ?? false,
  };
}
