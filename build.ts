/**
 * This file isn't part of the game. It is used to make sure that the game
 * files work in a web browser.
 */
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Find all of the paths in a folder.
 * 
 * @param root The root folder to begin searching
 * @returns A generator of folders
 */
async function* paths(root: string): AsyncGenerator<string> {
    const names = await fs.readdir(root, {withFileTypes: true});
    for(const dirent of names) {
        const full = path.normalize(path.join(root, dirent.name));
        if (dirent.isDirectory()) {
            yield *paths(full);
        } else {
            yield full;
        }
    }
}

/**
 * Copy all of the "assets" (pictures, HTML documents..) to an output folder
 * 
 * @param source The source folder to search for assets
 * @param target The target folder to copy assets to
 * @param avoid Any folders that we don't care about
 */
async function copyAssets(source: string, target: string, avoid: string[]) {
    const types = ['.png', '.html', '.jpg'];
    avoid.push(target);
    for await (const from of paths(source)) {
        const to = path.join(target, path.relative(source, from));
        if (avoid.filter(s => !path.relative(s, from).startsWith('..')).length > 0) {
            continue;
        }
        await fs.mkdir(path.dirname(to), {recursive: true});
        if (types.filter(x => from.endsWith(x)).length > 0) {
            console.log(`Copying: ${from} -> ${to}`);
            await fs.copyFile(from, to);
        }
    }
}

/**
 * Main function to be called when making this ready for the browser
 */
async function main() {
    await copyAssets("./", "./dist/", ['node_modules']);
}

main().then(_ => process.exit(0));
