import * as fs from 'fs';
import * as path from 'path';

export default async(fileName: string) => {
    const directory = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(directory)) {
        throw Error('Папка с изображениями не обнаружена')
    }

    fs.rm(`${directory}/${fileName}`, () => { 
        return true;
    })
}