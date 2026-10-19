import { CanDeactivateFn } from "@angular/router";

/** Only in-memory form state is compared; private drafts are never persisted locally. */
export interface DraftAware {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<DraftAware> = (page) =>
  !page.hasUnsavedChanges() ||
  window.confirm(
    "Você tem anotações não salvas. Deseja sair e descartar as alterações?",
  );
