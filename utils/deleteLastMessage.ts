import { CustomContext } from "types/context";

export default (ctx: CustomContext, messageId: number) => {
    ctx.deleteMessage(messageId);
}