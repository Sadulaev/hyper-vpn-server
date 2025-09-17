import { CustomContext } from "types/context";

export function deleteLastMessageIfExist(ctx: CustomContext) {
    try {
        if (ctx.callbackQuery.message.message_id) {
            ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        }
    } catch (err) {
        console.error(err);
    }
}