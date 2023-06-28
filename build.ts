import * as path from 'path';
import * as fs from 'fs/promises';

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

async function copyAssets(root: string, target: string, avoid: string[]) {
    const types = ['.png', '.html', '.jpg'];
    avoid.push(target);
    for await (const from of paths(root)) {
        const to = path.join(target, path.relative(root, from));
        if (avoid.filter(s => !path.relative(s, from).startsWith('..')).length > 0) {
            continue;
        }
        if (types.filter(x => from.endsWith(x)).length > 0) {
            console.log(`Copying: ${from} -> ${to}`);
            await fs.copyFile(from, to);
        }
    }
}

async function fixImports(root: string) {
    for await (const from of paths(root)) {
        if (from.endsWith('js')) {
            console.log(`Fixing: ${from}`);
            const data = await fs.readFile(from);
            const fixed = data.toString().replace(/import\s+(.*)\sfrom\s+['"]\.(\S*)(.js)?['"];/g, "import $1 from '$2.js';");
            await fs.writeFile(from, fixed);
        }
    }
}

async function main() {
    await copyAssets("./", "./dist/", ['node_modules']);
    await fixImports("./dist");
}

main().then(_ => process.exit(0));
