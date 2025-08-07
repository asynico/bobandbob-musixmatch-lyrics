export function cleanLyrics(lyrics, regex) {
    return lyrics
        .replace(regex.TIMESTAMPS, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => !regex.EMPTY_LINES.test(line))
        .join('\n');
}

export function parseSubtitles(subtitleBody) {
    try {
        const subtitleData = JSON.parse(subtitleBody);
        return subtitleData.map(item => ({
            range: { start: item.time.total * 1000 },
            line: item.text
        }));
    } catch {
        return null;
    }
}