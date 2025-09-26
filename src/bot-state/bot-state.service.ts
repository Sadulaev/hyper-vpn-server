import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BotState } from "entities/bots-state.entity";
import { Repository } from "typeorm";

@Injectable()
export class BotStateService {
    constructor(
        @InjectRepository(BotState)
        private readonly botStateRepo: Repository<BotState>,
    ) { }

    async getBotState(name: string) {
        const state =
            (await this.botStateRepo.findOne({ where: { name } })) ??
            (await this.botStateRepo.save(
                this.botStateRepo.create({ name, enabled: true }),
            ));

        return state;
    }

    async isEnabled(name: string): Promise<boolean> {
        let state = await this.botStateRepo.findOne({ where: { name } });


        if (!state) {
            console.log(state);
            state = await this.botStateRepo.save(
                this.botStateRepo.create({ name, enabled: true }),
            );
        }
            
        return state.enabled;
    }
}