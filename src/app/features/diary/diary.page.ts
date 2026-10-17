import { Component, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
  ArcanaService,
  ApiError,
  errorText,
} from "../../core/api/arcana.service";
import { Journal, Reading } from "../../core/api/models";
@Component({
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: ` <section class="diary-page">
    <div class="diary-heading">
      <p class="eyebrow">CADERNO DE REFLEXÕES</p>
      <h1>Meu <em>diário</em></h1>
      <p class="lead">
        Um lugar reservado para aquilo que cada leitura desperta.
      </p>
      <a class="button" routerLink="/leitura">Abrir uma nova leitura ↗</a>
    </div>
    <div class="ritual-tabs" role="group" aria-label="Filtrar leituras">
      <button [class.active]="!favorites()" (click)="filter(false)">
        Todas as leituras</button
      ><button [class.active]="favorites()" (click)="filter(true)">
        ✦ Favoritas
      </button>
    </div>
    @if (loading()) {
      <p class="feedback" role="status">Buscando suas páginas…</p>
    }
    @if (error()) {
      <p class="feedback error" role="alert">
        {{ error() }}
        <button class="text-link" (click)="load()">Tentar novamente</button>
      </p>
    }
    @if (!loading() && !error() && !readings().length) {
      <div class="book-shell">
        <div class="book-page page-left">
          <p class="page-kicker">ARCANA</p>
          <div class="ornament">✦</div>
          <p class="hand-title">
            As páginas ainda<br /><em>esperam por você.</em>
          </p>
          <p class="page-copy">
            {{
              favorites()
                ? "Marque uma leitura como favorita para encontrá-la aqui."
                : "Suas leituras serão guardadas aqui, junto das reflexões que você escolher escrever."
            }}
          </p>
        </div>
        <div class="book-spine"></div>
        <div class="book-page page-right">
          <div class="entry-icon">☽</div>
          <h2>Abra seu ritual</h2>
          <p class="page-copy">
            Uma pergunta pode ser a primeira linha de uma nova história.
          </p>
          <a class="ink-button" routerLink="/leitura"
            >Fazer minha primeira leitura ↗</a
          >
        </div>
      </div>
    }
    @if (selected(); as r) {
      <div class="book-shell">
        <div class="book-page page-left">
          <span class="page-number">{{ offset() + selectedIndex() + 1 }}</span>
          <p class="page-kicker">
            {{ r.created_at * 1000 | date: "dd/MM/yyyy" }} ·
            {{ r.kind === "tarot" ? "TAROT" : "MAPA NATAL" }}
          </p>
          <div class="ornament">✦</div>
          <h2 class="hand-title">{{ r.question }}</h2>
          <p class="page-copy excerpt">
            {{ r.result?.summary || statusLabel(r.status) }}
          </p>
          <a class="ink-button" [routerLink]="['/mesa', r.id]"
            >Reabrir esta leitura ↗</a
          >
        </div>
        <div class="book-spine"></div>
        <div class="book-page page-right">
          <p class="page-kicker">SUAS PRÓPRIAS PALAVRAS</p>
          <div class="entry-icon">☽</div>
          <h2>O que ficou?</h2>
          @if (noteLoading()) {
            <p role="status">Abrindo anotação…</p>
          } @else {
            <form (ngSubmit)="save()">
              <label for="diary-note">Anotação privada</label
              ><textarea
                id="diary-note"
                name="note"
                [(ngModel)]="note"
                rows="7"
                maxlength="10000"
                placeholder="Escreva o que esta leitura despertou…"
              ></textarea
              ><label class="check"
                ><input
                  type="checkbox"
                  name="favorite"
                  [(ngModel)]="favorite"
                />
                Marcar como favorita</label
              ><button class="ink-button" [disabled]="saving()">
                {{ saving() ? "Guardando…" : "Guardar esta página ↗" }}
              </button>
            </form>
          }
        </div>
      </div>
      <div class="book-controls">
        <button
          (click)="select(selectedIndex() - 1)"
          [disabled]="selectedIndex() === 0 || saving()"
          aria-label="Leitura anterior"
        >
          ←</button
        ><span
          >{{ selectedIndex() + 1 }} / {{ readings().length }} nesta
          página</span
        ><button
          (click)="select(selectedIndex() + 1)"
          [disabled]="selectedIndex() === readings().length - 1 || saving()"
          aria-label="Próxima leitura"
        >
          →
        </button>
      </div>
    }
    @if (readings().length) {
      <div class="history-list">
        @for (r of readings(); track r.id; let i = $index) {
          <button
            (click)="select(i)"
            [class.selected]="selectedIndex() === i"
            [disabled]="saving()"
          >
            <span
              >{{ r.created_at * 1000 | date: "dd/MM" }} ·
              {{ r.kind === "tarot" ? "✦" : "☽" }}</span
            ><strong>{{ r.question }}</strong
            ><small>{{ statusLabel(r.status) }}</small>
          </button>
        }
      </div>
    }
    <div class="pagination">
      <button
        class="text-link"
        (click)="paginate(-20)"
        [disabled]="!offset() || loading() || saving()"
      >
        ← Mais recentes</button
      ><button
        class="text-link"
        (click)="paginate(20)"
        [disabled]="readings().length < 20 || loading() || saving()"
      >
        Mais antigas →
      </button>
    </div>
    @if (notice()) {
      <p class="feedback" role="status">{{ notice() }}</p>
    }
  </section>`,
  styles: [
    `
      .diary-page {
        max-width: 1040px;
        margin: 0 auto;
        padding: clamp(48px, 8vw, 96px) 28px 80px;
      }
      .diary-heading {
        text-align: center;
        margin-bottom: 44px;
      }
      .diary-heading h1 {
        margin: 10px 0 12px;
      }
      .book-shell {
        display: grid;
        grid-template-columns: 1fr 10px 1fr;
        max-width: 880px;
        min-height: 500px;
        margin: auto;
        filter: drop-shadow(0 22px 34px #12070c99);
        transition: transform 0.45s ease;
      }
      .book-shell.turning {
        transform: perspective(1200px) rotateY(-3deg);
      }
      .book-page {
        position: relative;
        padding: 54px clamp(30px, 6vw, 72px);
        background: linear-gradient(90deg, #e2c795, #f4dfad 8%, #ead09a 100%);
        color: #4b2730;
        overflow: hidden;
      }
      .page-left {
        border-radius: 12px 2px 2px 12px;
        box-shadow: inset -16px 0 24px #6f3c3026;
      }
      .page-right {
        border-radius: 2px 12px 12px 2px;
        box-shadow: inset 16px 0 24px #6f3c3026;
      }
      .book-page:before {
        content: "✧  ❧  ✧";
        position: absolute;
        inset: 18px;
        border: 1px solid #95613b88;
        color: #9b623d;
        text-align: center;
        padding-top: 8px;
        font-size: 13px;
        letter-spacing: 16px;
        opacity: 0.7;
      }
      .book-spine {
        background: linear-gradient(90deg, #321521, #a67543 45%, #3a1824);
        box-shadow: 0 0 12px #1b0c12;
      }
      .page-number {
        position: absolute;
        bottom: 22px;
        font-size: 12px;
        color: #8a5945;
      }
      .page-left .page-number {
        left: 34px;
      }
      .page-right .page-number {
        right: 34px;
      }
      .page-kicker {
        font-size: 10px;
        letter-spacing: 0.24em;
        color: #8a5945;
        text-align: center;
      }
      .ornament,
      .entry-icon {
        text-align: center;
        font-size: 28px;
        color: #8e4a4b;
        margin: 28px 0;
      }
      .hand-title {
        font-size: clamp(26px, 4vw, 42px);
        line-height: 1.05;
        text-align: center;
        font-family: Georgia, serif;
      }
      .hand-title em {
        color: #8f3c51;
      }
      .page-copy {
        font-size: 16px;
        line-height: 1.7;
        max-width: 280px;
        margin: 28px auto;
        text-align: center;
      }
      .page-rule {
        height: 1px;
        background: #a36e4e66;
        margin: 30px auto;
        width: 60%;
      }
      .ink-note {
        text-align: center;
        font-style: italic;
        font-size: 15px;
        line-height: 1.55;
      }
      .page-right h2 {
        text-align: center;
        font-size: 28px;
        font-weight: 400;
        margin: 6px 0;
      }
      .ink-button {
        display: block;
        margin: 32px auto 16px;
        background: #54263a;
        color: #f3d9a2;
        border: 1px solid #aa7548;
        padding: 13px 18px;
        cursor: pointer;
        letter-spacing: 0.06em;
      }
      .book-link {
        display: block;
        text-align: center;
        color: #78495a;
        font-size: 12px;
      }
      .book-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
        margin-top: 24px;
        color: var(--muted);
        font-size: 12px;
      }
      .book-controls button {
        border: 1px solid var(--line);
        background: transparent;
        color: var(--gold-bright);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        cursor: pointer;
      }
      .book-controls button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      @media (max-width: 650px) {
        .book-shell {
          grid-template-columns: 1fr;
          min-height: 0;
        }
        .book-spine {
          display: none;
        }
        .book-page {
          min-height: 340px;
          padding: 44px 32px;
        }
        .page-left {
          border-radius: 12px 12px 2px 2px;
        }
        .page-right {
          border-radius: 2px 2px 12px 12px;
        }
        .diary-page {
          padding-inline: 16px;
        }
      }
    `,
  ],
})
export class DiaryPage {
  private readonly api = inject(ArcanaService);
  readonly readings = signal<Reading[]>([]);
  readonly selectedIndex = signal(0);
  readonly favorites = signal(false);
  readonly offset = signal(0);
  readonly loading = signal(true);
  readonly noteLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal("");
  readonly notice = signal("");
  note = "";
  favorite = false;
  private ticket = 0;
  selected(): Reading | null {
    return this.readings()[this.selectedIndex()] || null;
  }
  constructor() {
    void this.load();
  }
  statusLabel(status: string) {
    return (
      (
        {
          pending: "Em preparação",
          processing: "Interpretando",
          completed: "Leitura concluída",
          failed: "Interpretação indisponível",
        } as Record<string, string>
      )[status] || status
    );
  }
  filter(value: boolean) {
    if (this.saving()) return;
    this.favorites.set(value);
    this.offset.set(0);
    void this.load();
  }
  paginate(delta: number) {
    this.offset.update((value) => Math.max(0, value + delta));
    void this.load();
  }
  async load() {
    const ticket = ++this.ticket;
    this.loading.set(true);
    this.error.set("");
    this.readings.set([]);
    try {
      let rows: Reading[];
      if (this.favorites()) {
        const entries = await this.api.request<Journal[]>(
          "/journal?favorites_only=true&limit=20&offset=" + this.offset(),
        );
        rows = await Promise.all(
          entries.map((entry) =>
            this.api.request<Reading>("/readings/" + entry.reading_id),
          ),
        );
      } else
        rows = await this.api.request<Reading[]>(
          "/readings?limit=20&offset=" + this.offset(),
        );
      if (ticket !== this.ticket) return;
      this.readings.set(rows);
      this.selectedIndex.set(0);
      if (rows.length) await this.select(0);
    } catch (e) {
      if (ticket === this.ticket) this.error.set(errorText(e));
    } finally {
      if (ticket === this.ticket) this.loading.set(false);
    }
  }
  async select(index: number) {
    if (this.saving() || index < 0 || index >= this.readings().length) return;
    this.selectedIndex.set(index);
    this.note = "";
    this.favorite = false;
    this.notice.set("");
    this.noteLoading.set(true);
    const id = this.selected()!.id;
    try {
      const entry = await this.api.request<Journal>("/journal/" + id);
      if (this.selected()?.id === id) {
        this.note = entry.note;
        this.favorite = entry.favorite;
      }
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 404))
        this.error.set(errorText(e));
    } finally {
      if (this.selected()?.id === id) this.noteLoading.set(false);
    }
  }
  async save() {
    const reading = this.selected();
    if (!reading || this.saving()) return;
    this.saving.set(true);
    this.error.set("");
    try {
      await this.api.request("/journal/" + reading.id, "PUT", {
        note: this.note,
        favorite: this.favorite,
      });
      this.notice.set("Sua página foi guardada.");
    } catch (e) {
      this.error.set(errorText(e));
    } finally {
      this.saving.set(false);
    }
  }
}
