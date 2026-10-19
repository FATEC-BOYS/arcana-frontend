import { Component, DestroyRef, HostListener, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  ArcanaService,
  ApiError,
  errorText,
} from "../../core/api/arcana.service";
import { Journal, Message, Reading } from "../../core/api/models";
import { DraftAware } from "../../core/auth/unsaved-changes.guard";
import { TarotCardComponent } from "../../shared/ui/tarot-card.component";
@Component({
  standalone: true,
  imports: [TarotCardComponent, FormsModule, RouterLink, DatePipe],
  template: ` <section class="page reading-room">
    @if (loading()) {
      <p class="feedback" role="status">Abrindo sua leitura…</p>
    }
    @if (error()) {
      <div class="feedback error" role="alert">
        {{ error() }}
        <button class="text-link" (click)="reload()">
          Tentar carregar novamente
        </button>
      </div>
    }
    @if (reading(); as r) {
      <p class="eyebrow">
        {{ r.kind === "tarot" ? "AS CARTAS NA MESA" : "UM OLHAR PARA O CÉU" }} ·
        {{ r.created_at * 1000 | date: "dd/MM/yyyy" }}
      </p>
      <h1>Um instante.<br /><em>Novas perspectivas.</em></h1>
      <p class="reading-question">{{ r.question }}</p>
      @if (r.kind === "tarot") {
        <div class="reading-cards">
          @for (card of r.facts.cards; track card.card_id; let i = $index) {
            <div>
              <p class="eyebrow">{{ card.position }}</p>
              <arcana-tarot-card
                [position]="i + 1"
                [label]="card.name"
                [revealed]="revealed().includes(i)"
                (reveal)="reveal(i)"
              />
              @if (revealed().includes(i)) {
                <span class="muted small">{{
                  card.reversed ? "Invertida" : "Na posição natural"
                }}</span>
              }
            </div>
          }
        </div>
        <p class="muted small">
          {{ revealed().length }} de {{ r.facts.cards?.length }} cartas
          reveladas. Toque em cada carta.
        </p>
      }
      @if (r.kind === "astrology" && r.facts.chart) {
        <p class="notice">
          {{
            r.facts.chart.birth_time_known
              ? "Interpretação a partir das posições calculadas no seu mapa natal."
              : "Horário desconhecido: posições aproximadas ao meio-dia. Casas e ascendente não são utilizados."
          }}
        </p>
      }
      <div class="reading-content" aria-live="polite">
        @if (r.status === "pending" || r.status === "processing") {
          <div class="ritual-wait">
            <span aria-hidden="true">✦</span>
            <h2>Seu momento está tomando forma.</h2>
            <p>
              As evidências estão sendo reunidas e a interpretação será
              revisada. Você pode sair e voltar pelo diário.
            </p>
          </div>
        }
        @if (r.status === "failed") {
          <div class="notice">
            <h2>O ritual precisa de uma pausa.</h2>
            <p>{{ failure(r.error_code) }}</p>
            <button class="button" [disabled]="busy()" (click)="retry()">
              Tentar a interpretação novamente
            </button>
            <p class="small">
              Suas cartas serão mantidas. A tentativa está sujeita ao limite de
              uso.
            </p>
          </div>
        }
        @if (r.result) {
          <article class="interpretation">
            <p class="eyebrow">UMA LEITURA PARA REFLETIR</p>
            <h2>O que se abre <em>agora.</em></h2>
            <p class="result-summary">{{ r.result.summary }}</p>
            <ul>
              @for (item of r.result.reflections; track $index) {
                <li>{{ item }}</li>
              }
            </ul>
            <details>
              <summary>Conhecer as fontes desta leitura</summary>
              @for (source of r.result.sources; track source.source_id) {
                <blockquote>
                  <strong>{{ source.source }}</strong>
                  <p>{{ source.text }}</p>
                  <small
                    >Versão {{ source.document_version }} ·
                    {{ source.license }}</small
                  >
                </blockquote>
              }
            </details>
          </article>
          <section class="conversation">
            <p class="eyebrow">CONTINUE A REFLEXÃO</p>
            <h2>O que ficou <em>com você?</em></h2>
            @for (message of messages(); track message.id) {
              <article class="message">
                <p class="message-question">{{ message.question }}</p>
                @if (message.result) {
                  <p class="result-summary">{{ message.result.summary }}</p>
                  <ul>
                    @for (item of message.result.reflections; track $index) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                  <details>
                    <summary>Fontes da resposta</summary>
                    @for (
                      source of message.result.sources;
                      track source.source_id
                    ) {
                      <blockquote>
                        <strong>{{ source.source }}</strong>
                        <p>{{ source.text }}</p>
                        <small>{{ source.license }}</small>
                      </blockquote>
                    }
                  </details>
                } @else if (message.status === "failed") {
                  <p>{{ failure(message.error_code) }}</p>
                  <button
                    class="text-link"
                    [disabled]="busy()"
                    (click)="retry(message.id)"
                  >
                    Tentar esta resposta novamente
                  </button>
                } @else {
                  <p role="status">Preparando uma resposta…</p>
                }
              </article>
            }
            <form #chatForm="ngForm" (ngSubmit)="send()">
              <label for="follow-up">Sua próxima pergunta</label
              ><textarea
                id="follow-up"
                name="followUp"
                [(ngModel)]="question"
                (ngModelChange)="messageKey = ''"
                required
                minlength="5"
                maxlength="2000"
                rows="3"
                [disabled]="busy() || awaitingMessage()"
              ></textarea
              ><button
                class="button"
                [disabled]="
                  busy() ||
                  awaitingMessage() ||
                  chatForm.invalid ||
                  question.trim().length < 5
                "
              >
                {{
                  awaitingMessage()
                    ? "Resposta em preparação…"
                    : "Abrir a conversa ↗"
                }}
              </button>
            </form>
          </section>
        }
        <section class="journal-editor">
          <p class="eyebrow">UMA PÁGINA SUA</p>
          <h2>Escreva o que <em>permanece.</em></h2>
          @if (noteLoading()) {
            <p role="status" class="muted">Carregando suas anotações…</p>
          }
          <form (ngSubmit)="saveNote()">
            <fieldset [disabled]="noteLoading() || busy()">
            <label for="note">Suas anotações privadas</label
            ><textarea
              id="note"
              name="note"
              [(ngModel)]="note"
              rows="5"
              maxlength="10000"
              placeholder="O que você gostaria de guardar desta leitura?"
            ></textarea
            ><label class="check"
              ><input type="checkbox" name="favorite" [(ngModel)]="favorite" />
              Guardar entre minhas favoritas</label
            ><button class="button" [disabled]="busy()">
              {{ hasUnsavedChanges() ? "Salvar alterações no diário" : "Salvar no diário" }}
            </button>
            </fieldset>
          </form>
        </section>
      </div>
      <div class="reading-actions">
        <a class="text-link" routerLink="/app/diario">← Voltar ao meu diário</a
        ><a class="text-link" routerLink="/app/leitura">Nova leitura ↗</a
        ><button
          class="text-link danger"
          (click)="confirmDelete.set(!confirmDelete())"
        >
          Excluir esta leitura
        </button>
      </div>
      @if (confirmDelete()) {
        <div class="feedback" role="alert">
          <p>Excluir permanentemente esta leitura, conversa e anotações?</p>
          <button class="button" (click)="remove()" [disabled]="busy()">
            Sim, excluir leitura</button
          ><button class="text-link" (click)="confirmDelete.set(false)">
            Cancelar
          </button>
        </div>
      }
    }
    @if (actionError()) {
      <p class="feedback error" role="alert">{{ actionError() }}</p>
    }
    @if (notice()) {
      <p class="feedback" role="status">{{ notice() }}</p>
    }
  </section>`,
})
export class ReadingRoomPage implements DraftAware {
  private readonly api = inject(ArcanaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly reading = signal<Reading | null>(null);
  readonly messages = signal<Message[]>([]);
  readonly revealed = signal<number[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly noteLoading = signal(true);
  readonly error = signal("");
  readonly actionError = signal("");
  readonly notice = signal("");
  readonly confirmDelete = signal(false);
  note = "";
  favorite = false;
  question = "";
  messageKey = "";
  private timer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  private alive = true;
  private id = "";
  private savedNote = "";
  private savedFavorite = false;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
      this.generation++;
      clearTimeout(this.timer);
    });
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.id = params.get("id") || "";
      this.generation++;
      clearTimeout(this.timer);
      this.reading.set(null);
      this.messages.set([]);
      this.revealed.set([]);
      this.note = "";
      this.favorite = false;
      this.savedNote = "";
      this.savedFavorite = false;
      this.noteLoading.set(true);
      this.question = "";
      this.error.set("");
      void this.load(true, this.generation);
    });
  }
  awaitingMessage() {
    return this.messages().some(
      (m) => m.status === "pending" || m.status === "processing",
    );
  }
  reveal(index: number) {
    this.revealed.update((items) =>
      items.includes(index) ? items : [...items, index],
    );
  }
  async reload() {
    clearTimeout(this.timer);
    await this.load(!this.reading(), ++this.generation);
  }
  private async load(initial: boolean, ticket: number) {
    if (initial) this.loading.set(true);
    try {
      const [reading, messages] = await Promise.all([
        this.api.request<Reading>("/readings/" + this.id),
        this.api.request<Message[]>("/readings/" + this.id + "/messages"),
      ]);
      if (!this.alive || ticket !== this.generation) return;
      this.reading.set(reading);
      this.messages.set(messages);
      this.error.set("");
      if (initial) {
        try {
          const entry = await this.api.request<Journal>("/journal/" + this.id);
          if (!this.alive || ticket !== this.generation) return;
          this.note = entry.note;
          this.favorite = entry.favorite;
        } catch (e) {
          if (this.alive && ticket === this.generation && !(e instanceof ApiError && e.status === 404))
            this.actionError.set(errorText(e));
        } finally {
          if (this.alive && ticket === this.generation) {
            this.savedNote = this.note;
            this.savedFavorite = this.favorite;
            this.noteLoading.set(false);
          }
        }
      }
      if (
        this.alive &&
        ticket === this.generation &&
        (["pending", "processing"].includes(reading.status) ||
          this.awaitingMessage())
      )
        this.timer = setTimeout(() => void this.load(false, ticket), 2500);
    } catch (e) {
      if (this.alive && ticket === this.generation)
        this.error.set(errorText(e));
    } finally {
      if (ticket === this.generation) this.loading.set(false);
    }
  }
  private async action(fn: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    this.actionError.set("");
    this.notice.set("");
    try {
      await fn();
    } catch (e) {
      this.actionError.set(errorText(e));
    } finally {
      this.busy.set(false);
    }
  }
  async retry(messageId?: string) {
    await this.action(async () => {
      await this.api.request(
        "/readings/" +
          this.id +
          (messageId ? "/messages/" + messageId : "") +
          "/retry",
        "POST",
      );
      await this.reload();
    });
  }
  async send() {
    if (this.awaitingMessage() || this.question.trim().length < 5) return;
    await this.action(async () => {
      this.messageKey ||= crypto.randomUUID();
      await this.api.request(
        "/readings/" + this.id + "/messages",
        "POST",
        { question: this.question.trim() },
        this.messageKey,
      );
      this.question = "";
      this.messageKey = "";
      await this.reload();
    });
  }
  async saveNote() {
    await this.action(async () => {
      await this.api.request("/journal/" + this.id, "PUT", {
        note: this.note,
        favorite: this.favorite,
      });
      this.savedNote = this.note;
      this.savedFavorite = this.favorite;
      this.notice.set("Sua página foi guardada.");
    });
  }
  async remove() {
    await this.action(async () => {
      await this.api.request("/readings/" + this.id, "DELETE");
      await this.router.navigate(["/app/diario"]);
    });
  }
  hasUnsavedChanges() {
    return (
      !this.noteLoading() &&
      (this.note !== this.savedNote || this.favorite !== this.savedFavorite)
    );
  }
  @HostListener("window:beforeunload", ["$event"])
  protectDraft(event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) event.preventDefault();
  }
  failure(code: string | null) {
    return code === "llm_not_configured"
      ? "A interpretação ainda não está disponível neste ambiente. Sua leitura está salva."
      : code === "worker_retry_limit"
        ? "O limite de tentativas desta leitura foi atingido."
        : "Não foi possível concluir a interpretação. Sua leitura permanece salva.";
  }
}
