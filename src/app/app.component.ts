import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ArcanaService } from "./core/api/arcana.service";
@Component({
  selector: "arcana-root",
  standalone: true,
  imports: [RouterOutlet],
  template: "<router-outlet />",
})
export class AppComponent {
  constructor() {
    const api = inject(ArcanaService);
    if (api.signedIn()) void api.profile().catch(() => {});
  }
}
