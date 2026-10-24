import { svg } from '../core/dom.js';

const PATHS = {
  back: 'M15 6l-6 6 6 6',
  chevron: 'M9 6l6 6-6 6',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  plus: 'M12 5v14M5 12h14',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  check: 'M5 12l5 5 9-10',
  close: 'M6 6l12 12M18 6L6 18',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  // Asignaturas
  mates: 'M7 3v8M3 7h8M14 7h7M4 14l7 7M11 14l-7 7M14 16h7M14 20h7',
  sociales: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  ingles: 'M4 5h16v11h-9l-5 4v-4H4zM8 9h8M8 12h5',
  lengua: 'M5 4h14v16H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12M9 8h6',
  sciences: 'M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3M7.5 15h9',
};

export function icon(name, size = 24) {
  return svg(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2.2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
    },
    svg('path', { d: PATHS[name] || '' }),
  );
}
