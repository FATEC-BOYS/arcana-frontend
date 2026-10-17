import { Component, signal } from '@angular/core';
import { TarotCardComponent } from '../../shared/ui/tarot-card.component';
@Component({standalone:true,imports:[TarotCardComponent],template:`<section class="page reading-room"><p class="eyebrow">PRÉVIA DA EXPERIÊNCIA</p><h1>Um instante.<br><em>Novas perspectivas.</em></h1><p class="lead">Toque nas cartas para explorar a revelação.</p><div class="notice">Demonstração visual: símbolos fixos, sem sorteio ou interpretação de IA. O progresso não é salvo.</div><div class="reading-cards">@for(label of labels;track $index;let i=$index){<div><p class="eyebrow">{{positions[i]}}</p><arcana-tarot-card [position]="i+1" [label]="label" [revealed]="revealed().includes(i)" (reveal)="reveal(i)" /></div>}</div><p aria-live="polite" class="muted">{{revealed().length}} de 3 cartas demonstrativas reveladas.</p></section>`})
export class ReadingRoomPage {
 readonly labels=['O Sol','A Lua','A Estrela'];readonly positions=['Seu momento','Um olhar atento','Uma possibilidade'];readonly revealed=signal<number[]>([]);
 reveal(index:number){this.revealed.update(cards=>cards.includes(index)?cards:[...cards,index]);}
}
