import { useEffect } from 'react';

type CloseHandler = () => void;

interface EscapeEntry {
  id: symbol;
  onClose: CloseHandler;
}

const escapeStack: EscapeEntry[] = [];
let isListening = false;

function handleEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  const top = escapeStack[escapeStack.length - 1];
  if (!top) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  top.onClose();
}

function ensureListener() {
  if (isListening) return;
  window.addEventListener('keydown', handleEscape, true);
  isListening = true;
}

function removeEntry(id: symbol) {
  const index = escapeStack.findIndex((entry) => entry.id === id);
  if (index >= 0) escapeStack.splice(index, 1);
}

export function useTopModalEscape(isOpen: boolean, onClose: CloseHandler) {
  useEffect(() => {
    if (!isOpen) return;
    ensureListener();
    const id = Symbol('modal-escape');
    escapeStack.push({ id, onClose });
    return () => removeEntry(id);
  }, [isOpen, onClose]);
}
