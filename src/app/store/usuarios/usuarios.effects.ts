/**
 * SEÇÃO 3.2 — NgRx: Effects
 *
 * Effects interceptam actions e executam side effects (chamadas HTTP, etc.)
 * Usa `inject()` em vez de constructor injection (sintaxe moderna Angular 14+).
 *
 * Padrão: Action de trigger → side effect → Action de resultado (success/failure)
 */

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { UsuariosActions } from './usuarios.actions';

@Injectable()
export class UsuariosEffects {
  // inject() em vez de constructor — sintaxe moderna e mais legível
  private readonly actions$ = inject(Actions);
  private readonly usuarioService = inject(UsuarioService);

  // ── Carregar usuários ──────────────────────────────────────────────────────
  loadUsuarios$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsuariosActions.loadUsuarios),
      switchMap(() =>
        this.usuarioService.buscarTodos().pipe(
          map(usuarios => UsuariosActions.loadUsuariosSuccess({ usuarios })),
          catchError(err =>
            of(UsuariosActions.loadUsuariosFailure({ erro: err.message ?? 'Erro ao carregar' }))
          )
        )
      )
    )
  );

  // ── Criar usuário ──────────────────────────────────────────────────────────
  createUsuario$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsuariosActions.createUsuario),
      switchMap(({ form }) =>
        this.usuarioService.criar(form).pipe(
          map(usuario => UsuariosActions.createUsuarioSuccess({ usuario })),
          catchError(err =>
            of(UsuariosActions.createUsuarioFailure({ erro: err.message ?? 'Erro ao criar' }))
          )
        )
      )
    )
  );

  // ── Atualizar usuário ──────────────────────────────────────────────────────
  updateUsuario$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsuariosActions.updateUsuario),
      switchMap(({ id, form }) =>
        this.usuarioService.atualizar(id, form).pipe(
          map(usuario => UsuariosActions.updateUsuarioSuccess({ usuario })),
          catchError(err =>
            of(UsuariosActions.updateUsuarioFailure({ erro: err.message ?? 'Erro ao atualizar' }))
          )
        )
      )
    )
  );

  // ── Deletar usuário ────────────────────────────────────────────────────────
  deleteUsuario$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsuariosActions.deleteUsuario),
      switchMap(({ id }) =>
        this.usuarioService.deletar(id).pipe(
          map(() => UsuariosActions.deleteUsuarioSuccess({ id })),
          catchError(err =>
            of(UsuariosActions.deleteUsuarioFailure({ erro: err.message ?? 'Erro ao deletar' }))
          )
        )
      )
    )
  );
}
