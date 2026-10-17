import { Component, DestroyRef, inject, signal } from "@angular/core";
import { DatePipe, KeyValuePipe, DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ArcanaService, errorText } from "../../core/api/arcana.service";
import { Chart, ChartItem, Reading } from "../../core/api/models";
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, KeyValuePipe, DecimalPipe],
  template: ` <section class="page narrow">
    <p class="eyebrow">O CÉU DO SEU PRIMEIRO INSTANTE</p>
    <h1>Seu mapa.<br /><em>Outros olhares.</em></h1>
    <div class="ritual-tabs">
      <a routerLink="/app/leitura">✦ Tarot</a
      ><span class="active">☽ Mapa natal</span>
    </div>
    @if (!chart()) {
      <p class="lead">
        Informe os dados do nascimento para calcular suas posições natais.
      </p>
      <form #form="ngForm" (ngSubmit)="calculate()">
        <fieldset [disabled]="busy()">
          <label for="birth-date">Data de nascimento</label
          ><input
            id="birth-date"
            name="date"
            type="date"
            [(ngModel)]="date"
            min="1900-01-01"
            [max]="today"
            required
          />
          <label class="check"
            ><input type="checkbox" name="unknown" [(ngModel)]="unknown" /> Não
            sei meu horário de nascimento</label
          >
          @if (!unknown) {
            <label for="birth-time">Horário local</label
            ><input
              id="birth-time"
              name="time"
              type="time"
              [(ngModel)]="time"
              required
            />
          }
          <div class="field-row">
            <div>
              <label for="latitude">Latitude</label
              ><input
                id="latitude"
                name="latitude"
                type="number"
                [(ngModel)]="latitude"
                min="-66"
                max="66"
                step="any"
                required
                placeholder="Ex.: -23.55"
              />
            </div>
            <div>
              <label for="longitude">Longitude</label
              ><input
                id="longitude"
                name="longitude"
                type="number"
                [(ngModel)]="longitude"
                min="-180"
                max="180"
                step="any"
                required
                placeholder="Ex.: -46.63"
              />
            </div>
          </div>
          <label for="timezone">Fuso do local de nascimento</label
          ><input
            id="timezone"
            name="timezone"
            [(ngModel)]="timezone"
            required
            placeholder="Ex.: America/Sao_Paulo"
          />
          <p class="muted small">
            Use coordenadas e fuso da cidade onde você nasceu. O Arcana não
            busca a localização automaticamente.
          </p>
          <details>
            <summary>
              Meu horário ocorreu duas vezes na mudança de horário de verão
            </summary>
            <label for="fold">Qual ocorrência?</label
            ><select id="fold" name="fold" [(ngModel)]="fold">
              <option [ngValue]="null">Não se aplica</option>
              <option [ngValue]="0">Primeira ocorrência</option>
              <option [ngValue]="1">Segunda ocorrência</option>
            </select>
          </details>
          @if (unknown) {
            <p class="notice">
              Usaremos posições aproximadas ao meio-dia local. Casas, ascendente
              e desenho do mapa não serão apresentados.
            </p>
          }
          <button
            class="button"
            [disabled]="form.invalid || !date || date > today"
          >
            {{ busy() ? "Calculando seu céu…" : "Calcular meu mapa ↗" }}
          </button>
        </fieldset>
      </form>
      @if (history().length) {
        <h2>Seus mapas</h2>
        <div class="history-list">
          @for (item of history(); track item.id) {
            <button (click)="open(item.id)" [disabled]="busy()">
              <span>{{ item.created_at * 1000 | date: "dd/MM/yyyy" }}</span
              ><strong
                >{{ item.birth_input.birth_date }} ·
                {{
                  item.birth_input.birth_time || "Horário desconhecido"
                }}</strong
              ><small>Abrir →</small>
            </button>
          }
        </div>
        <div class="pagination">
          <button
            class="text-link"
            (click)="page(-20)"
            [disabled]="offset() === 0 || busy()"
          >
            ← Mais recentes</button
          ><button
            class="text-link"
            (click)="page(20)"
            [disabled]="history().length < 20 || busy()"
          >
            Mais antigos →
          </button>
        </div>
      }
    } @else {
      <p class="lead">
        {{
          chart()!.data.birth_time_known
            ? "As posições do seu nascimento."
            : "Um retrato aproximado do céu."
        }}
      </p>
      @if (svgUrl()) {
        <img
          class="natal-chart"
          [src]="svgUrl()"
          alt="Diagrama do seu mapa natal"
        />
      }
      <div class="planet-grid">
        @for (planet of chart()!.data.planets | keyvalue; track planet.key) {
          <div>
            <span>{{ planetName(planet.key) }}</span
            ><strong>{{ signName(planet.value.sign) }}</strong
            ><small>{{ planet.value.position | number: "1.1-1" }}°</small>
          </div>
        }
      </div>
      @for (limit of chart()!.data.limitations; track $index) {
        <p class="small muted">{{ limit }}</p>
      }
      <form #readingForm="ngForm" (ngSubmit)="interpret()">
        <label for="chart-question">O que você gostaria de explorar?</label
        ><textarea
          id="chart-question"
          name="question"
          [(ngModel)]="question"
          (ngModelChange)="key = ''"
          required
          minlength="5"
          maxlength="2000"
          rows="3"
          [disabled]="busy()"
        ></textarea
        ><button
          class="button"
          [disabled]="
            busy() || readingForm.invalid || question.trim().length < 5
          "
        >
          Interpretar meu mapa ↗
        </button>
      </form>
      <button class="text-link" (click)="back()" [disabled]="busy()">
        ← Voltar aos meus mapas
      </button>
      <details>
        <summary>Excluir este mapa</summary>
        <p>
          Mapas com leituras vinculadas só podem ser removidos após excluir
          essas leituras.
        </p>
        <button class="button secondary" (click)="remove()" [disabled]="busy()">
          Confirmar exclusão do mapa
        </button>
      </details>
    }
    @if (error()) {
      <p class="feedback error" role="alert">{{ error() }}</p>
    }
  </section>`,
})
export class AstrologyPage {
  private readonly api = inject(ArcanaService);
  private readonly router = inject(Router);
  readonly chart = signal<Chart | null>(null);
  readonly history = signal<ChartItem[]>([]);
  readonly offset = signal(0);
  readonly busy = signal(false);
  readonly error = signal("");
  readonly svgUrl = signal("");
  date = "";
  time = "";
  unknown = false;
  latitude: number | null = null;
  longitude: number | null = null;
  timezone = "America/Sao_Paulo";
  fold: number | null = null;
  question = "";
  key = "";
  today = new Date().toLocaleDateString("en-CA");
  constructor() {
    void this.loadHistory();
    inject(DestroyRef).onDestroy(() => this.clearSvg());
  }
  private clearSvg() {
    if (this.svgUrl()) URL.revokeObjectURL(this.svgUrl());
    this.svgUrl.set("");
  }
  private show(chart: Chart) {
    this.clearSvg();
    this.chart.set(chart);
    if (chart.data.svg)
      this.svgUrl.set(
        URL.createObjectURL(
          new Blob([chart.data.svg], { type: "image/svg+xml" }),
        ),
      );
  }
  private async action(fn: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    try {
      await fn();
    } catch (e) {
      this.error.set(errorText(e));
    } finally {
      this.busy.set(false);
    }
  }
  async loadHistory() {
    try {
      this.history.set(
        await this.api.request<ChartItem[]>(
          "/astrology/charts?limit=20&offset=" + this.offset(),
        ),
      );
    } catch (e) {
      this.error.set(errorText(e));
    }
  }
  page(delta: number) {
    this.offset.update((n) => Math.max(0, n + delta));
    void this.action(() => this.loadHistory());
  }
  async calculate() {
    await this.action(async () => {
      const chart = await this.api.request<Chart>("/astrology/charts", "POST", {
        birth_date: this.date,
        birth_time: this.unknown ? null : this.time,
        latitude: this.latitude,
        longitude: this.longitude,
        timezone: this.timezone,
        fold: this.fold,
      });
      this.show(chart);
      await this.loadHistory();
    });
  }
  async open(id: string) {
    await this.action(async () =>
      this.show(await this.api.request<Chart>("/astrology/charts/" + id)),
    );
  }
  back() {
    this.chart.set(null);
    this.clearSvg();
    this.error.set("");
    this.question = "";
    this.key = "";
  }
  async interpret() {
    await this.action(async () => {
      this.key ||= crypto.randomUUID();
      const reading = await this.api.request<Reading>(
        "/readings",
        "POST",
        {
          kind: "astrology",
          chart_id: this.chart()!.id,
          question: this.question.trim(),
        },
        this.key,
      );
      await this.router.navigate(["/app/mesa", reading.id]);
    });
  }
  async remove() {
    await this.action(async () => {
      await this.api.request("/astrology/charts/" + this.chart()!.id, "DELETE");
      this.back();
      await this.loadHistory();
    });
  }
  planetName(key: string) {
    return (
      (
        {
          sun: "Sol",
          moon: "Lua",
          mercury: "Mercúrio",
          venus: "Vênus",
          mars: "Marte",
          jupiter: "Júpiter",
          saturn: "Saturno",
          uranus: "Urano",
          neptune: "Netuno",
          pluto: "Plutão",
        } as Record<string, string>
      )[key] || key
    );
  }
  signName(key: string) {
    return (
      (
        {
          Ari: "Áries",
          Tau: "Touro",
          Gem: "Gêmeos",
          Can: "Câncer",
          Leo: "Leão",
          Vir: "Virgem",
          Lib: "Libra",
          Sco: "Escorpião",
          Sag: "Sagitário",
          Cap: "Capricórnio",
          Aqu: "Aquário",
          Pis: "Peixes",
        } as Record<string, string>
      )[key] || key
    );
  }
}
