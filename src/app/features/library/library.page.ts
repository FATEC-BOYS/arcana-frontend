import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ArcanaService, errorText } from "../../core/api/arcana.service";
import { Card } from "../../core/api/models";
@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: ` <section class="library-page">
    <div class="page-heading">
      <p class="eyebrow">O ARCANO SE REVELA</p>
      <h1>As cartas que <em>falam.</em></h1>
      <p class="lead">
        78 símbolos para explorar seu momento. Conheça os significados que
        sustentam as leituras.
      </p>
    </div>
    <div class="catalog-filters">
      <label for="search">Buscar uma carta</label
      ><input
        id="search"
        type="search"
        [ngModel]="query()"
        (ngModelChange)="query.set($event)"
        placeholder="Nome ou significado"
      /><label for="arcana">Arcanos</label
      ><select
        id="arcana"
        [ngModel]="arcana()"
        (ngModelChange)="arcana.set($event)"
      >
        <option value="all">Todos</option>
        <option value="major">Maiores</option>
        <option value="minor">Menores</option>
      </select>
    </div>
    @if (loading()) {
      <p class="feedback" role="status">Abrindo o baralho…</p>
    }
    @if (error()) {
      <p class="feedback error" role="alert">
        {{ error() }}
        <button class="text-link" (click)="load()">Tentar novamente</button>
      </p>
    }
    <p class="muted small" aria-live="polite">{{ filtered().length }} cartas</p>
    <div class="library-grid">
      @for (card of filtered(); track card.id) {
        <article class="library-card">
          <div class="catalog-sigil" aria-hidden="true">
            {{
              card.arcana === "major"
                ? "✦"
                : card.suit === "cups"
                  ? "☽"
                  : card.suit === "swords"
                    ? "✧"
                    : "◇"
            }}
          </div>
          <div>
            <p class="eyebrow">
              {{ card.arcana === "major" ? "ARCANO MAIOR" : "ARCANO MENOR" }}
            </p>
            <h2>{{ card.name }}</h2>
            <p>{{ card.meaning }}</p>
          </div>
        </article>
      }
    </div>
    @if (!loading() && !error() && !filtered().length) {
      <p class="feedback">Nenhuma carta encontrada. Experimente outro termo.</p>
    }
    <a class="button" routerLink="/leitura">Abrir uma tiragem ↗</a>
  </section>`,
})
export class LibraryPage {
  private readonly api = inject(ArcanaService);
  readonly cards = signal<Card[]>([]);
  readonly query = signal("");
  readonly arcana = signal("all");
  readonly loading = signal(true);
  readonly error = signal("");
  readonly filtered = computed(() =>
    this.cards().filter(
      (card) =>
        (this.arcana() === "all" || card.arcana === this.arcana()) &&
        (card.name + " " + card.meaning)
          .toLocaleLowerCase("pt-BR")
          .includes(this.query().trim().toLocaleLowerCase("pt-BR")),
    ),
  );
  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set("");
    try {
      this.cards.set(
        await this.api.request<Card[]>(
          "/cards",
          "GET",
          undefined,
          undefined,
          false,
        ),
      );
    } catch (e) {
      this.error.set(errorText(e));
    } finally {
      this.loading.set(false);
    }
  }
}
