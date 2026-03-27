export {};

declare global {
  interface Window {
    gapi?: {
      load: (library: string, callback: () => void) => void;
    };
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
      picker?: {
        Action: {
          PICKED: string;
          CANCEL: string;
        };
        Response: {
          ACTION: string;
          DOCUMENTS: string;
        };
        Document: {
          ID: string;
          URL: string;
          NAME: string;
        };
        DocsView: new () => {
          setIncludeFolders: (include: boolean) => unknown;
          setSelectFolderEnabled: (enabled: boolean) => unknown;
          setMode: (mode: unknown) => unknown;
        };
        DocsViewMode: {
          LIST: string;
        };
        PickerBuilder: new () => {
          setDeveloperKey: (key: string) => unknown;
          setAppId: (appId: string) => unknown;
          setOAuthToken: (token: string) => unknown;
          addView: (view: unknown) => unknown;
          setCallback: (callback: (data: Record<string, unknown>) => void) => unknown;
          build: () => {
            setVisible: (visible: boolean) => void;
          };
        };
      };
    };
  }
}
