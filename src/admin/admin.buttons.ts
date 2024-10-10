import { AdminCallbacks } from 'src/enums/callbacks.enum';
import { User } from 'src/user/user.entity';
import { Markup } from 'telegraf';

export const joinRequestsButtons = (users: User[], page: number) => {
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
};
