interface ElectronWebviewElement extends HTMLElement {
  canGoBack: () => boolean;
  canGoForward: () => boolean;
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
