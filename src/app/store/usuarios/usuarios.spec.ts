import { describe, it, expect, beforeEach } from 'vitest';
import { UsuariosActions } from './usuarios.actions';
import { usuariosReducer, initialState, UsuariosState } from './usuarios.reducer';
import {
  selectTodosUsuarios,
  selectCarregando,
  selectErro,
  selectFiltro,
  selectUsuariosFiltrados,
  selectTotalUsuarios,
  selectTemResultados,
} from './usuarios.selectors';
import { Usuario } from '../../models/usuario.model';

const mockUsuario: Usuario = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@email.com',
  cpf: '111.444.777-35',
  telefone: '11999990001',
  tipoTelefone: 'celular',
  criadoEm: new Date(),
};

const mockUsuario2: Usuario = {
  id: 2,
  nome: 'Maria Souza',
  email: 'maria@email.com',
  cpf: '529.982.247-25',
  telefone: '11999990002',
  tipoTelefone: 'celular',
  criadoEm: new Date(),
};

describe('NgRx — Usuarios (Seção 3.2)', () => {

  describe('Reducer', () => {
    it('deve retornar o estado inicial', () => {
      const state = usuariosReducer(undefined, { type: '@@INIT' } as never);
      expect(state).toEqual(initialState);
    });

    it('loadUsuarios → carregando: true, erro: null', () => {
      const state = usuariosReducer(initialState, UsuariosActions.loadUsuarios());
      expect(state.carregando).toBe(true);
      expect(state.erro).toBeNull();
    });

    it('loadUsuariosSuccess → popula usuarios, carregando: false', () => {
      const state = usuariosReducer(
        { ...initialState, carregando: true },
        UsuariosActions.loadUsuariosSuccess({ usuarios: [mockUsuario] })
      );
      expect(state.carregando).toBe(false);
      expect(state.usuarios).toHaveLength(1);
      expect(state.usuarios[0].nome).toBe('João Silva');
    });

    it('loadUsuariosFailure → erro preenchido, carregando: false', () => {
      const state = usuariosReducer(
        { ...initialState, carregando: true },
        UsuariosActions.loadUsuariosFailure({ erro: 'Timeout' })
      );
      expect(state.carregando).toBe(false);
      expect(state.erro).toBe('Timeout');
    });

    it('createUsuarioSuccess → adiciona ao array', () => {
      const prevState: UsuariosState = { ...initialState, usuarios: [mockUsuario] };
      const state = usuariosReducer(
        prevState,
        UsuariosActions.createUsuarioSuccess({ usuario: mockUsuario2 })
      );
      expect(state.usuarios).toHaveLength(2);
    });

    it('updateUsuarioSuccess → substitui usuário no array', () => {
      const prevState: UsuariosState = { ...initialState, usuarios: [mockUsuario] };
      const atualizado = { ...mockUsuario, nome: 'João Atualizado' };
      const state = usuariosReducer(
        prevState,
        UsuariosActions.updateUsuarioSuccess({ usuario: atualizado })
      );
      expect(state.usuarios[0].nome).toBe('João Atualizado');
      expect(state.usuarios).toHaveLength(1);
    });

    it('deleteUsuarioSuccess → remove do array', () => {
      const prevState: UsuariosState = { ...initialState, usuarios: [mockUsuario, mockUsuario2] };
      const state = usuariosReducer(
        prevState,
        UsuariosActions.deleteUsuarioSuccess({ id: 1 })
      );
      expect(state.usuarios).toHaveLength(1);
      expect(state.usuarios[0].id).toBe(2);
    });

    it('setFiltro → atualiza filtro', () => {
      const state = usuariosReducer(initialState, UsuariosActions.setFiltro({ filtro: 'João' }));
      expect(state.filtro).toBe('João');
    });
  });

  describe('Selectors', () => {
    const stateComUsuarios: UsuariosState = {
      ...initialState,
      usuarios: [mockUsuario, mockUsuario2],
      filtro: '',
    };

    const featureState = { usuarios: stateComUsuarios };

    it('selectTodosUsuarios deve retornar todos', () => {
      expect(selectTodosUsuarios(featureState)).toHaveLength(2);
    });

    it('selectCarregando deve retornar false', () => {
      expect(selectCarregando(featureState)).toBe(false);
    });

    it('selectErro deve retornar null', () => {
      expect(selectErro(featureState)).toBeNull();
    });

    it('selectFiltro deve retornar string vazia', () => {
      expect(selectFiltro(featureState)).toBe('');
    });

    it('selectTotalUsuarios deve retornar 2', () => {
      expect(selectTotalUsuarios(featureState)).toBe(2);
    });

    it('selectTemResultados deve retornar true', () => {
      expect(selectTemResultados(featureState)).toBe(true);
    });

    it('selectUsuariosFiltrados deve filtrar por nome', () => {
      const stateComFiltro = { usuarios: { ...stateComUsuarios, filtro: 'joão' } };
      const resultado = selectUsuariosFiltrados(stateComFiltro);
      expect(resultado).toHaveLength(1);
      expect(resultado[0].nome).toBe('João Silva');
    });

    it('selectUsuariosFiltrados sem filtro retorna todos', () => {
      const resultado = selectUsuariosFiltrados(featureState);
      expect(resultado).toHaveLength(2);
    });
  });

  describe('Actions — createActionGroup', () => {
    it('deve ter o tipo correto para loadUsuarios', () => {
      const action = UsuariosActions.loadUsuarios();
      expect(action.type).toBe('[Usuarios] Load Usuarios');
    });

    it('deve ter o tipo correto para loadUsuariosSuccess', () => {
      const action = UsuariosActions.loadUsuariosSuccess({ usuarios: [] });
      expect(action.type).toBe('[Usuarios] Load Usuarios Success');
    });

    it('deve ter o tipo correto para setFiltro', () => {
      const action = UsuariosActions.setFiltro({ filtro: 'teste' });
      expect(action.type).toBe('[Usuarios] Set Filtro');
    });
  });
});
