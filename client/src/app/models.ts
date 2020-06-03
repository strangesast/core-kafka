export interface State {
  user: {
    user: User;
  };
}

export interface User {
  color: string;
  email: string;
  id: number;
  user_roles?: {
    role: {
      id: string;
      description: string;
      name: string;
    }
  }[];
  username: string;
}


export interface UserLoginPayload {
  username: string;
  password: string;
}

export interface UserCreatePayload {
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  email: string;
  username: string;
  password: string;
}

export interface UserLoginResult {
  user: User;
  token: string;
}

export interface Notification {
  id: string;
  message: string;
}
