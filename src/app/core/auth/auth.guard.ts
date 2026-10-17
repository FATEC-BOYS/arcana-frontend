import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ArcanaService } from "../api/arcana.service";
export const authGuard: CanActivateFn = (_, state) =>
  inject(ArcanaService).signedIn() ||
  inject(Router).createUrlTree(["/entrar"], {
    queryParams: { returnUrl: state.url },
  });
