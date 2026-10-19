import { inject } from "@angular/core";
import { Router, Routes } from "@angular/router";
import { authGuard, guestGuard } from "./core/auth/auth.guard";
import { unsavedChangesGuard } from "./core/auth/unsaved-changes.guard";
import { ArcanaService } from "./core/api/arcana.service";
const account = () =>
  import("./features/account/account.page").then((m) => m.AccountPage);
export const routes: Routes = [
  {
    path: "app",
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import("./layouts/private.layout").then((m) => m.PrivateLayout),
    children: [
      { path: "", pathMatch: "full", redirectTo: "diario" },
      {
        path: "diario",
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import("./features/diary/diary.page").then((m) => m.DiaryPage),
      },
      {
        path: "leitura",
        loadComponent: () =>
          import("./features/reading-setup/reading-setup.page").then(
            (m) => m.ReadingSetupPage,
          ),
      },
      {
        path: "mapa",
        loadComponent: () =>
          import("./features/astrology/astrology.page").then(
            (m) => m.AstrologyPage,
          ),
      },
      {
        path: "mesa/:id",
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import("./features/reading-room/reading-room.page").then(
            (m) => m.ReadingRoomPage,
          ),
      },
      { path: "conta", data: { mode: "profile" }, loadComponent: account },
      { path: "**", redirectTo: "diario" },
    ],
  },
  // Preserve previously shared URLs; the destination applies the authentication guard.
  { path: "leitura", redirectTo: "app/leitura" },
  { path: "mapa", redirectTo: "app/mapa" },
  { path: "diario", redirectTo: "app/diario" },
  { path: "mesa/:id", redirectTo: "app/mesa/:id" },
  { path: "mesa", redirectTo: "app/leitura" },
  {
    path: "conta",
    redirectTo: () =>
      inject(Router).parseUrl(
        inject(ArcanaService).signedIn() ? "/app/conta" : "/cadastro",
      ),
  },
  {
    path: "",
    loadComponent: () =>
      import("./layouts/public.layout").then((m) => m.PublicLayout),
    children: [
      {
        path: "",
        pathMatch: "full",
        loadComponent: () =>
          import("./features/home/home.page").then((m) => m.HomePage),
      },
      {
        path: "biblioteca",
        loadComponent: () =>
          import("./features/library/library.page").then((m) => m.LibraryPage),
      },
      {
        path: "cadastro",
        canActivate: [guestGuard],
        data: { mode: "register" },
        loadComponent: account,
      },
      {
        path: "entrar",
        canActivate: [guestGuard],
        data: { mode: "login" },
        loadComponent: account,
      },
      {
        path: "recuperar-senha",
        canActivate: [guestGuard],
        data: { mode: "forgot" },
        loadComponent: account,
      },
      {
        path: "redefinir-senha",
        data: { mode: "reset" },
        loadComponent: account,
      },
      {
        path: "**",
        loadComponent: () =>
          import("./shared/ui/pending.page").then((m) => m.PendingPage),
        data: {
          title: "Caminho não encontrado",
          subtitle: "Vamos voltar às cartas?",
          description: "Esta página não existe.",
        },
      },
    ],
  },
];
