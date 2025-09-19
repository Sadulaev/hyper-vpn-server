export enum CommonCallbacks {
  // Default actions
  GetMenu = 'common_get_menu',
  GetMenuNoDelete = 'common_get_menu_no_delete',
  
  // Buy VPN actions
  GetVPNSubscriptions = 'common_get-vpn-subscriptions',
  GetOneMonthKey = 'common_get-one-month-key',
  GetThreeMonthKey = 'common_get-three-month-key',
  GetSixMonthKey = 'common_get-six-month-key',
  GetTwelweMonthKey = 'common_get-twelwe-month-key',

  // Instructions actions
  GetInstructions = 'common_get-instructions',
  GetInstructionsNoDelete = 'common_get-instructions-no-delete',
  GetAndroidInstructions = 'common_get-android-instructions',
  GetIphoneInstructions = 'common_get-iphone-instructions',
  GetPCInstructions = 'common_get-pc-instructions',
  GetTVInstructions = 'common_get-tv-instructions',

  // Others (for now)
  GetMyKeys = 'common_get-my-keys',
}
