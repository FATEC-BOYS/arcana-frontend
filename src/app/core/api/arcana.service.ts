import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { API_BASE_URL } from "../config/api-config";
import { Tokens, User } from "./models";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: unknown,
  ) {
    super(
      status === 0
        ? "Não foi possível conectar ao Arcana. Tente novamente em instantes."
        : status === 401
          ? "Sua sessão expirou. Entre novamente."
          : status === 429
            ? "Seu limite de uso foi atingido. Aguarde antes de tentar novamente."
            : status === 409
              ? "Esta ação não está disponível neste momento. Atualize e tente novamente."
              : status === 422
                ? "Confira os campos preenchidos e tente novamente."
                : status === 404
                  ? "Este registro não foi encontrado."
                  : status === 503
                    ? "Este recurso ainda não foi configurado no servidor."
                    : status === 400
                      ? "O link pode estar inválido ou expirado."
                      : "Não foi possível concluir. Tente novamente.",
    );
  }
}
export function errorText(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Não foi possível concluir. Tente novamente.";
}
@Injectable({ providedIn: "root" })
export class ArcanaService {
  private readonly base = inject(API_BASE_URL).replace(/\/$/, "");
  private readonly router = inject(Router);
  private readonly tokens = signal<Tokens | null>(this.readTokens());
  readonly user = signal<User | null>(null);
  readonly signedIn = () => !!this.tokens();
  private refreshing: Promise<void> | null = null;
  private epoch = 0;
  private readTokens(): Tokens | null {
    try {
      const value = JSON.parse(
        sessionStorage.getItem("arcana.session") || "null",
      );
      return typeof value?.access_token === "string" &&
        typeof value?.refresh_token === "string" &&
        value.access_token && value.refresh_token
        ? value as Tokens : null;
    } catch {
      return null;
    }
  }
  private store(value: Tokens | null) {
    this.tokens.set(value);
    try {
      if (value)
        sessionStorage.setItem("arcana.session", JSON.stringify(value));
      else sessionStorage.removeItem("arcana.session");
    } catch {
      /* Memory-only if storage is disabled. */
    }
  }
  clear() {
    this.epoch++;
    this.store(null);
    this.user.set(null);
  }
  private async wire<T>(
    path: string,
    method: string,
    body?: unknown,
    key?: string,
    access?: string,
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(this.base + path, {
        method,
        cache: "no-store",
        headers: {
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      throw new ApiError(0, null);
    }
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new ApiError(response.status, data?.detail);
    }
    return response.status === 204 ? (undefined as T) : response.json();
  }
  private refresh(): Promise<void> {
    if (this.refreshing) return this.refreshing;
    const token = this.tokens()?.refresh_token,
      epoch = this.epoch;
    const pending = (async () => {
      if (!token) throw new ApiError(401, null);
      const value = await this.wire<Tokens>("/auth/refresh", "POST", {
        refresh_token: token,
      });
      if (epoch !== this.epoch) throw new ApiError(401, null);
      this.store(value);
    })();
    this.refreshing = pending;
    void pending
      .finally(() => {
        if (this.refreshing === pending) this.refreshing = null;
      })
      .catch(() => {});
    return pending;
  }
  async request<T>(
    path: string,
    method = "GET",
    body?: unknown,
    key?: string,
    protectedRoute = true,
  ): Promise<T> {
    const original = this.tokens()?.access_token;
    const requestEpoch = this.epoch;
    try {
      return await this.wire<T>(
        path,
        method,
        body,
        key,
        protectedRoute ? original : undefined,
      );
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 401 ||
        !protectedRoute
      )
        throw error;
      // An old 401 must never revoke a new login or a deliberate logout.
      if (requestEpoch !== this.epoch) throw new ApiError(401, null);
      let replayToken: string | undefined;
      try {
        if (original === this.tokens()?.access_token) await this.refresh();
        if (requestEpoch !== this.epoch) throw new ApiError(401, null);
        replayToken = this.tokens()?.access_token;
        if (!replayToken) throw new ApiError(401, null);
        return await this.wire<T>(path, method, body, key, replayToken);
      } catch (retryError) {
        if (
          retryError instanceof ApiError &&
          retryError.status === 401 &&
          requestEpoch === this.epoch &&
          (!replayToken || replayToken === this.tokens()?.access_token)
        ) {
          this.clear();
          void this.router.navigate(["/entrar"], {
            queryParams: { returnUrl: this.router.url },
          });
        }
        throw retryError;
      }
    }
  }
  async authenticate(mode: "login" | "register", body: unknown) {
    const value = await this.request<Tokens>(
      "/auth/" + mode,
      "POST",
      body,
      undefined,
      false,
    );
    this.epoch++;
    this.store(value);
    await this.profile();
  }
  async profile() {
    const epoch = this.epoch;
    const user = await this.request<User>("/me");
    if (epoch !== this.epoch) throw new ApiError(401, null);
    this.user.set(user);
    return user;
  }
  async logout() {
    const epoch = this.epoch;
    await this.request<void>("/auth/logout", "POST");
    if (epoch !== this.epoch) return;
    this.clear();
    await this.router.navigate(["/"]);
  }
}
