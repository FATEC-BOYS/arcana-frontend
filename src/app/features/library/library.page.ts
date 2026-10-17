import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TarotCardComponent } from '../../shared/ui/tarot-card.component';

@Component({standalone:true,imports:[RouterLink,TarotCardComponent],template:`
<section class="library-page">
  <div class="page-heading"><p class="eyebrow">O ARCANO SE REVELA</p><h1>As cartas que <em>falam.</em></h1><p class="lead">Cada imagem guarda uma pergunta. Explore os símbolos e encontre a que conversa com o seu momento.</p></div>
  <div class="library-grid">@for (card of cards; track card.number; let i = $index) {<article class="library-card"><arcana-tarot-card [position]="i + 1" [label]="card.title" [revealed]="true"/><div><p class="card-number">{{card.number}}</p><h2>{{card.title}}</h2><p>{{card.text}}</p></div></article>}</div>
  <a class="button" routerLink="/leitura">Abrir uma tiragem <span aria-hidden="true">↗</span></a>
</section>`})
export class LibraryPage { cards = [
 {number:'I',title:'A Visionária',text:'Intuição, presença e o olhar que atravessa o óbvio.'},
 {number:'II',title:'O Guardião',text:'Coragem para atravessar mudanças com consciência.'},
 {number:'III',title:'A Alquimia',text:'Desejo, criação e a força de transformar caminhos.'},
 {number:'IV',title:'O Oráculo',text:'Silêncio, mistério e respostas que chegam no tempo certo.'}
]; }
