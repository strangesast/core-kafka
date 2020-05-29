export interface User {
  id?: number;
  username: string;
  email: string;
  roles: string[];
}

export interface Notification {
  id: string;
  message: string;
}
