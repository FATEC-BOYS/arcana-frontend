import { test, expect, Page } from "@playwright/test";
const tokens = {
  access_token: "test-access",
  refresh_token: "test-refresh",
  expires_in: 900,
};
const user = { id: "user-1", name: "Ale", email: "ale@example.com" };
const sources = [
  {
    source_id: "source-1",
    source: "Acervo de teste",
    text: "Uma evidência sintética para verificar a interface.",
    document_version: "2",
    license: "CC0",
  },
];
const result = {
  summary: "Um instante para olhar seu momento com atenção.",
  reflections: ["O que merece seu cuidado?"],
  sources,
  reviewed: true,
};
const reading = {
  id: "reading-1",
  kind: "tarot",
  chart_id: null,
  question: "Como olhar para meu trabalho?",
  facts: {
    cards: [
      {
        card_id: "major-00",
        name: "O Louco",
        position: "Reflexão do dia",
        reversed: false,
      },
    ],
  },
  status: "completed",
  result,
  error_code: null,
  created_at: 1792270000,
};
async function session(page: Page) {
  await page.addInitScript(
    (value) => sessionStorage.setItem("arcana.session", JSON.stringify(value)),
    tokens,
  );
}
async function mock(page: Page) {
  await page.route(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/**",
    (route) => route.abort(),
  );
  let note = { reading_id: "reading-1", note: "", favorite: false };
  let hasNote = false;
  let messages: unknown[] = [];
  await page.route("**/api/v1/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      path = url.pathname.replace("/api/v1", "");
    let data: unknown;
    let status = 200;
    if (
      path === "/auth/login" ||
      path === "/auth/register" ||
      path === "/auth/refresh"
    )
      data = tokens;
    else if (path === "/me") data = user;
    else if (path === "/me/usage")
      data = {
        resets_at: 1792368000,
        quotas: { reading: { used: 1, limit: 20, remaining: 19 } },
      };
    else if (path === "/cards")
      data = [
        {
          id: "major-00",
          name: "O Louco",
          arcana: "major",
          suit: null,
          meaning: "Começos e abertura.",
        },
      ];
    else if (path === "/readings")
      data = req.method() === "POST" ? reading : [reading];
    else if (path === "/readings/reading-1") data = reading;
    else if (path === "/readings/reading-1/messages") {
      if (req.method() === "POST") {
        const q = req.postDataJSON();
        const item = {
          id: "message-1",
          sequence: 1,
          question: q.question,
          status: "completed",
          result,
          error_code: null,
        };
        messages = [item];
        data = item;
      } else data = messages;
    } else if (path === "/journal/reading-1") {
      if (req.method() === "PUT") {
        note = { reading_id: "reading-1", ...req.postDataJSON() };
        hasNote = true;
        data = note;
      } else if (hasNote) data = note;
      else {
        status = 404;
        data = { detail: "Not found" };
      }
    } else if (path === "/journal") data = hasNote ? [note] : [];
    else if (path === "/astrology/charts") {
      data =
        req.method() === "POST"
          ? {
              id: "chart-1",
              created_at: 1792270000,
              data: {
                birth_time_known: false,
                svg: null,
                planets: { moon: { sign: "Can", position: 12.3 } },
                limitations: ["Horário desconhecido: posições aproximadas."],
              },
            }
          : [];
    } else if (path === "/auth/reset-password" || path === "/auth/logout") {
      status = 204;
    } else {
      status = 404;
      data = { detail: "Unexpected mock route: " + path };
    }
    await route.fulfill({ status, ...(status === 204 ? {} : { json: data }) });
  });
}
test("protects personal pages and offers a working mobile menu", async ({
  page,
  isMobile,
}) => {
  await mock(page);
  await page.goto("/diario");
  await expect(page).toHaveURL(/entrar/);
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir navegação" }).click();
    await expect(page.getByRole("navigation")).toBeVisible();
  }
  await expect(
    page.getByRole("heading", { name: "Volte ao seu livro" }),
  ).toBeVisible();
});
test("registers and opens the persisted diary", async ({ page }) => {
  await mock(page);
  await page.goto("/cadastro");
  await page.getByLabel("Como podemos chamar você?").fill("Ale");
  await page.getByLabel("Seu e-mail", { exact: true }).fill(user.email);
  await page.getByLabel("Sua senha", { exact: true }).fill("a-long-password");
  await page.getByRole("button", { name: "Começar meu diário" }).click();
  await expect(page).toHaveURL(/diario/);
  await expect(
    page.getByRole("heading", { name: reading.question }),
  ).toBeVisible();
});
test("creates a reading, reveals the actual draw, saves a note and chats", async ({
  page,
}) => {
  await session(page);
  await mock(page);
  await page.goto("/leitura");
  await page.getByLabel("Sua pergunta", { exact: true }).fill(reading.question);
  await page.getByLabel("Sua tiragem").selectOption("daily");
  const request = page.waitForRequest(
    (req) => req.url().endsWith("/readings") && req.method() === "POST",
  );
  await page.getByRole("button", { name: "Preparar meu ritual" }).click();
  expect((await request).headers()["idempotency-key"]).toBeTruthy();
  await expect(page).toHaveURL(/app\/mesa\/reading-1/);
  await page.getByRole("button", { name: "Revelar carta 1" }).click();
  await expect(
    page.getByRole("button", { name: "Carta revelada: O Louco" }),
  ).toBeVisible();
  await page.getByText("Conhecer as fontes desta leitura").click();
  await expect(page.getByText(sources[0].text)).toBeVisible();
  await page
    .getByLabel("Suas anotações privadas")
    .fill("Quero guardar esta reflexão.");
  await page.getByLabel("Guardar entre minhas favoritas").check();
  await page.getByRole("button", { name: "Salvar no diário" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Sua página foi guardada." }),
  ).toBeVisible();
  await page
    .getByLabel("Sua próxima pergunta")
    .fill("Como posso aprofundar essa reflexão?");
  await page.getByRole("button", { name: "Abrir a conversa" }).click();
  await expect(page.locator(".message-question")).toHaveText(
    "Como posso aprofundar essa reflexão?",
  );
  await page.reload();
  await expect(page.getByLabel("Suas anotações privadas")).toHaveValue(
    "Quero guardar esta reflexão.",
  );
});
test("refreshes concurrent expired requests only once", async ({ page }) => {
  await session(page);
  await mock(page);
  let refreshes = 0;
  await page.route("**/api/v1/**", async (route) => {
    const req = route.request();
    if (req.url().endsWith("/auth/refresh")) {
      refreshes++;
      await new Promise((r) => setTimeout(r, 200));
      await route.fulfill({ json: { ...tokens, access_token: "renewed" } });
    } else if (req.headers()["authorization"] === "Bearer test-access")
      await route.fulfill({ status: 401, json: { detail: "Expired" } });
    else await route.fallback();
  });
  await page.goto("/mesa/reading-1");
  await expect(page.getByText(reading.question, { exact: true })).toBeVisible();
  expect(refreshes).toBe(1);
});
test("retains idempotency after a failed request and shows quota errors", async ({
  page,
}) => {
  await session(page);
  await mock(page);
  const keys: string[] = [];
  await page.route("**/api/v1/readings", async (route) => {
    if (route.request().method() === "POST") {
      keys.push(route.request().headers()["idempotency-key"]);
      await route.fulfill({ status: 429, json: { detail: "Limit" } });
    } else await route.fallback();
  });
  await page.goto("/leitura");
  await page.getByLabel("Sua pergunta", { exact: true }).fill(reading.question);
  await page.getByRole("button", { name: "Preparar meu ritual" }).click();
  await expect(page.getByRole("alert")).toContainText("limite de uso");
  await page.getByRole("button", { name: "Preparar meu ritual" }).click();
  await expect.poll(() => keys.length).toBe(2);
  expect(keys[0]).toBe(keys[1]);
});
test("consumes reset tokens from the fragment without sending them in a URL", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/redefinir-senha#token=synthetic-recovery-token");
  await expect(page).not.toHaveURL(/token=/);
  await page.getByLabel("Sua nova senha").fill("a-new-long-password");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(page.getByRole("status")).toContainText("Senha atualizada");
});
test("calculates an unknown-time chart without invented houses or ascendant", async ({
  page,
}) => {
  await session(page);
  await mock(page);
  await page.goto("/mapa");
  await page.getByLabel("Data de nascimento").fill("1990-07-15");
  await page.getByLabel("Não sei meu horário de nascimento").check();
  await page.getByLabel("Latitude", { exact: true }).fill("-23.55");
  await page.getByLabel("Longitude", { exact: true }).fill("-46.63");
  const request = page.waitForRequest(
    (req) => req.url().endsWith("/astrology/charts") && req.method() === "POST",
  );
  await page.getByRole("button", { name: "Calcular meu mapa" }).click();
  expect((await request).postDataJSON().birth_time).toBeNull();
  await expect(page.getByText("Um retrato aproximado do céu.")).toBeVisible();
  await expect(page.getByText("Lua", { exact: true })).toBeVisible();
  await expect(page.locator(".natal-chart")).toHaveCount(0);
});
test("catalogue search uses server cards and pages fit the viewport", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/biblioteca");
  await expect(page.getByRole("heading", { name: "O Louco" })).toBeVisible();
  await page.getByLabel("Buscar uma carta").fill("inexistente");
  await expect(
    page.getByText("Nenhuma carta encontrada.", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("public navigation hides private destinations and private layout has its own routes", async ({
  page,
  isMobile,
}) => {
  await mock(page);
  await page.goto("/");
  if (isMobile)
    await page.getByRole("button", { name: "Abrir navegação" }).click();
  const nav = page.getByRole("navigation");
  await expect(nav.getByRole("link", { name: "Meu diário" })).toHaveCount(0);
  await expect(
    nav.getByRole("link", { name: "Entrar", exact: true }),
  ).toBeVisible();
  await page.goto("/app/mapa");
  await expect(page).toHaveURL(/entrar\?returnUrl=%2Fapp%2Fmapa/);
  await page.getByLabel("Seu e-mail", { exact: true }).fill(user.email);
  await page.getByLabel("Sua senha", { exact: true }).fill("a-long-password");
  await page.getByRole("button", { name: "Entrar no meu livro" }).click();
  await expect(page).toHaveURL("/app/mapa");
  if (isMobile)
    await page.getByRole("button", { name: "Abrir navegação" }).click();
  await expect(nav.getByRole("link", { name: "Meu diário" })).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "Entrar", exact: true }),
  ).toHaveCount(0);
  await page.goto("/entrar");
  await expect(page).toHaveURL("/app/diario");
  await page.goto("/app/conta");
  await expect(page.getByRole("heading", { name: "Seu espaço" })).toBeVisible();
});

test("warns before abandoning private diary changes", async ({ page }) => {
  await session(page);
  await mock(page);
  await page.goto("/app/diario");
  const note = page.getByLabel("Anotação privada");
  await expect(note).toBeVisible();
  await note.fill("Rascunho ainda não salvo.");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: /Favoritas/ }).click();
  await expect(note).toHaveValue("Rascunho ainda não salvo.");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("link", { name: /Abrir uma nova leitura/ }).click();
  await expect(page).toHaveURL(/app\/diario/);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("link", { name: /Abrir uma nova leitura/ }).click();
  await expect(page).toHaveURL(/app\/leitura/);
});

test("preserves reading-room drafts until saved or explicitly discarded", async ({
  page,
}) => {
  await session(page);
  await mock(page);
  await page.goto("/app/mesa/reading-1");
  const note = page.getByLabel("Suas anotações privadas");
  await expect(note).toBeEnabled();
  await note.fill("Quero voltar a esta reflexão.");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("link", { name: /Nova leitura/ }).click();
  await expect(page).toHaveURL(/app\/mesa\/reading-1/);
  await expect(note).toHaveValue("Quero voltar a esta reflexão.");
  await page.getByRole("button", { name: /Salvar alterações no diário/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "guardada" })).toBeVisible();
  await page.getByRole("link", { name: /Nova leitura/ }).click();
  await expect(page).toHaveURL(/app\/leitura/);
});

test("ignores a stale unauthorized response after a newer login", async ({
  page,
}) => {
  await session(page);
  await mock(page);
  let releaseOldRequest: (() => void) | undefined;
  let startedOldRequest: (() => void) | undefined;
  const started = new Promise<void>((resolve) => (startedOldRequest = resolve));
  let refreshCalls = 0;
  await page.route("**/api/v1/auth/refresh", async (route) => {
    refreshCalls++;
    await route.fallback();
  });
  await page.route("**/api/v1/readings/reading-1", async (route) => {
    startedOldRequest?.();
    await new Promise<void>((resolve) => (releaseOldRequest = resolve));
    await route.fulfill({ status: 401, json: { detail: "expired-old-session" } });
  });
  await page.goto("/app/mesa/reading-1");
  await started;
  await page.getByRole("link", { name: "Minha conta" }).click();
  await expect(page.getByRole("heading", { name: "Seu espaço" })).toBeVisible();
  await page.getByRole("button", { name: "Sair de todos os dispositivos" }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await page.getByLabel("Seu e-mail", { exact: true }).fill(user.email);
  await page.getByLabel("Sua senha", { exact: true }).fill("a-long-password");
  await page.getByRole("button", { name: /Entrar no meu livro/ }).click();
  await expect(page).toHaveURL(/app\/diario/);
  releaseOldRequest?.();
  await expect(page.getByRole("heading", { name: "Meu diário" })).toBeVisible();
  expect(refreshCalls).toBe(0);
});
