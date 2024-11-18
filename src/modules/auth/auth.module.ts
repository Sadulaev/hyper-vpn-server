import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthUpdate } from "./auth.update";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule],
    providers: [AuthService, AuthUpdate],
    exports: [AuthUpdate]
})
export class AuthModule { }