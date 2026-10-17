import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
@Component({selector:'arcana-root', standalone:true, imports:[RouterOutlet,RouterLink,RouterLinkActive],
 template:`<a class="skip-link" href="#main">Pular para o conteúdo</a>
 <header><a class="wordmark" routerLink="/" aria-label="Arcana início">✧ ARCANA</a>
 <nav aria-label="Navegação principal"><a routerLink="/leitura" routerLinkActive="active">Consultar</a><a routerLink="/biblioteca" routerLinkActive="active">As cartas</a><a routerLink="/diario" routerLinkActive="active">Meu diário</a></nav>
 <a class="account-link" routerLink="/entrar">Entrar</a></header>
 <main id="main" tabindex="-1"><router-outlet /></main>
 <footer><span>ARCANA · Entre cartas, novas perspectivas.</span><span>Entretenimento e reflexão.</span></footer>`})
export class AppComponent {}
