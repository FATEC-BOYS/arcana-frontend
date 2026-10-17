import { Routes } from "@angular/router";
import { authGuard } from "./core/auth/auth.guard";
export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    loadComponent: () =>
      import("./features/home/home.page").then((m) => m.HomePage),
  },
  {
    path: "conta",
    data: { mode: "register" },
    loadComponent: () =>
      import("./features/account/account.page").then((m) => m.AccountPage),
  },
  {
    path: "entrar",
    data: { mode: "login" },
    loadComponent: () =>
      import("./features/account/account.page").then((m) => m.AccountPage),
  },
  {
    path: "recuperar-senha",
    data: { mode: "forgot" },
    loadComponent: () =>
      import("./features/account/account.page").then((m) => m.AccountPage),
  },
  {
    path: "redefinir-senha",
    data: { mode: "reset" },
    loadComponent: () =>
      import("./features/account/account.page").then((m) => m.AccountPage),
  },
  {
    path: "diario",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/diary/diary.page").then((m) => m.DiaryPage),
  },
  {
    path: "leitura",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/reading-setup/reading-setup.page").then(
        (m) => m.ReadingSetupPage,
      ),
  },
  {
    path: "mapa",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/astrology/astrology.page").then(
        (m) => m.AstrologyPage,
      ),
  },
  {
    path: "biblioteca",
    loadComponent: () =>
      import("./features/library/library.page").then((m) => m.LibraryPage),
  },
  {
    path: "mesa/:id",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/reading-room/reading-room.page").then(
        (m) => m.ReadingRoomPage,
      ),
  },
  { path: "mesa", redirectTo: "leitura" },
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
];
