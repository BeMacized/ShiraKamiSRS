import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { UserRepositoryService } from '../repositories/user-repository.service';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private _user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    public user: Observable<User> = this._user.asObservable();

    constructor(private userRepository: UserRepositoryService) {}

    public async refreshUser() {
        const user = await this.userRepository.getMe().toPromise();
        this._user.next(user);
    }

    public async clearUser() {
        this._user.next(null);
    }
}
