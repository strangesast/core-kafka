import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

interface UserLoginPayload {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user$ = new BehaviorSubject(null);

  constructor(public http: HttpClient) {}

  login(payload: UserLoginPayload) {
    return this.http.post('/api/login', payload);
  }
}
