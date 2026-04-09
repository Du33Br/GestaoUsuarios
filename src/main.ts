import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AppComponent } from './app/app.component';
import { usuariosReducer } from './app/store/usuarios/usuarios.reducer';
import { UsuariosEffects } from './app/store/usuarios/usuarios.effects';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideStore({ usuarios: usuariosReducer }),
    provideEffects([UsuariosEffects]),
  ]
}).catch(err => console.error(err));
