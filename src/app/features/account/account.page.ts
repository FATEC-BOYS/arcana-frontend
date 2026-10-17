import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  ArcanaService,
  ApiError,
  errorText,
} from "../../core/api/arcana.service";
import { Usage } from "../../core/api/models";
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="account-page">
      <div class="account-art" aria-hidden="true">
        <div class="account-card">
          <span>✦</span><strong>ARCANA</strong
          ><small>Seu próprio oráculo</small>
        </div>
      </div>
      <div class="account-form">
        <p class="eyebrow">SEU LIVRO, SEU TEMPO</p>
        @if (api.signedIn() && mode === "register") {
          <h1>Seu <em>espaço</em></h1>
          <p class="lead">{{ api.user()?.email }}</p>
          <form #profileForm="ngForm" (ngSubmit)="saveProfile()">
            <label for="profile-name">Como podemos chamar você?</label
            ><input
              id="profile-name"
              name="profileName"
              [(ngModel)]="name"
              required
              maxlength="80"
            /><button class="button" [disabled]="busy() || profileForm.invalid">
              Salvar nome
            </button>
          </form>
          @if (usage()) {
            <p class="muted">
              Hoje: {{ usage()!.quotas["reading"].used }} de
              {{ usage()!.quotas["reading"].limit }} leituras. Renovação à
              meia-noite UTC.
            </p>
          }
          <a class="text-link" routerLink="/diario">Abrir meu diário →</a
          ><button
            class="button secondary"
            (click)="logout()"
            [disabled]="busy()"
          >
            Sair de todos os dispositivos
          </button>
          <details>
            <summary>Excluir minha conta</summary>
            <p>
              Isso remove permanentemente suas leituras, mapas e anotações.
              Digite seu e-mail para confirmar.
            </p>
            <label for="delete-email">Seu e-mail</label
            ><input id="delete-email" [(ngModel)]="confirmation" /><button
              class="button"
              [disabled]="busy() || confirmation !== api.user()?.email"
              (click)="deleteAccount()"
            >
              Excluir definitivamente
            </button>
          </details>
        } @else {
          <h1>
            {{
              mode === "login"
                ? "Volte ao seu"
                : mode === "forgot"
                  ? "Recupere seu"
                  : mode === "reset"
                    ? "Renove seu"
                    : "Abra seu"
            }}
            <em>{{
              mode === "forgot" || mode === "reset" ? "acesso" : "livro"
            }}</em>
          </h1>
          <p class="lead">
            {{
              mode === "register"
                ? "Guarde suas leituras e escreva suas próprias reflexões."
                : "Um instante para voltar a você."
            }}
          </p>
          <form #form="ngForm" (ngSubmit)="submit()">
            @if (mode === "register") {
              <label for="name">Como podemos chamar você?</label
              ><input
                id="name"
                name="name"
                [(ngModel)]="name"
                required
                maxlength="80"
                autocomplete="name"
              />
            }
            @if (mode !== "reset") {
              <label for="email">Seu e-mail</label
              ><input
                id="email"
                name="email"
                [(ngModel)]="email"
                type="email"
                email
                required
                maxlength="254"
                autocomplete="email"
              />
            }
            @if (mode !== "forgot") {
              <label for="password">{{
                mode === "reset" ? "Sua nova senha" : "Sua senha"
              }}</label
              ><input
                id="password"
                name="password"
                [(ngModel)]="password"
                type="password"
                minlength="10"
                maxlength="128"
                required
                [autocomplete]="
                  mode === 'login' ? 'current-password' : 'new-password'
                "
              />
              <p class="muted small">Use de 10 a 128 caracteres.</p>
            }
            <button
              class="button"
              [disabled]="
                busy() || form.invalid || (mode === 'reset' && !resetToken)
              "
            >
              {{
                busy()
                  ? "Aguarde…"
                  : mode === "forgot"
                    ? "Enviar instruções"
                    : mode === "reset"
                      ? "Salvar nova senha"
                      : mode === "login"
                        ? "Entrar no meu livro ↗"
                        : "Começar meu diário ↗"
              }}
            </button>
          </form>
          <p class="account-switch">
            <a routerLink="/entrar">Entrar</a> ·
            <a routerLink="/conta">Criar conta</a> ·
            <a routerLink="/recuperar-senha">Esqueci minha senha</a>
          </p>
        }
        @if (error()) {
          <p class="feedback error" role="alert">{{ error() }}</p>
        }
        @if (notice()) {
          <p class="feedback" role="status">{{ notice() }}</p>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .account-page {
        max-width: 1050px;
        margin: auto;
        padding: clamp(50px, 9vw, 110px) 28px;
        display: grid;
        grid-template-columns: minmax(260px, 0.8fr) minmax(300px, 1fr);
        gap: clamp(40px, 8vw, 100px);
        align-items: center;
      }
      .account-art {
        display: grid;
        place-items: center;
        min-height: 390px;
        background: radial-gradient(circle, #6e2c4d88, transparent 65%);
        position: relative;
      }
      .account-art:before {
        content: "✧  ❧  ✦  ❧  ✧";
        position: absolute;
        inset: 18px;
        border: 1px solid var(--line);
        color: var(--gold);
        padding: 18px;
        font-size: 18px;
        letter-spacing: 8px;
      }
      .account-card {
        width: 190px;
        height: 286px;
        border: 1px solid #c9a46b;
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 18px;
        background: linear-gradient(135deg, #3e172d, #170e1b);
        box-shadow:
          0 20px 40px #05030899,
          inset 0 0 0 7px #39172c;
        transform: rotate(-6deg);
        animation: cardFloat 5s ease-in-out infinite;
      }
      .account-card span {
        font-size: 54px;
        color: var(--gold-bright);
      }
      .account-card strong {
        font-size: 20px;
        letter-spacing: 0.28em;
        color: #ecd09a;
      }
      .account-card small {
        color: #caa879;
        font-style: italic;
      }
      .account-form {
        max-width: 460px;
      }
      .account-form h1 {
        margin: 10px 0;
      }
      .account-form form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 30px;
      }
      .account-form label {
        font-size: 12px;
        color: var(--muted);
        letter-spacing: 0.08em;
        margin-top: 8px;
      }
      .account-form input {
        background: #1a101d99;
        border: 1px solid var(--line);
        padding: 14px 16px;
        color: var(--ink);
        outline: none;
      }
      .account-form input:focus {
        border-color: var(--gold);
      }
      .account-switch {
        color: var(--muted);
        font-size: 13px;
        text-align: center;
      }
      .account-switch a {
        color: var(--gold-bright);
      }
      @keyframes cardFloat {
        50% {
          transform: rotate(-3deg) translateY(-9px);
        }
      }
      @media (max-width: 700px) {
        .account-page {
          grid-template-columns: 1fr;
          padding-top: 48px;
        }
        .account-art {
          min-height: 280px;
          order: 2;
        }
        .account-form {
          order: 1;
        }
      }
    `,
  ],
})
export class AccountPage {
  readonly api = inject(ArcanaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly mode: "register" | "login" | "forgot" | "reset" =
    this.route.snapshot.data["mode"] || "register";
  readonly busy = signal(false);
  readonly error = signal("");
  readonly notice = signal("");
  readonly usage = signal<Usage | null>(null);
  name = "";
  email = "";
  password = "";
  confirmation = "";
  resetToken = "";
  constructor() {
    if (this.mode === "reset") {
      this.resetToken =
        new URLSearchParams(location.hash.slice(1)).get("token") || "";
      history.replaceState(null, "", location.pathname + location.search);
      if (!this.resetToken)
        this.error.set(
          "Abra o link enviado por e-mail para redefinir sua senha.",
        );
    }
    if (this.api.signedIn() && this.mode === "register")
      void this.loadProfile();
  }
  async loadProfile() {
    try {
      const user = await this.api.profile();
      this.name = user.name;
      this.usage.set(await this.api.request<Usage>("/me/usage"));
    } catch (e) {
      this.error.set(errorText(e));
    }
  }
  private async perform(action: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    this.notice.set("");
    try {
      await action();
    } catch (e) {
      this.error.set(
        this.mode === "login" && e instanceof ApiError && e.status === 401
          ? "E-mail ou senha incorretos. Confira e tente novamente."
          : errorText(e),
      );
    } finally {
      this.busy.set(false);
    }
  }
  async submit() {
    await this.perform(async () => {
      if (this.mode === "forgot") {
        await this.api.request(
          "/auth/forgot-password",
          "POST",
          { email: this.email },
          undefined,
          false,
        );
        this.notice.set(
          "Se houver uma conta com este e-mail, você receberá as instruções.",
        );
      } else if (this.mode === "reset") {
        await this.api.request(
          "/auth/reset-password",
          "POST",
          { token: this.resetToken, password: this.password },
          undefined,
          false,
        );
        this.api.clear();
        this.resetToken = "";
        this.notice.set("Senha atualizada. Entre novamente para continuar.");
      } else {
        await this.api.authenticate(
          this.mode === "login" ? "login" : "register",
          {
            email: this.email,
            password: this.password,
            ...(this.mode === "register" ? { name: this.name.trim() } : {}),
          },
        );
        this.password = "";
        const target = this.route.snapshot.queryParamMap.get("returnUrl");
        await this.router.navigateByUrl(
          target?.startsWith("/") && !target.startsWith("//")
            ? target
            : "/diario",
        );
      }
    });
  }
  async saveProfile() {
    await this.perform(async () => {
      await this.api.request("/me", "PATCH", { name: this.name.trim() });
      await this.api.profile();
      this.notice.set("Nome atualizado.");
    });
  }
  async logout() {
    await this.perform(() => this.api.logout());
  }
  async deleteAccount() {
    if (this.confirmation !== this.api.user()?.email) return;
    await this.perform(async () => {
      await this.api.request("/me", "DELETE");
      this.api.clear();
      await this.router.navigate(["/"]);
    });
  }
}
