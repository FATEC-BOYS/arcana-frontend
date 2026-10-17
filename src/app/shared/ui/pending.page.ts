import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({standalone:true,imports:[RouterLink],template:`<section class="page narrow"><p class="eyebrow">EM PREPARAÇÃO</p><h1>{{data['title']}}</h1><p class="lead">{{data['subtitle']}}</p><p class="muted">{{data['description']}}</p><a class="button" routerLink="/leitura">Explorar o ritual ↗</a></section>`})
export class PendingPage {readonly data=inject(ActivatedRoute).snapshot.data;}
