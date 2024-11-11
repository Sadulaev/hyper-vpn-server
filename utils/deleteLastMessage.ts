import { CustomContext } from "src/types/context";

export default (ctx: CustomContext, messageId: number) => {
    ctx.deleteMessage(messageId);
}