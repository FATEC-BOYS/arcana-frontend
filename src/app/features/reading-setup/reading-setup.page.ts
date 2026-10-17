import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ArcanaService, errorText } from "../../core/api/arcana.service";
import { Reading } from "../../core/api/models";
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: ` <section class="page narrow">
    <p class="eyebrow">ANTES DE VIRAR AS CARTAS</p>
    <h1>O que pede<br /><em>sua atenção?</em></h1>
    <p class="lead">Dê espaço à pergunta que trouxe você até aqui.</p>
    <div class="ritual-tabs">
      <span class="active">✦ Tarot</span><a routerLink="/mapa">☽ Mapa natal</a>
    </div>
    <form #form="ngForm" (ngSubmit)="prepare()">
      <fieldset [disabled]="busy()">
        <label for="question">Sua pergunta</label
        ><textarea
          id="question"
          name="question"
          [(ngModel)]="question"
          required
          minlength="5"
          maxlength="2000"
          rows="4"
          placeholder="Sobre o que você gostaria de refletir?"
          (ngModelChange)="changed()"
        ></textarea>
        <p class="muted small">
          Entre 5 e 2.000 caracteres. Sua leitura será guardada no seu
          histórico.
        </p>
        <label for="spread">Sua tiragem</label
        ><select
          id="spread"
          name="spread"
          [(ngModel)]="spread"
          (ngModelChange)="changed()"
        >
          <option value="three_cards">
            Três cartas · momento, atenção e possibilidade
          </option>
          <option value="daily">Carta do dia · uma reflexão</option>
        </select>
        <label class="check"
          ><input
            type="checkbox"
            name="reversed"
            [(ngModel)]="reversed"
            (ngModelChange)="changed()"
          />
          Incluir cartas invertidas</label
        >
        <button
          class="button"
          [disabled]="busy() || form.invalid || question.trim().length < 5"
        >
          {{ busy() ? "Abrindo sua mesa…" : "Preparar meu ritual ↗" }}
        </button>
        @if (error()) {
          <p class="feedback error" role="alert">{{ error() }}</p>
        }
      </fieldset>
    </form>
    <p class="small muted">
      Uma experiência simbólica para entretenimento e reflexão.
    </p>
  </section>`,
})
export class ReadingSetupPage {
  private readonly api = inject(ArcanaService);
  private readonly router = inject(Router);
  question = "";
  spread = "three_cards";
  reversed = true;
  readonly busy = signal(false);
  readonly error = signal("");
  private key = crypto.randomUUID();
  changed() {
    if (!this.busy()) this.key = crypto.randomUUID();
  }
  async prepare() {
    if (this.busy() || this.question.trim().length < 5) return;
    this.busy.set(true);
    this.error.set("");
    try {
      const reading = await this.api.request<Reading>(
        "/readings",
        "POST",
        {
          question: this.question.trim(),
          kind: "tarot",
          spread: this.spread,
          allow_reversed: this.reversed,
        },
        this.key,
      );
      await this.router.navigate(["/mesa", reading.id]);
    } catch (e) {
      this.error.set(errorText(e));
    } finally {
      this.busy.set(false);
    }
  }
}
