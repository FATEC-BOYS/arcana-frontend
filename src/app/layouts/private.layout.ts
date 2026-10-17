import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ShellComponent } from "./shell.component";
@Component({
  standalone: true,
  imports: [RouterOutlet, ShellComponent],
  template:
    '<arcana-shell [privateArea]="true"><router-outlet /></arcana-shell>',
})
export class PrivateLayout {}
