import { useLayoutEffect, useRef } from 'react';

type AutoFitTextProps = {
  children: string;
  className?: string;
  maxFontSize?: number;
  minFontSize?: number;
};

export function calculateAutoFitFontSize(
  availableWidth: number,
  naturalWidth: number,
  minFontSize: number,
  maxFontSize: number,
) {
  if (availableWidth <= 0 || naturalWidth <= 0) return maxFontSize;
  return Math.max(minFontSize, Math.min(maxFontSize, maxFontSize * (availableWidth / naturalWidth)));
}

export function AutoFitText({ children, className = '', maxFontSize = 18, minFontSize = 11 }: AutoFitTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fitText = () => {
      text.style.fontSize = `${maxFontSize}px`;
      text.style.transform = 'none';
      const availableWidth = container.clientWidth;
      const naturalWidth = text.scrollWidth;
      const fittedFontSize = calculateAutoFitFontSize(availableWidth, naturalWidth, minFontSize, maxFontSize);
      text.style.fontSize = `${Number(fittedFontSize.toFixed(2))}px`;

      const fittedWidth = text.scrollWidth;
      const finalScale = fittedWidth > availableWidth && availableWidth > 0 ? availableWidth / fittedWidth : 1;
      text.style.transform = finalScale < 1 ? `scaleX(${finalScale})` : 'none';
    };

    fitText();
    const resizeObserver = new ResizeObserver(fitText);
    resizeObserver.observe(container);
    void document.fonts?.ready.then(fitText);
    return () => resizeObserver.disconnect();
  }, [children, maxFontSize, minFontSize]);

  return (
    <strong
      ref={containerRef}
      data-auto-fit-text
      className={`block min-w-0 overflow-hidden whitespace-nowrap text-right leading-none tabular-nums ${className}`}
      title={children}
    >
      <span ref={textRef} className="inline-block origin-right whitespace-nowrap">
        {children}
      </span>
    </strong>
  );
}
