const ICON_PATHS: Record<string, string> = {
  attention: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 4v2"></path><path d="M20 12h-2"></path><path d="M12 20v-2"></path><path d="M4 12h2"></path>',
  edit: '<path d="M4 16.5V20h3.5L18.2 9.3l-3.5-3.5L4 16.5Z"></path><path d="M12.9 7.1l3.5 3.5"></path>',
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
