import { Component, input, output } from '@angular/core';

const artwork = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3e3cf6ab0b3186595f6d8cf06ded5d8e-xqT3WyL9U0J41DdGoxXvwvXm1Q8bK2.jpg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/393afa5cc1e5749c1e05c6be3aa34434-wUPyyojrRVSEp5IfcrQhpQVZk2WvEG.jpg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/58df37f87a63e44710e988bef5c4a33b-jitTgPD1RGmaafVV2Muyfx5lGkdHmO.jpg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a2fba52328b2feb366f4e8995a9a6746-ZJxiw3FZVvYY7JSiv6PYMWfRjMrKdE.jpg'
];

@Component({selector:'arcana-tarot-card',standalone:true,template:`
 @if (decorative()) { <div class="tarot-card" [style.background-image]="imageStyle()" aria-hidden="true"><span class="card-corner">✧</span><span class="card-sigil">◇<span>✦</span>◇</span><span class="card-brand">ARCANA</span></div> }
 @else { <button type="button" class="tarot-card" [style.background-image]="imageStyle()" [class.revealed]="revealed()" [attr.aria-label]="revealed() ? 'Símbolo demonstrativo revelado: ' + label() : 'Revelar carta demonstrativa ' + position()" (click)="reveal.emit()"><span class="card-corner">✧</span><span class="card-sigil">{{revealed() ? '☼' : '◇'}}<span>✦</span>◇</span><span class="card-brand">{{revealed() ? label() : 'ARCANA'}}</span></button> }
 `})
export class TarotCardComponent {
 decorative=input(false); revealed=input(false); label=input('O Sol'); position=input(1); reveal=output<void>();
 imageStyle(){ return `url("${artwork[(this.position() - 1) % artwork.length]}")`; }
}
