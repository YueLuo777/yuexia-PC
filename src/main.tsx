import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './app/App';
import { resetWorkbenchAssociationsForNewAppSession } from './features/workbench/model/workbenchAssociationCleanup';
import { resetWorkbenchTransientAiDraftsForNewAppSession } from './features/workbench/model/workbenchTransientAiCleanup';
import { runLegacyMigration } from './shared/migration/legacyMigration';
import './shared/styles/index.css';

runLegacyMigration();
resetWorkbenchAssociationsForNewAppSession();
resetWorkbenchTransientAiDraftsForNewAppSession();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
