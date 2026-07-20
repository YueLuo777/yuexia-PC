function fitWindowBoundsToWorkArea(inputBounds, workArea) {
  const requestedBounds = { ...inputBounds };
  const requestedWidth = Math.max(1, Math.round(Number(requestedBounds.width) || 1));
  const requestedHeight = Math.max(1, Math.round(Number(requestedBounds.height) || 1));
  const width = Math.min(requestedWidth, Math.max(1, Math.round(workArea.width)));
  const height = Math.min(requestedHeight, Math.max(1, Math.round(workArea.height)));
  const hasSavedPosition = Number.isFinite(requestedBounds.x) && Number.isFinite(requestedBounds.y);

  if (!hasSavedPosition) return { ...requestedBounds, width, height };

  const x = Math.min(Math.max(Math.round(requestedBounds.x), workArea.x), workArea.x + workArea.width - width);
  const y = Math.min(Math.max(Math.round(requestedBounds.y), workArea.y), workArea.y + workArea.height - height);
  return { ...requestedBounds, x, y, width, height };
}

function fitCenteredWindowSizeToWorkArea(inputSize, workArea) {
  const fitted = fitWindowBoundsToWorkArea(inputSize, workArea);
  return {
    width: fitted.width,
    height: fitted.height,
    x: workArea.x + Math.floor((workArea.width - fitted.width) / 2),
    y: workArea.y + Math.floor((workArea.height - fitted.height) / 2),
  };
}

module.exports = { fitCenteredWindowSizeToWorkArea, fitWindowBoundsToWorkArea };
