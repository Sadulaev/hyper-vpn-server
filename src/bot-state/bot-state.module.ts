import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BotState } from "entities/bots-state.entity";
import { BotStateService } from "./bot-state.service";

@Module({
    imports: [TypeOrmModule.forFeature([BotState])],
    providers: [BotStateService],
    exports: [BotStateService],
})
export class BotStateModule { }