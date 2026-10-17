import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TarotCardComponent } from '../../shared/ui/tarot-card.component';
@Component({standalone:true,imports:[RouterLink,TarotCardComponent],template:`
<section class="hero"><div class="hero-copy"><p class="eyebrow">UM ENCONTRO COM O SEU MOMENTO</p>
<h1>Há perguntas que<br>abrem <em>caminhos.</em></h1>
<p class="lead">Uma pausa. Uma pergunta. Um universo de símbolos para olhar sua história por outra perspectiva.</p>
<a class="button" routerLink="/leitura">Iniciar meu ritual <span aria-hidden="true">↗</span></a>
<p class="muted small">Você traz a pergunta. As cartas abrem a conversa.</p></div>
<div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="hero-card side left"><arcana-tarot-card [decorative]="true" /></div><div class="hero-card center"><arcana-tarot-card [decorative]="true" /></div><div class="hero-card side right"><arcana-tarot-card [decorative]="true" /></div></div></section>
<section class="intro"><p class="eyebrow">O RITUAL</p><h2>Reserve um instante para você.</h2><div class="steps"><article><span>01</span><h3>Traga uma pergunta</h3><p>O que está ocupando sua cabeça hoje?</p></article><article><span>02</span><h3>Revele as cartas</h3><p>Explore os símbolos da sua tiragem.</p></article><article><span>03</span><h3>Abra a conversa</h3><p>Encontre espaço para novas reflexões.</p></article></div></section>`})
export class HomePage {}
