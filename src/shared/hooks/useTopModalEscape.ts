import { useEffect, useRef } from 'react';

type CloseHandler = () => void;

interface EscapeEntry {
  id: symbol;
  onClose: CloseHandler;
  order: number;
}

const escapeStack: EscapeEntry[] = [];
let isListening = false;
let orderSeed = 0;

function handleEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  const top = escapeStack.reduce<EscapeEntry | null>(
    (current, entry) => (!current || entry.order > current.order ? entry : current),
    null,
  );
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

export function hasTopModalEscapeHandler() {
  return escapeStack.length > 0;
}

export function useTopModalEscape(isOpen: boolean, onClose: CloseHandler) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    ensureListener();
    const id = Symbol('modal-escape');
    escapeStack.push({ id, order: ++orderSeed, onClose: () => closeRef.current() });
    return () => removeEntry(id);
  }, [isOpen]);
}
