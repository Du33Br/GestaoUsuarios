/**
 * SEÇÃO 3.2 — NgRx: Selectors
 *
 * `createFeatureSelector` + `createSelector` para derivar dados do estado
 * de forma memoizada (só recalcula quando os inputs mudam).
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsuariosState } from './usuarios.reducer';

// ─── Feature selector ────────────────────────────────────────────────────────

export const selectUsuariosFeature =
  createFeatureSelector<UsuariosState>('usuarios');

// ─── Selectors atômicos ──────────────────────────────────────────────────────

export const selectTodosUsuarios = createSelector(
  selectUsuariosFeature,
  state => state.usuarios
);

export const selectCarregando = createSelector(
  selectUsuariosFeature,
  state => state.carregando
);

export const selectErro = createSelector(
  selectUsuariosFeature,
  state => state.erro
);

export const selectFiltro = createSelector(
  selectUsuariosFeature,
  state => state.filtro
);

export const selectUsuarioSelecionado = createSelector(
  selectUsuariosFeature,
  state => state.usuarioSelecionado
);

// ─── Selectors derivados (compostos + memoizados) ───────────────────────────

/**
 * Filtra usuários pelo filtro atual — recalcula SOMENTE quando
 * `selectTodosUsuarios` ou `selectFiltro` mudam.
 */
export const selectUsuariosFiltrados = createSelector(
  selectTodosUsuarios,
  selectFiltro,
  (usuarios, filtro) => {
    if (!filtro.trim()) return usuarios;
    const termo = filtro.toLowerCase();
    return usuarios.filter(
      u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
  }
);

export const selectTotalUsuarios = createSelector(
  selectTodosUsuarios,
  usuarios => usuarios.length
);

export const selectTemResultados = createSelector(
  selectUsuariosFiltrados,
  filtrados => filtrados.length > 0
);

export const selectModoEdicao = createSelector(
  selectUsuarioSelecionado,
  selecionado => selecionado !== null
);
