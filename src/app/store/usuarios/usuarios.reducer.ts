/**
 * SEÇÃO 3.2 — NgRx: State & Reducer
 *
 * `createReducer` + `on()` para manipulação imutável de estado.
 * O estado é sempre substituído (nunca mutado), garantindo previsibilidade.
 */

import { createReducer, on } from '@ngrx/store';
import { Usuario } from '../../models/usuario.model';
import { UsuariosActions } from './usuarios.actions';

// ─── Shape do estado ─────────────────────────────────────────────────────────

export interface UsuariosState {
  usuarios: Usuario[];
  carregando: boolean;
  erro: string | null;
  filtro: string;
  usuarioSelecionado: Usuario | null;
}

export const initialState: UsuariosState = {
  usuarios: [],
  carregando: false,
  erro: null,
  filtro: '',
  usuarioSelecionado: null,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

export const usuariosReducer = createReducer(
  initialState,

  // ── Load ────────────────────────────────────────────────────────────────────
  on(UsuariosActions.loadUsuarios, state => ({
    ...state,
    carregando: true,
    erro: null,
  })),

  on(UsuariosActions.loadUsuariosSuccess, (state, { usuarios }) => ({
    ...state,
    carregando: false,
    usuarios,
  })),

  on(UsuariosActions.loadUsuariosFailure, (state, { erro }) => ({
    ...state,
    carregando: false,
    erro,
  })),

  // ── Create ──────────────────────────────────────────────────────────────────
  on(UsuariosActions.createUsuario, state => ({
    ...state,
    carregando: true,
    erro: null,
  })),

  on(UsuariosActions.createUsuarioSuccess, (state, { usuario }) => ({
    ...state,
    carregando: false,
    usuarios: [...state.usuarios, usuario],
  })),

  on(UsuariosActions.createUsuarioFailure, (state, { erro }) => ({
    ...state,
    carregando: false,
    erro,
  })),

  // ── Update ──────────────────────────────────────────────────────────────────
  on(UsuariosActions.updateUsuario, state => ({
    ...state,
    carregando: true,
    erro: null,
  })),

  on(UsuariosActions.updateUsuarioSuccess, (state, { usuario }) => ({
    ...state,
    carregando: false,
    usuarios: state.usuarios.map(u => u.id === usuario.id ? usuario : u),
    usuarioSelecionado: null,
  })),

  on(UsuariosActions.updateUsuarioFailure, (state, { erro }) => ({
    ...state,
    carregando: false,
    erro,
  })),

  // ── Delete ──────────────────────────────────────────────────────────────────
  on(UsuariosActions.deleteUsuario, state => ({
    ...state,
    carregando: true,
    erro: null,
  })),

  on(UsuariosActions.deleteUsuarioSuccess, (state, { id }) => ({
    ...state,
    carregando: false,
    usuarios: state.usuarios.filter(u => u.id !== id),
  })),

  on(UsuariosActions.deleteUsuarioFailure, (state, { erro }) => ({
    ...state,
    carregando: false,
    erro,
  })),

  // ── UI ──────────────────────────────────────────────────────────────────────
  on(UsuariosActions.selectUsuario, (state, { usuario }) => ({
    ...state,
    usuarioSelecionado: usuario,
  })),

  on(UsuariosActions.clearSelection, state => ({
    ...state,
    usuarioSelecionado: null,
  })),

  on(UsuariosActions.setFiltro, (state, { filtro }) => ({
    ...state,
    filtro,
  })),

  on(UsuariosActions.clearErro, state => ({
    ...state,
    erro: null,
  }))
);
