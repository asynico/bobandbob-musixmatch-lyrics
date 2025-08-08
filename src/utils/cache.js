import { readFile, writeFile } from 'node:fs/promises';

function ensureJsonExt(file) {
    return file.endsWith('.json') ? file : `${file}.json`;
}

export async function readToken(file) {
    const jsonFile = ensureJsonExt(file);
    try {
        const data = await readFile(jsonFile, 'utf-8');
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export async function saveToken(file, token, expires) {
    const jsonFile = ensureJsonExt(file);
    await writeFile(jsonFile, JSON.stringify({ value: token, expires }), 'utf-8');
}
