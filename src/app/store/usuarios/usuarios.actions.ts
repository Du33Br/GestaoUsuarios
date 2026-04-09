/**
 * SEÇÃO 3.2 — NgRx: Actions
 *
 * Usa `createActionGroup` (sintaxe moderna NgRx 14+) para agrupar actions
 * relacionadas à feature de Gestão de Usuários.
 *
 * Benefícios vs createAction individual:
 *  - Prefixo automático: "[Usuarios] Load Usuarios"
 *  - Menos boilerplate — todas as actions num só lugar
 *  - Tree-shakable e type-safe
 */

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Usuario, UsuarioForm } from '../../models/usuario.model';

export const UsuariosActions = createActionGroup({
  source: 'Usuarios',
  events: {
    // ── Carregar todos ───────────────────────────────────────────────────────
    'Load Usuarios':          emptyProps(),
    'Load Usuarios Success':  props<{ usuarios: Usuario[] }>(),
    'Load Usuarios Failure':  props<{ erro: string }>(),

    // ── Criar ────────────────────────────────────────────────────────────────
    'Create Usuario':         props<{ form: UsuarioForm }>(),
    'Create Usuario Success': props<{ usuario: Usuario }>(),
    'Create Usuario Failure': props<{ erro: string }>(),

    // ── Atualizar ────────────────────────────────────────────────────────────
    'Update Usuario':         props<{ id: number; form: UsuarioForm }>(),
    'Update Usuario Success': props<{ usuario: Usuario }>(),
    'Update Usuario Failure': props<{ erro: string }>(),

    // ── Deletar ──────────────────────────────────────────────────────────────
    'Delete Usuario':         props<{ id: number }>(),
    'Delete Usuario Success': props<{ id: number }>(),
    'Delete Usuario Failure': props<{ erro: string }>(),

    // ── UI ───────────────────────────────────────────────────────────────────
    'Select Usuario':         props<{ usuario: Usuario }>(),
    'Clear Selection':        emptyProps(),
    'Set Filtro':             props<{ filtro: string }>(),
    'Clear Erro':             emptyProps(),
  },
});
