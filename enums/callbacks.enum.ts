export enum AdminCallbacks {
  // Join request feature
  GetJoinRequests = 'admin_get-join-requests',
  GetOneJoinRequest = 'admin_get-one-join-request',
  AcceptJoinRequest = 'admin_accept-join-request',
  DeclineJoinRequest = 'admin_decline-join-request',
  DeclineAndBanJoinRequest = 'admin_decline-and-ban-join-request',

  // Moderators feature
  UpgradeToModerator = 'admin_upgrade-to-moderator',
  GetModerator = 'admin_get-moderator',
  FindModerator = 'admin_find-moderator',
  GetModeratorsList = 'admin_moderators-list',
  ControlModerators = 'admin_control-moderators',
  DegradeToUser = 'admin_degrade-to-user',

  // Users feature
  GetUserClients = 'admin_get-user-clients',
  BanUser = 'admin_ban-user',
  UnbanUser = 'admin_unban-user',
  GetBansList = 'admin_get-bans',
  GetBannedUser = 'admin_get_banned-user',
  GetUser = 'admin_get-user',
  FindUser = 'admin_find-user',
  ChangeUserSearchPage = 'admin_change-user-search-page',
  GetUsersList = 'admin_users-list',
  ControlUsers = 'admin_control-users',

  // Clients feature
  GetRecords = 'admin_get-records',
}

export enum ModeratorCallbacks {
  // Join request feature
  GetJoinRequests = 'moderator_get-join-requests',
  GetOneJoinRequest = 'moderator_get-one-join-request',
  AcceptJoinRequest = 'moderator_accept-join-request',
  DeclineJoinRequest = 'moderator_decline-join-request',
  DeclineAndBanJoinRequest = 'moderator_decline-and-ban-join-request',

  // Users feature
  GetUserClients = 'moderator_get-user-clients',
  BanUser = 'moderator_ban-user',
  UnbanUser = 'moderator_unban-user',
  GetBansList = 'moderator_get-bans',
  GetBannedUser = 'moderator_get_banned-user',
  GetUser = 'moderator_get-user',
  FindUser = 'moderator_find-user',
  GetUsersList = 'moderator_users-list',
  ControlUsers = 'moderator_control-users',

  // Clients feature
  GetRecords = 'moderator_get-records',
}


export enum UserCallbacks {}

export enum CommonCallbacks {
  FindClients = 'find-clients',
  ChangeSearchClientPage = 'change-search-client-page',
  GetClient = 'get-client',
  GetMyClients = 'get-my-clients',
  CreateClient = 'create-client',
}

export enum DefaultCallbacks {
  SendJoinRequest = 'default_send-join-request',
}
