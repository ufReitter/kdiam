import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

const left = [
  query(':enter, :leave', style({}), {
    optional: true,
  }),
  group([
    query(
      ':enter',
      [
        style({ transform: 'translateX(-100%)' }),
        animate('400ms ease-in-out', style({ transform: 'translateX(0%)' })),
      ],
      {
        optional: true,
      },
    ),
    query(
      ':leave',
      [
        style({ transform: 'translateX(0%)' }),
        animate('400ms ease-in-out', style({ transform: 'translateX(100%)' })),
      ],
      {
        optional: true,
      },
    ),
  ]),
];

const right = [
  query(':enter, :leave', style({}), {
    optional: true,
  }),
  group([
    query(
      ':enter',
      [
        style({ transform: 'translateX(100%)' }),
        animate('400ms ease-in-out', style({ transform: 'translateX(0%)' })),
      ],
      {
        optional: true,
      },
    ),
    query(
      ':leave',
      [
        style({ transform: 'translateX(0%)' }),
        animate('400ms ease-in-out', style({ transform: 'translateX(-100%)' })),
      ],
      {
        optional: true,
      },
    ),
  ]),
];

export const slideInAnimation = trigger('slideIn', [
  transition(':increment', right),
  transition(':decrement', left),
]);

const fade = [
  query(':enter, :leave', style({}), {
    optional: true,
  }),
  group([
    query(
      ':enter',
      [
        style({ opacity: 0 }),
        animate('600ms ease-in-out', style({ opacity: 1 })),
      ],
      {
        optional: true,
      },
    ),
    query(
      ':leave',
      [
        style({ opacity: 1 }),
        animate('600ms ease-in-out', style({ opacity: 0 })),
      ],
      {
        optional: true,
      },
    ),
  ]),
];

export const fadeInAnimation = trigger('fadeIn', [transition('* => *', fade)]);

function animateChild() {
  return false;
}
