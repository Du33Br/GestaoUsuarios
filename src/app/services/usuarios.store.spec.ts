import { describe, it, expect, beforeEach } from 'vitest';
import { UsuariosStore } from './usuarios.store';
import { Usuario } from '../models/usuario.model';

describe('UsuariosStore', () => {
  let store: UsuariosStore;

  const usuarioMock: Usuario = {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    tipoTelefone: 'celular',
    criadoEm: new Date()
  };

  beforeEach(() => {
    store = new UsuariosStore();
  });

  describe('Signals', () => {
    it('deve iniciar com lista vazia', () => {
      expect(store.usuarios()).toEqual([]);
    });

    it('deve iniciar sem loading', () => {
      expect(store.carregando()).toBe(false);
    });

    it('deve iniciar sem erro', () => {
      expect(store.erro()).toBeNull();
    });

    it('deve iniciar com filtro vazio', () => {
      expect(store.filtro()).toBe('');
    });
  });

  describe('Operações de Usuários', () => {
    it('deve adicionar usuário', () => {
      store.adicionarUsuario(usuarioMock);
      expect(store.usuarios().length).toBe(1);
      expect(store.usuarios()[0].id).toBe(usuarioMock.id);
    });

    it('deve atualizar usuário', () => {
      store.setUsuarios([usuarioMock]);
      const usuarioAtualizado = { ...usuarioMock, nome: 'João Silva' };
      store.atualizarUsuario(usuarioAtualizado);
      
      expect(store.usuarios()[0].nome).toBe('João Silva');
      expect(store.usuarios().length).toBe(1);
    });

    it('deve remover usuário', () => {
      store.setUsuarios([usuarioMock]);
      store.removerUsuario(usuarioMock.id);
      
      expect(store.usuarios().length).toBe(0);
    });

    it('deve set múltiplos usuários', () => {
      const usuario2 = { ...usuarioMock, id: 2, nome: 'Maria' };
      store.setUsuarios([usuarioMock, usuario2]);
      
      expect(store.usuarios().length).toBe(2);
      expect(store.totalUsuarios()).toBe(2);
    });
  });

  describe('Computed Signals', () => {
    beforeEach(() => {
      const usuario2 = { ...usuarioMock, id: 2, nome: 'Maria Silva', email: 'maria@email.com' };
      const usuario3 = { ...usuarioMock, id: 3, nome: 'Pedro', email: 'pedro@email.com' };
      store.setUsuarios([usuarioMock, usuario2, usuario3]);
    });

    it('deve contar total de usuários', () => {
      expect(store.totalUsuarios()).toBe(3);
    });

    it('deve filtrar usuários por nome', () => {
      store.setFiltro('Silva');
      expect(store.usuariosFiltrados().length).toBe(2);
    });

    it('deve contar usuários após filtro', () => {
      store.setFiltro('Silva');
      expect(store.totalFiltrados()).toBe(2);
    });

    it('deve indicar se tem resultados', () => {
      expect(store.temResultados()).toBe(true);
      store.setFiltro('Inexistente');
      expect(store.temResultados()).toBe(false);
    });

    it('filtro deve ser case insensitive', () => {
      store.setFiltro('silva');
      expect(store.usuariosFiltrados().length).toBe(2);
      
      store.setFiltro('SILVA');
      expect(store.usuariosFiltrados().length).toBe(2);
    });

    it('deve filtrar por email também', () => {
      store.setFiltro('joao@email.com');
      expect(store.usuariosFiltrados().length).toBe(1);
    });

    it('deve retornar todos quando filtro vazio', () => {
      store.setFiltro('');
      expect(store.usuariosFiltrados().length).toBe(3);
    });
  });

  describe('Estado de Carregamento e Erro', () => {
    it('deve setar estado de carregamento', () => {
      store.setCarregando(true);
      expect(store.carregando()).toBe(true);
      
      store.setCarregando(false);
      expect(store.carregando()).toBe(false);
    });

    it('deve setar e limpar erro', () => {
      store.setErro('Erro teste');
      expect(store.erro()).toBe('Erro teste');
      
      store.limparErro();
      expect(store.erro()).toBeNull();
    });
  });

  describe('Operações de Modal e Seleção', () => {
    it('deve abrir modal para novo usuário', () => {
      expect(store.modalAberto()).toBe(false);
      store.abrirModalNovo();
      
      expect(store.modalAberto()).toBe(true);
      expect(store.usuarioSelecionado()).toBeNull();
      expect(store.modoEdicao()).toBe(false);
    });

    it('deve abrir modal para edição', () => {
      store.abrirModalEdicao(usuarioMock);
      
      expect(store.modalAberto()).toBe(true);
      expect(store.usuarioSelecionado()?.id).toBe(usuarioMock.id);
      expect(store.modoEdicao()).toBe(true);
    });

    it('deve fechar modal', () => {
      store.abrirModalNovo();
      store.fecharModal();
      
      expect(store.modalAberto()).toBe(false);
      expect(store.usuarioSelecionado()).toBeNull();
    });
  });

  describe('Filtro', () => {
    it('deve setar filtro', () => {
      store.setFiltro('teste');
      expect(store.filtro()).toBe('teste');
    });

    it('deve limpar filtro', () => {
      store.setFiltro('teste');
      store.limparFiltro();
      expect(store.filtro()).toBe('');
    });
  });

  describe('Reset', () => {
    it('deve resetar todo o estado', () => {
      store.setUsuarios([usuarioMock]);
      store.setCarregando(true);
      store.setErro('Erro');
      store.setFiltro('teste');
      store.abrirModalEdicao(usuarioMock);

      store.reset();

      expect(store.usuarios()).toEqual([]);
      expect(store.carregando()).toBe(false);
      expect(store.erro()).toBeNull();
      expect(store.filtro()).toBe('');
      expect(store.modalAberto()).toBe(false);
      expect(store.usuarioSelecionado()).toBeNull();
    });
  });

  describe('Integração de Computados', () => {
    it('deve atualizar computed quando estado muda', () => {
      store.setUsuarios([usuarioMock]);
      expect(store.totalUsuarios()).toBe(1);

      const usuario2 = { ...usuarioMock, id: 2 };
      store.adicionarUsuario(usuario2);
      expect(store.totalUsuarios()).toBe(2);
    });

    it('deve atualizar filtrados quando filtro muda', () => {
      const usuario1 = usuarioMock;
      const usuario2 = { ...usuarioMock, id: 2, nome: 'Teste' };
      store.setUsuarios([usuario1, usuario2]);

      expect(store.usuariosFiltrados().length).toBe(2);

      store.setFiltro('João');
      expect(store.usuariosFiltrados().length).toBe(1);

      store.setFiltro('Teste');
      expect(store.usuariosFiltrados().length).toBe(1);
    });
  });
});
