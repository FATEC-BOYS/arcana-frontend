import { Component, input, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
@Component({
  selector: "arcana-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `<a class="skip-link" href="#main">Pular para o conteúdo</a>
    <header>
      <a
        class="wordmark"
        [routerLink]="privateArea() ? '/app/diario' : '/'"
        aria-label="Arcana — início"
        >✧ ARCANA</a
      >
      <nav
        aria-label="Navegação principal"
        [class.open]="menuOpen()"
        id="main-nav"
        (click)="menuOpen.set(false)"
      >
        @if (privateArea()) {
          <a routerLink="/app/leitura" routerLinkActive="active">Consultar</a>
          <a routerLink="/app/mapa" routerLinkActive="active">Mapa natal</a>
          <a routerLink="/app/diario" routerLinkActive="active">Meu diário</a>
        } @else {
          <a
            routerLink="/"
            [routerLinkActiveOptions]="{ exact: true }"
            routerLinkActive="active"
            >Início</a
          >
          <a routerLink="/biblioteca" routerLinkActive="active">As cartas</a>
          <a routerLink="/entrar" routerLinkActive="active">Entrar</a>
        }
      </nav>
      <button
        class="mobile-menu"
        type="button"
        [attr.aria-label]="menuOpen() ? 'Fechar navegação' : 'Abrir navegação'"
        [attr.aria-expanded]="menuOpen()"
        aria-controls="main-nav"
        (click)="menuOpen.set(!menuOpen())"
      >
        ☰
      </button>
      <button
        class="sound-toggle"
        type="button"
        (click)="toggleSound()"
        [attr.aria-pressed]="soundOn"
        [attr.aria-label]="soundOn ? 'Desativar sons' : 'Ativar sons'"
      >
        {{ soundOn ? "◉ Som" : "○ Som" }}
      </button>
      <a
        class="account-link"
        [routerLink]="privateArea() ? '/app/conta' : '/cadastro'"
        >{{ privateArea() ? "Minha conta" : "Criar conta" }}</a
      >
    </header>
    <main id="main" tabindex="-1"><ng-content /></main>
    <footer>
      <span>ARCANA · Entre cartas, novas perspectivas.</span
      ><span>Entretenimento e reflexão.</span>
    </footer>`,
})
export class ShellComponent {
  readonly privateArea = input(false);
  readonly menuOpen = signal(false);
  soundOn = false;
  toggleSound() {
    this.soundOn = !this.soundOn;
    if (!this.soundOn || typeof window === "undefined") return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 528;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 1.25);
    oscillator.onended = () => void context.close();
  }
}
