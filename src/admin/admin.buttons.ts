import { AdminCallbacks } from 'enums/callbacks.enum';
import { User } from 'src/user/user.entity';
import { Markup } from 'telegraf';

// export const joinRequestsButtons = (users: User[], page: number) => {
//   const usersButtons = users.map((user) =>
//     Markup.button.callback(
//       `👨‍💼 ${user.name}`,
//       `${AdminCallbacks.GetOneJoinRequest}&id-${user.id}`,
//     ),
//   )
//   const paginationButtons = []
//   if (page > 1) {
//     paginationButtons.push(Markup.button.callback(
//       '⬅ Предыдущая страница',
//       `${AdminCallbacks.GetJoinRequests}&page-${page - 1 || 1}`,
//     ))
//   }
//   if (users.length === 10) {
//     paginationButtons.push(Markup.button.callback(
//       'Следущая страница ➡',
//       `${AdminCallbacks.GetJoinRequests}&page-${page + 1}`,
//     ))
//   }

//   return Markup.inlineKeyboard([...usersButtons, ...paginationButtons])
// }

// export const controlModeratorsButtons = () => {
//   return Markup.inlineKeyboard([
//     Markup.button.callback('Cписок модераторов', `${AdminCallbacks.GetModeratorsList}&page-1`),
//     Markup.button.callback('Найти модератора', AdminCallbacks.FindModerator),
//   ], { columns: 1 })
// };

// export const moderatorsListButtons = (users: User[], page: number, name?: string) => {
//   const usersButtons = users.map((user) =>
//     Markup.button.callback(
//       `👨‍💼 ${user.name}`,
//       `${AdminCallbacks.GetModerator}&id-${user.id}`,
//     ),
//   )

//   const paginationButtons = []
//   if (page > 1) {
//     paginationButtons.push(Markup.button.callback(
//       '⬅ Предыдущая страница',
//       `${AdminCallbacks.GetModeratorsList}&page-${page - 1 || 1}${name ? `&name-${name}` : ''}`,
//     ))
//   }
//   if (users.length === 10) {
//     paginationButtons.push(Markup.button.callback(
//       'Следущая страница ➡',
//       `${AdminCallbacks.GetModeratorsList}&page-${page + 1}${name ? `&name-${name}` : ''}`,
//     )
//     );
//   }

//   return Markup.inlineKeyboard([...usersButtons, ...paginationButtons])
// }

// export const bansListButtons = (users: User[], page: number) => {
//   const usersButtons = users.map((user) =>
//     Markup.button.callback(
//       `👨‍💼 ${user.name}`,
//       `${AdminCallbacks.GetBannedUser}&id-${user.id}`,
//     ),
//   )

//   const paginationButtons = [];
//   if (page > 1) {
//     paginationButtons.push(Markup.button.callback(
//       '⬅ Предыдущая страница',
//       `${AdminCallbacks.GetBansList}&page-${page - 1 || 1}`,
//     ))
//   }
//   if (users.length === 10) {
//     paginationButtons.push(Markup.button.callback(
//       'Следущая страница ➡',
//       `${AdminCallbacks.GetBansList}&page-${page + 1}`,
//     ))
//   }

//   return Markup.inlineKeyboard([...usersButtons, ...paginationButtons])
// }

// export const controlUsersButtons = () => {
//   return Markup.inlineKeyboard([
//     Markup.button.callback('Cписок пользователей', `${AdminCallbacks.GetUsersList}&page-1`),
//     Markup.button.callback('Найти пользователей', AdminCallbacks.FindUser),
//   ], { columns: 1 })
// }

// export const searchUsersListButtons = (users: User[], page: number, callback: string) => {
//   const usersButtons = users.map((user) =>
//     Markup.button.callback(
//       `👨‍💼 ${user.name}`,
//       `${AdminCallbacks.GetUser}&id-${user.id}`,
//     ))

//   const paginationButtons = [];
//   if (page > 1) {
//     paginationButtons.push(Markup.button.callback(
//       '⬅ Предыдущая страница',
//       `${AdminCallbacks.ChangeUserSearchPage}&page-${page - 1 || 1}&${callback}`,
//     ))
//   }
//   if (users.length === 10) {
//     paginationButtons.push(Markup.button.callback(
//       'Следущая страница ➡',
//       `${AdminCallbacks.ChangeUserSearchPage}&page-${page + 1}&${callback}`,
//     ))
//   }

//   return Markup.inlineKeyboard([...usersButtons, ...paginationButtons], {columns: 1});
// }

// export const banControlButtons = (id: number) => {
//   return Markup.inlineKeyboard(
//     [
//       Markup.button.callback(
//         'Разбанить пользователя',
//         `${AdminCallbacks.UnbanUser}&id-${id}`,
//       ),
//     ],
//     { columns: 1 },
//   );
// }

// export const userControlButtons = (id: number) => {
//   return Markup.inlineKeyboard(
//     [
//       Markup.button.callback(
//         'Список клиентов пользователя',
//         `${AdminCallbacks.GetUserClients}&id-${id}`,
//       ),
//       Markup.button.callback(
//         'Сделать пользователя модератором',
//         `${AdminCallbacks.UpgradeToModerator}&id-${id}`,
//       ),
//       Markup.button.callback(
//         'Забанить пользователя',
//         `${AdminCallbacks.BanUser}&id-${id}`,
//       )
//     ], { columns: 1 }
//   )
// }

// export const moderatorControlButtons = (id: number) => {
//   return Markup.inlineKeyboard(
//     [
//       Markup.button.callback(
//         'Список клиентов модератора',
//         `${AdminCallbacks.GetUserClients}&id-${id}`,
//       ),
//       Markup.button.callback(
//         'Сделать модератора обычным пользователем',
//         `${AdminCallbacks.DegradeToUser}&id-${id}`,
//       ),
//       Markup.button.callback(
//         'Забанить пользователя',
//         `${AdminCallbacks.BanUser}&id-${id}`,
//       )
//     ], { columns: 1 }
//   )
// }