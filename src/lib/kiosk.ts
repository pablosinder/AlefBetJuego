// "Modo niño": pantalla completa y protección contra salidas accidentales.

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };

export function isFullscreen(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
}

/** Abierta como app instalada (ícono en la pantalla de inicio). */
export function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Debe llamarse dentro de un toque. En iPhone no existe: allí se usa "Agregar a inicio". */
export function enterFullscreen() {
  if (isFullscreen()) return;
  const el = document.documentElement as FsEl;
  try {
    const p = el.requestFullscreen?.({ navigationUI: 'hide' }) ?? el.webkitRequestFullscreen?.();
    p?.catch?.(() => {});
  } catch {
    // no soportado
  }
}

export function exitFullscreen() {
  const d = document as FsDoc;
  if (!isFullscreen()) return;
  try {
    (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.())?.catch?.(() => {});
  } catch {
    // ignorar
  }
}

let wakeLock: { release: () => Promise<void> } | null = null;
async function keepAwake() {
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    if (nav.wakeLock && !wakeLock) {
      wakeLock = await nav.wakeLock.request('screen');
      (wakeLock as unknown as EventTarget).addEventListener?.('release', () => (wakeLock = null));
    }
  } catch {
    // ignorar
  }
}

/**
 * Activa las protecciones. `onBack` se llama cuando se toca "atrás" del
 * navegador o del teléfono: en vez de salir de la página, vuelve al menú.
 * Devuelve una función para desactivarlas (salida de padres).
 */
export function lockDown(onBack: () => void): () => void {
  const stop = (e: Event) => e.preventDefault();

  // Botón/gesto "atrás": se queda en la página.
  history.pushState({ kiosk: true }, '');
  const onPop = () => {
    history.pushState({ kiosk: true }, '');
    onBack();
  };

  // Cerrar o recargar la pestaña pide confirmación.
  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };

  // Si se salió de pantalla completa, el siguiente toque la vuelve a activar.
  const onPointer = () => {
    if (!isStandalone()) enterFullscreen();
    void keepAwake();
  };

  const onVisible = () => {
    if (document.visibilityState === 'visible') void keepAwake();
  };

  window.addEventListener('popstate', onPop);
  window.addEventListener('beforeunload', onBeforeUnload);
  document.addEventListener('contextmenu', stop);
  document.addEventListener('gesturestart', stop); // zoom con dos dedos en iOS
  document.addEventListener('dragstart', stop);
  document.addEventListener('pointerdown', onPointer, true);
  document.addEventListener('visibilitychange', onVisible);
  void keepAwake();

  return () => {
    window.removeEventListener('popstate', onPop);
    window.removeEventListener('beforeunload', onBeforeUnload);
    document.removeEventListener('contextmenu', stop);
    document.removeEventListener('gesturestart', stop);
    document.removeEventListener('dragstart', stop);
    document.removeEventListener('pointerdown', onPointer, true);
    document.removeEventListener('visibilitychange', onVisible);
    void wakeLock?.release();
    wakeLock = null;
  };
}
