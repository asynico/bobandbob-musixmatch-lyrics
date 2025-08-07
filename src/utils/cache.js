import { readFile, writeFile } from 'node:fs/promises';

export async function readToken(file) {
    try {
        const data = await readFile(file, 'utf-8');
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export async function saveToken(file, token, expires) {
    await writeFile(file, JSON.stringify({ value: token, expires }), 'utf-8');
}
