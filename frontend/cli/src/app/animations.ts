import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('login <=> registro', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0
      })
    ], { optional: true }),
    query(':enter', [
      style({ 
        transform: 'translateX(100%)',
        opacity: 0 
      })
    ], { optional: true }),
    query(':leave', [
      style({ 
        transform: 'translateX(0%)',
        opacity: 1 
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('500ms ease-in-out', style({ 
          transform: 'translateX(-100%)',
          opacity: 0 
        }))
      ], { optional: true }),
      query(':enter', [
        animate('500ms ease-in-out', style({ 
          transform: 'translateX(0%)',
          opacity: 1 
        }))
      ], { optional: true })
    ])
  ])
]);

export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate('700ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const slideUpAnimation = trigger('slideUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate('600ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const pulseAnimation = trigger('pulse', [
  transition('* => clicked', [
    style({ transform: 'scale(1)' }),
    animate('120ms ease-in-out', style({ transform: 'scale(0.98)' })),
    animate('120ms ease-in-out', style({ transform: 'scale(1)' }))
  ])
]);

export const logoAnimation = trigger('logoWave', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'translateY(-8px) scale(0.96)'
    }),
    animate('700ms 30ms ease-out', style({ 
      opacity: 1, 
      transform: 'translateY(0) scale(1)'
    }))
  ])
]);
