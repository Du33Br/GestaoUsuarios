import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { User } from '../models/user';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial users', () => {
    const users = service.getUsers();
    expect(users.length).toBe(2);
    expect(users[0].nome).toBe('Alice Silva');
  });

  it('should find a user by id', () => {
    const user = service.getUserById(1);
    expect(user).toBeDefined();
    expect(user?.nome).toBe('Alice Silva');
  });

  it('should return undefined for non-existent id', () => {
    expect(service.getUserById(999)).toBeUndefined();
  });

  it('should create a new user', () => {
    const newUser = service.createUser({ nome: 'Carlos', email: 'carlos@exemplo.com', perfil: 'usuario' });
    expect(newUser.id).toBeDefined();
    expect(service.getUsers().length).toBe(3);
    expect(newUser.nome).toBe('Carlos');
  });

  it('should update an existing user', () => {
    const updated = service.updateUser(1, { nome: 'Alice Atualizada' });
    expect(updated).toBeDefined();
    expect(updated?.nome).toBe('Alice Atualizada');
    expect(service.getUserById(1)?.nome).toBe('Alice Atualizada');
  });

  it('should return undefined when updating non-existent user', () => {
    expect(service.updateUser(999, { nome: 'X' })).toBeUndefined();
  });

  it('should delete an existing user', () => {
    const result = service.deleteUser(1);
    expect(result).toBeTrue();
    expect(service.getUsers().length).toBe(1);
    expect(service.getUserById(1)).toBeUndefined();
  });

  it('should return false when deleting non-existent user', () => {
    expect(service.deleteUser(999)).toBeFalse();
  });
});
