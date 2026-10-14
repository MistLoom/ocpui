import type { RefLike } from './notify-channel';

export interface LoadingHostBindings {
  loadingBarVisible: RefLike<boolean>;
  loadingOverlayVisible: RefLike<boolean>;
  loadingOverlayText: RefLike<string>;
  loadingOverlayFullscreen: RefLike<boolean>;
}

export interface UiLoadingFeedback {
  bar: {
    start(): void;
    finish(): void;
    error(): void;
  };
  overlay: {
    show(opts?: { text?: string; fullscreen?: boolean }): void;
    hide(): void;
  };
}

let host: LoadingHostBindings | null = null;

export function bindLoadingHost(refs: LoadingHostBindings): void {
  host = refs;
}

export function createLoadingChannel(): UiLoadingFeedback {
  return {
    bar: {
      start() {
        if (host) host.loadingBarVisible.value = true;
      },
      finish() {
        if (host) host.loadingBarVisible.value = false;
      },
      error() {
        if (!host) return;
        host.loadingBarVisible.value = true;
        window.setTimeout(() => {
          if (host) host.loadingBarVisible.value = false;
        }, 2500);
      },
    },
    overlay: {
      show(opts) {
        if (!host) return;
        host.loadingOverlayText.value = opts?.text ?? '加载中...';
        host.loadingOverlayFullscreen.value = opts?.fullscreen ?? true;
        host.loadingOverlayVisible.value = true;
      },
      hide() {
        if (host) host.loadingOverlayVisible.value = false;
      },
    },
  };
}
