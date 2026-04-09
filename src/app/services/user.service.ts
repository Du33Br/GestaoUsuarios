import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    { id: 1, nome: 'Alice Silva', email: 'alice@exemplo.com', perfil: 'admin' },
    { id: 2, nome: 'Bruno Costa', email: 'bruno@exemplo.com', perfil: 'usuario' },
  ];
  private nextId = 3;

  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(user: Omit<User, 'id'>): User {
    const newUser: User = { ...user, id: this.nextId++ };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: number, changes: Partial<Omit<User, 'id'>>): User | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...changes };
    return this.users[index];
  }

  deleteUser(id: number): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}
