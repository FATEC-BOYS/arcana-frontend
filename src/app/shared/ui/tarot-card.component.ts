import { Component, input, output } from '@angular/core';
@Component({selector:'arcana-tarot-card',standalone:true,template:`
 @if (decorative()) { <div class="tarot-card" aria-hidden="true"><span class="card-corner">✧</span><span class="card-sigil">◇<span>✦</span>◇</span><span class="card-brand">ARCANA</span></div> }
 @else { <button type="button" class="tarot-card" [class.revealed]="revealed()" [attr.aria-label]="revealed() ? 'Símbolo demonstrativo revelado: ' + label() : 'Revelar carta demonstrativa ' + position()" (click)="reveal.emit()"><span class="card-corner">✧</span><span class="card-sigil">{{revealed() ? '☼' : '◇'}}<span>✦</span>◇</span><span class="card-brand">{{revealed() ? label() : 'ARCANA'}}</span></button> }
 `})
export class TarotCardComponent {
 decorative=input(false); revealed=input(false); label=input('O Sol'); position=input(1); reveal=output<void>();
}
