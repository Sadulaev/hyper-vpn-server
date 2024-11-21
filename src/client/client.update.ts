import { Action, Ctx, Update } from "nestjs-telegraf";
import { CustomContext } from "types/context";
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
        await this.clientService.getMyClients(ctx);
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

    @Action(new RegExp(CommonCallbacks.GetClientsByUserId))
    async getClientsByUserId(@Ctx() ctx: CustomContext) {
        await this.clientService.getClientsByUserId(ctx);
    }
}