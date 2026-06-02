import type { Store } from '../persistence/store';

export function applyAppearance(store: typeof Store): void {
  const ui = store.getUiSettings();
  document.documentElement.dataset.appearance = ui.appearance;
  document.documentElement.classList.toggle('settings-reduced-motion', ui.reducedMotion);
  document.body.classList.toggle('settings-reduced-motion', ui.reducedMotion);
}
