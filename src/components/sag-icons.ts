const ICON_PATHS: Record<string, string> = {
  attention: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 4v2"></path><path d="M20 12h-2"></path><path d="M12 20v-2"></path><path d="M4 12h2"></path>',
  edit: '<path d="M4 16.5V20h3.5L18.2 9.3l-3.5-3.5L4 16.5Z"></path><path d="M12.9 7.1l3.5 3.5"></path>',
  link: '<path d="M9.5 14.5 14.5 9.5"></path><path d="M8.8 10.8 7.4 12.2a3 3 0 0 0 4.2 4.2l1.4-1.4"></path><path d="m11 9 1.4-1.4a3 3 0 0 1 4.2 4.2l-1.4 1.4"></path>',
  'money-in': '<path d="M12 3v11"></path><path d="m8 10 4 4 4-4"></path><path d="M5 17.5h14"></path><path d="M7 20h10"></path>',
  cash: '<rect x="3" y="7" width="18" height="10" rx="2"></rect><circle cx="12" cy="12" r="2.5"></circle><path d="M6 10v4"></path><path d="M18 10v4"></path>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M4 10h16"></path>',
  debt: '<path d="M7 7h10a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h10"></path><path d="M8 11h8"></path><path d="M8 15h8"></path>',
  shield: '<path d="M12 3 5 6v5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-3Z"></path><path d="m9 12 2 2 4-4"></path>',
  'trend-down': '<path d="M4 7h5l4 5 3-3 4 5"></path><path d="M17 14h3v-3"></path>',
  review: '<path d="M7 4h10l3 3v13H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"></path><path d="M16 4v4h4"></path><path d="M8 12h6"></path><path d="M8 16h4"></path>',
  'arrow-up': '<path d="M12 19V5"></path><path d="m6 11 6-6 6 6"></path>',
  'arrow-down': '<path d="M12 5v14"></path><path d="m18 13-6 6-6-6"></path>',
  'weather-clear': '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.9 4.9 1.4 1.4"></path><path d="m17.7 17.7 1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.9 19.1 1.4-1.4"></path><path d="m17.7 6.3 1.4-1.4"></path>',
  'weather-cloud': '<path d="M7 17h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.1 2A3 3 0 0 0 7 17Z"></path>',
  'weather-rain': '<path d="M7 15h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.1 2A3 3 0 0 0 7 15Z"></path><path d="M8 19v2"></path><path d="M12 18v2"></path><path d="M16 19v2"></path>',
  'weather-storm': '<path d="M7 14h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.1 2A3 3 0 0 0 7 14Z"></path><path d="m13 14-3 5h4l-2 3"></path>',
  close: '<path d="m6 6 12 12"></path><path d="M18 6 6 18"></path>',
  sprout: '<path d="M12 20v-7"></path><path d="M12 13c-2.8 0-5-2.2-5-5.1 2.8 0 5 2.2 5 5.1Z"></path><path d="M12 13c2.8 0 5-2.2 5-5.1-2.8 0-5 2.2-5 5.1Z"></path>',
  success: '<path d="m5 12 4 4 10-10"></path>',
  warning: '<path d="M12 3 2.8 19h18.4L12 3Z"></path><path d="M12 9v4.5"></path><path d="M12 16.5h.01"></path>',
};

window.renderSAGIcon = (icon, options = {}) => {
  const paths = ICON_PATHS[icon] || ICON_PATHS.attention;
  const size = options.size ? ` sag-icon--${options.size}` : '';
  const tone = options.tone ? ` sag-tone-${options.tone}` : '';
  return `<svg class="sag-icon${size}${tone}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g>${paths}</g></svg>`;
};
