import { Routes } from '@angular/router';
export const routes: Routes = [
 {path:'', loadComponent:()=>import('./features/home/home.page').then(m=>m.HomePage)},
 {path:'leitura', loadComponent:()=>import('./features/reading-setup/reading-setup.page').then(m=>m.ReadingSetupPage)},
 {path:'mesa', loadComponent:()=>import('./features/reading-room/reading-room.page').then(m=>m.ReadingRoomPage)},
 ...[
  ['biblioteca','As cartas','Uma biblioteca de símbolos e novas perspectivas.','O catálogo das 78 cartas e seus significados será integrado ao backend.'],
  ['diario','Seu diário','Guarde o que fez sentido para você.','Histórico, favoritos e notas pessoais serão disponibilizados após a integração com autenticação e persistência.'],
  ['entrar','Bem-vinda ao Arcana','Seu espaço de reflexão.','Cadastro, login e recuperação de acesso estão em preparação.'],
  ['conta','Sua conta','Preferências e privacidade.','A gestão da conta depende da implementação da autenticação.']
 ].map(([path,title,subtitle,description])=>({path,data:{title,subtitle,description},loadComponent:()=>import('./shared/ui/pending.page').then(m=>m.PendingPage)})),
 {path:'**',loadComponent:()=>import('./shared/ui/pending.page').then(m=>m.PendingPage),data:{title:'Caminho não encontrado',subtitle:'Vamos voltar às cartas?',description:'Esta página não existe.'}}
];
