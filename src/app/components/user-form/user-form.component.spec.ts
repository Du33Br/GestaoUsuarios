import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { UserFormComponent } from './user-form.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockUser: User = { id: 1, nome: 'Alice', email: 'alice@exemplo.com', perfil: 'admin' };

  function createComponent(paramId?: string) {
    const spy = jasmine.createSpyObj('UserService', ['getUserById', 'createUser', 'updateUser']);
    spy.getUserById.and.returnValue(paramId ? mockUser : undefined);
    spy.createUser.and.returnValue({ ...mockUser, id: 99 });
    spy.updateUser.and.returnValue(mockUser);

    return TestBed.configureTestingModule({
      imports: [UserFormComponent, RouterTestingModule],
      providers: [
        { provide: UserService, useValue: spy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(paramId ? { id: paramId } : {}) }
          }
        }
      ]
    }).compileComponents().then(() => {
      userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
      fixture = TestBed.createComponent(UserFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }

  describe('create mode', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty fields', () => {
      expect(component.form.get('nome')?.value).toBe('');
      expect(component.form.get('email')?.value).toBe('');
      expect(component.form.get('perfil')?.value).toBe('usuario');
    });

    it('should be invalid when fields are empty', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('should be valid with correct data', () => {
      component.form.patchValue({ nome: 'Carlos', email: 'carlos@exemplo.com', perfil: 'usuario' });
      expect(component.form.valid).toBeTrue();
    });

    it('should call createUser on submit in create mode', () => {
      component.form.patchValue({ nome: 'Carlos', email: 'carlos@exemplo.com', perfil: 'usuario' });
      component.submit();
      expect(userServiceSpy.createUser).toHaveBeenCalled();
    });

    it('should not submit invalid form', () => {
      component.submit();
      expect(userServiceSpy.createUser).not.toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      await createComponent('1');
    });

    it('should be in edit mode', () => {
      expect(component.isEditMode).toBeTrue();
    });

    it('should pre-populate form with user data', () => {
      expect(component.form.get('nome')?.value).toBe('Alice');
      expect(component.form.get('email')?.value).toBe('alice@exemplo.com');
    });

    it('should call updateUser on submit in edit mode', () => {
      component.submit();
      expect(userServiceSpy.updateUser).toHaveBeenCalledWith(1, jasmine.any(Object));
    });
  });
});
