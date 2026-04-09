import { Injectable, signal, computed, effect } from '@angular/core';
import { Usuario } from '../models/usuario.model';

/**
 * Store de Usuários com Signals (Angular 17+)
 * Gerencia estado reativo sem RxJS boilerplate
 */
@Injectable({
  providedIn: 'root'
})
export class UsuariosStore {
  // ============================================
  // STATE: Signals
  // ============================================

  /**
   * Lista de usuários
   */
  readonly usuarios = signal<Usuario[]>([]);

  /**
   * Estado de loading
   */
  readonly carregando = signal(false);

  /**
   * Mensagem de erro
   */
  readonly erro = signal<string | null>(null);

  /**
   * Filtro de busca
   */
  readonly filtro = signal('');

  /**
   * Usuário selecionado para edição
   */
  readonly usuarioSelecionado = signal<Usuario | null>(null);

  /**
   * Modal aberto/fechado
   */
  readonly modalAberto = signal(false);

  // ============================================
  // COMPUTED: Valores derivados
  // ============================================

  /**
   * Usuários filtrados por nome
   * Atualiza automaticamente quando usuarios ou filtro mudam
   */
  readonly usuariosFiltrados = computed(() => {
    const todos = this.usuarios();
    const filtroTermo = this.filtro().toLowerCase();

    if (!filtroTermo) {
      return todos;
    }

    return todos.filter(u =>
      u.nome.toLowerCase().includes(filtroTermo) ||
      u.email.toLowerCase().includes(filtroTermo)
    );
  });

  /**
   * Quantidade de usuários
   */
  readonly totalUsuarios = computed(() => this.usuarios().length);

  /**
   * Quantidade após filtro
   */
  readonly totalFiltrados = computed(() => this.usuariosFiltrados().length);

  /**
   * Indica se deve mostrar mensagem de sem resultados
   */
  readonly temResultados = computed(() => this.totalFiltrados() > 0);

  /**
   * Modal está em modo edição?
   */
  readonly modoEdicao = computed(() => this.usuarioSelecionado() !== null);

  constructor() {}

  // ============================================
  // AÇÕES
  // ============================================

  /**
   * Define lista de usuários
   */
  setUsuarios(usuarios: Usuario[]): void {
    this.usuarios.set(usuarios);
  }

  /**
   * Adiciona novo usuário à lista
   */
  adicionarUsuario(usuario: Usuario): void {
    this.usuarios.update(usuarios => [...usuarios, usuario]);
  }

  /**
   * Atualiza usuário na lista
   */
  atualizarUsuario(usuario: Usuario): void {
    this.usuarios.update(usuarios =>
      usuarios.map(u => (u.id === usuario.id ? usuario : u))
    );
  }

  /**
   * Remove usuário da lista
   */
  removerUsuario(id: number): void {
    this.usuarios.update(usuarios =>
      usuarios.filter(u => u.id !== id)
    );
  }

  /**
   * Define estado de loading
   */
  setCarregando(carregando: boolean): void {
    this.carregando.set(carregando);
  }

  /**
   * Define erro
   */
  setErro(erro: string | null): void {
    this.erro.set(erro);
    if (erro) console.warn(`[UsuariosStore] Erro: ${erro}`);
  }

  /**
   * Limpa erro
   */
  limparErro(): void {
    this.erro.set(null);
  }

  /**
   * Define filtro de busca
   */
  setFiltro(filtro: string): void {
    this.filtro.set(filtro);
  }

  /**
   * Limpa filtro
   */
  limparFiltro(): void {
    this.filtro.set('');
  }

  /**
   * Abre modal para novo usuário
   */
  abrirModalNovo(): void {
    this.usuarioSelecionado.set(null);
    this.modalAberto.set(true);
  }

  /**
   * Abre modal para editar usuário
   */
  abrirModalEdicao(usuario: Usuario): void {
    this.usuarioSelecionado.set(usuario);
    this.modalAberto.set(true);
  }

  /**
   * Fecha modal
   */
  fecharModal(): void {
    this.modalAberto.set(false);
    this.usuarioSelecionado.set(null);
  }

  /**
   * Reseta estado
   */
  reset(): void {
    this.usuarios.set([]);
    this.carregando.set(false);
    this.erro.set(null);
    this.filtro.set('');
    this.usuarioSelecionado.set(null);
    this.modalAberto.set(false);
  }
}
