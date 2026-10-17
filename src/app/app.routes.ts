import { Routes } from '@angular/router';
export const routes: Routes = [
 {path:'diario', loadComponent:()=>import('./features/diary/diary.page').then(m=>m.DiaryPage)},
 {path:'conta', loadComponent:()=>import('./features/account/account.page').then(m=>m.AccountPage)},
 {path:'', loadComponent:()=>import('./features/home/home.page').then(m=>m.HomePage)},
 {path:'leitura', loadComponent:()=>import('./features/reading-setup/reading-setup.page').then(m=>m.ReadingSetupPage)},
 {path:'mesa', loadComponent:()=>import('./features/reading-room/reading-room.page').then(m=>m.ReadingRoomPage)},
 ...[
  ['biblioteca','As cartas','Uma biblioteca de símbolos e novas perspectivas.','O catálogo das 78 cartas e seus significados será integrado ao backend.'],
  ['entrar','Bem-vinda ao Arcana','Seu espaço de reflexão.','Cadastro, login e recuperação de acesso estão em preparação.']
 ].map(([path,title,subtitle,description])=>({path,data:{title,subtitle,description},loadComponent:()=>import('./shared/ui/pending.page').then(m=>m.PendingPage)})),
 {path:'**',loadComponent:()=>import('./shared/ui/pending.page').then(m=>m.PendingPage),data:{title:'Caminho não encontrado',subtitle:'Vamos voltar às cartas?',description:'Esta página não existe.'}}
];
