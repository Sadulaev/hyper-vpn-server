import { Action, Command, Ctx, InjectBot, On, Start, Update } from "nestjs-telegraf";
import { AdminService } from "src/admin/admin.service";
import { AuthService } from "src/auth/auth.service";
import config from "src/config";
import { UserRole } from "enums/roles.enum";
import { CustomContext } from "types/context";
import { UserService } from "src/user/user.service";
import { Context, Telegraf } from "telegraf";
import { CommonCallbacks } from "enums/callbacks.enum";
import { Inject } from "@nestjs/common";
import { ClientService } from "./client.service";

@Update()
export class ClientUpdate {
    constructor(
        @Inject() private clientService: ClientService
    ) {}
    
    @Action(new RegExp(CommonCallbacks.GetMyClients))
    async getClientsCreatedByMe(@Ctx() ctx: CustomContext) {
        await this.clientService.getClientsCreatedByMe(ctx);
    }

    @Action(CommonCallbacks.FindClients)
    async startClientSearch(@Ctx() ctx: CustomContext) {
        await this.clientService.onStartSearchClient(ctx);
    }

    @Action(CommonCallbacks.ChangeSearchClientPage)
    async changeSearchClientPage(@Ctx() ctx: CustomContext) {
        await this.clientService.onChangeClientSearchPage(ctx);
    }

    @Action(new RegExp(CommonCallbacks.GetClient))
    async getClientInfo(@Ctx() ctx: CustomContext) {
        await this.clientService.getClientInfo(ctx);
    }
}