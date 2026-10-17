import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SpreadsService, Spread } from '../../core/api/spreads.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({standalone:true,imports:[ReactiveFormsModule,RouterLink],template:`
<section class="page narrow"><p class="eyebrow">ANTES DE VIRAR AS CARTAS</p><h1>O que pede<br><em>sua atenção?</em></h1>
<p class="lead">Dê espaço à pergunta que trouxe você até aqui.</p>
<form [formGroup]="form" (ngSubmit)="prepare()"><label for="question">Sua pergunta</label><textarea id="question" formControlName="question" rows="4" maxlength="2000" placeholder="Sobre o que você gostaria de refletir?" aria-describedby="question-help"></textarea><p id="question-help" class="muted small">Entre 5 e 2.000 caracteres. Sua pergunta não é salva nesta demonstração.</p>
<label for="spread">Sua tiragem</label><select id="spread" formControlName="spread"><option value="three_cards">Três cartas</option><option value="daily">Carta do dia</option></select>
@if (apiState() === 'connected') {<p class="small muted">Tipos de tiragem disponíveis no servidor: {{spreads().length}}.</p>}
@if (apiState() === 'unavailable') {<p class="small muted" role="status">Servidor indisponível. A prévia visual continua disponível.</p>}
<button class="button" type="submit">Preparar meu ritual ↗</button>
@if (submitted()) {<div class="notice" role="status">A criação de leituras ainda está em preparação. Você pode explorar a mesa demonstrativa, sem enviar sua pergunta.<p><a routerLink="/mesa">Explorar a mesa visual →</a></p></div>}
@if (invalid()) {<p role="alert">Escreva uma pergunta com pelo menos 5 caracteres, além de espaços.</p>}
</form></section>`})
export class ReadingSetupPage {
 private readonly service=inject(SpreadsService);
 readonly spreads=signal<Spread[]>([]); readonly apiState=signal('loading');
 readonly submitted=signal(false); readonly invalid=signal(false);
 readonly form=new FormGroup({question:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.minLength(5),Validators.maxLength(2000)]}),spread:new FormControl('three_cards',{nonNullable:true})});
 constructor(){this.service.list().pipe(takeUntilDestroyed()).subscribe({next:s=>{this.spreads.set(s);this.apiState.set('connected');},error:()=>this.apiState.set('unavailable')});}
 prepare(){this.form.markAllAsTouched();const valid=this.form.valid && this.form.controls.question.value.trim().length>=5;this.invalid.set(!valid);this.submitted.set(valid);}
}
