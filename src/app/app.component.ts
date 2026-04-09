import { Component } from '@angular/core';
import { UsuariosListComponent } from './features/users/usuarios-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UsuariosListComponent],
  template: `<app-usuarios-list></app-usuarios-list>`,
  styles: []
})
export class AppComponent {
  title = 'Users Management';
}
