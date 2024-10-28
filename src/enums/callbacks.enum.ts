export enum AdminCallbacks {
  UnbanUser = 'admin_unban-user',
  GetBansList = 'admin_get-bans',
  GetBannedUser = 'admin_get_banned-user',
  GetModerator = 'admin_get-moderator',
  GetUser = 'admin_get-user',
  FindUser = 'admin_find-user',
  GetUsersList = 'admin_users-list',
  FindModerator = 'admin_find-moderator',
  GetModeratorsList = 'admin_moderators-list',
  ControlModerators = 'admin_control-moderators',
  ControlUsers = 'admin_control-users',
  GetRecords = 'admin_get-records',
  GetJoinRequests = 'admin_get-join-requests',
  GetOneJoinRequest = 'admin_get-one-join-request',
  AcceptJoinRequest = 'admin_accept-join-request',
  DeclineJoinRequest = 'admin_decline-join-request',
  DeclineAndBanJoinRequest = 'admin_decline-and-ban-join-request',
}

export enum ModeratorCallbacks {
  ControlUsers = 'moderator_control-users',
  GetJoinRequests = 'moderator_get-join-requests',
  GetRecords = 'admin_get-records',
}

export enum UserCallbacks {
  FindClients = 'user_find-clients',
  ControlClients = 'user_control-clients',
}

export enum DefaultCallbacks {
  SendJoinRequest = 'default_send-join-request',
}
