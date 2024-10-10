import {
  AdminCallbacks,
  DefaultCallbacks,
  ModeratorCallbacks,
  UserCallbacks,
} from 'src/enums/callbacks.enum';
import { Markup } from 'telegraf';

export function adminMainButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback(
        '👨‍💼 Управление модераторами',
        AdminCallbacks.ControlModerators,
      ),
      Markup.button.callback(
        '👨‍💼 Управление пользователями',
        AdminCallbacks.ControlUsers,
      ),
      Markup.button.callback('✔ Записи о клиентах', AdminCallbacks.GetRecords),
      Markup.button.callback(
        '🔑 Активные запросы на вступление',
        `${AdminCallbacks.GetJoinRequests}&page-1`,
      ),
    ],
    { columns: 1 },
  );
}

export function moderatorMainButtons() {
  return Markup.inlineKeyboard([
    Markup.button.callback(
      '👨‍💼 Управление пользователями',
      ModeratorCallbacks.ControlUsers,
    ),

    Markup.button.callback('✔ Записи о клиентах', 'moderator_get-records'),
    Markup.button.callback(
      '🔑 Активные запросы на вступление',
      ModeratorCallbacks.GetJoinRequests,
    ),
    Markup.button.callback(
      '✔ Записи о клиентах',
      ModeratorCallbacks.GetRecords,
    ),
  ]);
}

export function usersMainButtons() {
  return Markup.inlineKeyboard([
    Markup.button.callback(
      '🔍 Поиск клинта по базе',
      UserCallbacks.FindClients,
    ),
    Markup.button.callback(
      '✍ Управление своими клиентами',
      UserCallbacks.ControlClients,
    ),
  ]);
}

export function sendRequestButton() {
  return Markup.inlineKeyboard([
    Markup.button.callback(
      '📩 Отправить заявку',
      DefaultCallbacks.SendJoinRequest,
    ),
  ]);
}

export function requestControlButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback(
        '✔ Принять запрос',
        AdminCallbacks.AcceptJoinRequest,
      ),
      Markup.button.callback(
        '❌ Отклонить запрос',
        AdminCallbacks.DeclineJoinRequest,
      ),
      Markup.button.callback(
        '🔒 Отклонить запрос и забанить',
        AdminCallbacks.DeclineAndBanJoinRequest,
      ),
    ],
    { columns: 1 },
  );
}
