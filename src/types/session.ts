import { UserRole } from "src/enums/roles.enum";

export interface SessionData {
  role?: UserRole;  // Роль пользователя
  // ...;  Другие поля
}