import { Routes } from '@angular/router';
import { Article } from './pages/article/article';
import { Homepage } from './pages/homepage/homepage';
import { NodeResolver } from './resolver/node.resolver';

export const routes: Routes = [
  {
    path: ':locale/:slug1/:slug2/:slug3/:slug4',
    component: Article,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/:slug1/:slug2/:slug3',
    component: Article,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/:slug1/:slug2',
    component: Article,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/:slug1',
    component: Article,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale',
    component: Homepage,
    resolve: {
      node: NodeResolver,
    },
    data: {},
  },
  {
    path: '',
    component: Homepage,
    resolve: {
      node: NodeResolver,
    },
    data: {},
  },
  { path: '**', redirectTo: '' },
];
