interface ElectronWebviewElement extends HTMLElement {
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  capturePage?: () => Promise<{ toDataURL: () => string }>;
  executeJavaScript?: (code: string, userGesture?: boolean) => Promise<unknown>;
  getTitle?: () => string;
  getURL: () => string;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
}

declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<React.HTMLAttributes<ElectronWebviewElement>, ElectronWebviewElement> & {
      src?: string;
      partition?: string;
    };
  }
}
