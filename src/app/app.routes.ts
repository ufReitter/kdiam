import { Routes } from '@angular/router';
import { Article } from './pages/article/article';
import { Homepage } from './pages/homepage/homepage';
import { Volume } from './pages/volume/volume';
import { NodeResolver } from './resolver/node.resolver';

export const routes: Routes = [
  {
    path: ':locale',
    component: Homepage,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: '',
    component: Homepage,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/volumes/:volumeSlug',
    component: Volume,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/admin',
    loadComponent: () => import(`./admin/admin/admin`).then((mod) => mod.Admin),
    resolve: {
      node: NodeResolver,
    },
  },
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
  { path: '**', redirectTo: '' },
];
