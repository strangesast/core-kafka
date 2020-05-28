import { props, createAction } from '@ngrx/store';

import { User } from './models';


export const login = createAction('[User] Login', props<{user: User, token: string}>());
export const logout = createAction('[User] Logout');
