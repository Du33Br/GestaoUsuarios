import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UserListComponent } from './user-list.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockUsers: User[] = [
    { id: 1, nome: 'Alice', email: 'alice@exemplo.com', perfil: 'admin' },
    { id: 2, nome: 'Bruno', email: 'bruno@exemplo.com', perfil: 'usuario' },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getUsers', 'deleteUser']);
    spy.getUsers.and.returnValue([...mockUsers]);
    spy.deleteUser.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [UserListComponent, RouterTestingModule],
      providers: [{ provide: UserService, useValue: spy }]
    })
    .compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(2);
  });

  it('should render user rows', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should display user names in the table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alice');
    expect(compiled.textContent).toContain('Bruno');
  });

  it('should call deleteUser and reload on delete', () => {
    userServiceSpy.getUsers.and.returnValue([mockUsers[1]]);
    component.deleteUser(1);
    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(1);
    expect(component.users.length).toBe(1);
  });

  it('should show empty message when no users', () => {
    userServiceSpy.getUsers.and.returnValue([]);
    component.loadUsers();
    fixture.detectChanges();
    const msg = fixture.nativeElement.querySelector('p');
    expect(msg?.textContent).toContain('Nenhum usuário encontrado');
  });
});
