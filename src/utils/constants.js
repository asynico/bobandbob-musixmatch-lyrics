export const ENDPOINTS = Object.freeze({
  TOKEN: 'https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0',
  SEARCH: 'https://apic-desktop.musixmatch.com/ws/1.1/track.search?app_id=web-desktop-app-v1.0&page_size=3&page=1&s_track_rating=desc',
  LYRICS: 'https://apic-desktop.musixmatch.com/ws/1.1/track.subtitle.get?app_id=web-desktop-app-v1.0&subtitle_format=lrc',
  ALT_LYRICS: 'https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&subtitle_format=mxm&app_id=web-desktop-app-v1.0'
});

export const REGEX = {
  TIMESTAMPS: /\[\d+:\d+\.\d+\]/g,
  EMPTY_LINES: /^\s*$/,
  ARTIST_TITLE: /^(.*?)\s*[-–~]\s*(.+)$/
};
