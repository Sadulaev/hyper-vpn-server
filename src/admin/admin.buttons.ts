import { AdminCallbacks } from 'src/enums/callbacks.enum';
import { User } from 'src/user/user.entity';
import { Markup } from 'telegraf';

export const joinRequestsButtons = (users: User[], page: number) => {
  if (page === 1) {
    return Markup.inlineKeyboard(
      [
        ...users.map((user) =>
          Markup.button.callback(
            `👨‍💼 ${user.name}`,
            `${AdminCallbacks.GetOneJoinRequest}&id-${user.id}`,
          ),
        ),
        Markup.button.callback(
          'Следущая страница ➡',
          `${AdminCallbacks.GetJoinRequests}&page-${page + 1}`,
        ),
      ],
      { columns: 1 },
    );
  } else {
    return Markup.inlineKeyboard(
      [
        ...users.map((user) =>
          Markup.button.callback(
            `👨‍💼 ${user.name}`,
            `${AdminCallbacks.GetOneJoinRequest}&id-${user.id}`,
          ),
        ),
        Markup.button.callback(
          '⬅ Предыдущая страница',
          `${AdminCallbacks.GetJoinRequests}&page-${page - 1 || 1}`,
        ),
        Markup.button.callback(
          'Следущая страница ➡',
          `${AdminCallbacks.GetJoinRequests}&page-${page + 1}`,
        ),
      ],
      { columns: 1 },
    );
  }
}

export const controlModeratorsButtons = () => {
  return Markup.inlineKeyboard([
    Markup.button.callback('Cписок модераторов', `${AdminCallbacks.GetModeratorsList}&page-1`),
    Markup.button.callback('Найти модератора', AdminCallbacks.FindModerator),
  ], { columns: 1 })
};

export const moderatorslistButtons = (users: User[], page: number) => {
  if (page === 1) {
    return Markup.inlineKeyboard(
      [
        ...users.map((user) =>
          Markup.button.callback(
            `👨‍💼 ${user.name}`,
            `${AdminCallbacks.GetModerator}&id-${user.id}`,
          ),
        ),
        Markup.button.callback(
          'Следущая страница ➡',
          `${AdminCallbacks.GetModeratorsList}&page-${page + 1}`,
        ),
      ],
      { columns: 1 },
    );
  } else {
    return Markup.inlineKeyboard(
      [
        ...users.map((user) =>
          Markup.button.callback(
            `👨‍💼 ${user.name}`,
            `${AdminCallbacks.GetModerator}&id-${user.id}`,
          ),
        ),
        Markup.button.callback(
          '⬅ Предыдущая страница',
          `${AdminCallbacks.GetModeratorsList}&page-${page - 1 || 1}`,
        ),
        Markup.button.callback(
          'Следущая страница ➡',
          `${AdminCallbacks.GetModeratorsList}&page-${page + 1}`,
        ),
      ],
      { columns: 1 },
    );
  }
}

export const banslistButtons = (users: User[], page: number) => {
  if (page === 1) {
    return Markup.inlineKeyboard(
      [
        ...users.map((user) =>
          Markup.button.callback(
            `👨‍💼 ${user.name}`,
            `${AdminCallbacks.GetBannedUser}&id-${user.id}`,
          ),
        ),
        Markup.button.callback(
          'Следущая страница ➡',
          `${AdminCallbacks.GetBansList}&page-${page + 1}`,
        ),
      ],
      { columns: 1 },
    );
  } else {
    return Markup.inlineKeyboard(
      [
        ...users.map((user) =>
          Markup.button.callback(
            `👨‍💼 ${user.name}`,
            `${AdminCallbacks.GetModerator}&id-${user.id}`,
          ),
        ),
        Markup.button.callback(
          '⬅ Предыдущая страница',
          `${AdminCallbacks.GetBansList}&page-${page - 1 || 1}`,
        ),
        Markup.button.callback(
          'Следущая страница ➡',
          `${AdminCallbacks.GetBansList}&page-${page + 1}`,
        ),
      ],
      { columns: 1 },
    );
  }
}

export const controlUsersButtons = () => {
  return Markup.inlineKeyboard([
    Markup.button.callback('Cписок пользователей', `${AdminCallbacks.GetUsersList}&page-1`),
    Markup.button.callback('Найти пользователей', AdminCallbacks.FindUser),
  ], { columns: 1 })
}

export const userslistButtons = (users: User[], page: number) => {
  if (page === 1) {
    return Markup.inlineKeyboard(
      [
        ...users.map((user) =>
          Markup.button.callback(
            `👨‍💼 ${user.name}`,
            `${AdminCallbacks.GetUser}&id-${user.id}`,
          ),
        ),
        Markup.button.callback(
          'Следущая страница ➡',
          `${AdminCallbacks.GetUsersList}&page-${page + 1}`,
        ),
      ],
      { columns: 1 },
    );
  } else {
    return Markup.inlineKeyboard(
      [
        ...users.map((user) =>
          Markup.button.callback(
            `👨‍💼 ${user.name}`,
            `${AdminCallbacks.GetUser}&id-${user.id}`,
          ),
        ),
        Markup.button.callback(
          '⬅ Предыдущая страница',
          `${AdminCallbacks.GetUsersList}&page-${page - 1 || 1}`,
        ),
        Markup.button.callback(
          'Следущая страница ➡',
          `${AdminCallbacks.GetUsersList}&page-${page + 1}`,
        ),
      ],
      { columns: 1 },
    );
  }
}

export const banControlButtons = (id: number) => {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback(
        'Разбанить пользователя',
        `${AdminCallbacks.UnbanUser}&id-${id}`,
      ),
    ],
    { columns: 1 },
  );
}