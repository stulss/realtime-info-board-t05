let currentTime = Date.now();

export function subscribeClock(onStoreChange: () => void): () => void {
  const timer = window.setInterval(() => {
    currentTime = Date.now();
    onStoreChange();
  }, 1_000);
  return () => window.clearInterval(timer);
}

export function getCurrentTime(): number {
  return currentTime;
}

export function getServerTime(): number {
  return 0;
}
