export enum MenuState {
  MAIN = 'main',
  WALLET = 'wallet',
  SETTINGS = 'settings',
}

export interface UserSession {
  menuState: MenuState;
  lastMessageId?: number;
  confirmAction?: string;
}

export interface WalletInfo {
  address: string;
  balance: number;
  description?: string;
}
