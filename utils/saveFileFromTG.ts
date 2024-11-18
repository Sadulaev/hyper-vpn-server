import * as fs from 'fs';
import * as path from 'path';
import { CustomContext } from 'types/context';
import { Readable } from "stream";
import { finished } from "stream/promises";
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

export default async (ctx: CustomContext, bot: Telegraf<Context<Update>>) => {
    const photos = ctx.message.photo;
    const largestPhoto = photos[photos.length - 1];
    const fileId = largestPhoto.file_id;
    const fileLink = await bot.telegram.getFileLink(fileId)

    const saveDirectory = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory, { recursive: true });
    }
    
    const fileName = `${Date.now()}_${fileLink.href.split('/')[fileLink.href.split('/').length - 1]}`

    const destination = path.join(saveDirectory, fileName);

    const response = await fetch(fileLink);

    const writer = fs.createWriteStream(destination, {flags: 'wx'});

    await finished(Readable.fromWeb(response.body).pipe(writer))

    return fileName;
}