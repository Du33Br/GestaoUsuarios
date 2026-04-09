import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  Subject,
  switchMap
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioService } from '../../services/usuario.service';
import { UsuariosStore } from '../../services/usuarios.store';
import { Usuario } from '../../models/usuario.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuarioFormDialogComponent } from './usuario-form/usuario-form.component';

/**
 * Componente de Listagem de Usuários
 * 
 * Funcionalidades:
 * - Lista de usuários em cards
 * - Filtro por nome/email com debounce 300ms
 * - Estado de loading
 * - Mensagem de erro
 * - Botão para criar novo usuário
 * - Botão para editar usuário
 * - Modal de formulário
 * 
 * RxJS Operators: debounceTime, distinctUntilChanged, switchMap, takeUntil
 * Signals: filtro, estado de loading, erro
 * Change Detection: OnPush
 */
@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <!-- Header — background #4D4D4D conforme protótipo -->
      <div class="header">
        <h1>Gestão de Usuários</h1>
        <button mat-fab color="warn" (click)="abrirModalNovo()" class="fab-novo" aria-label="Novo usuário">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <!-- Filtro de Busca centralizado -->
      <div class="filtro-container">
        <mat-form-field class="filtro-input" appearance="outline">
          <mat-label>Buscar por nome ou e-mail</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            [(ngModel)]="filtroLocal"
            (ngModelChange)="atualizarFiltro($event)"
            placeholder="Digite para filtrar..."
          />
          @if (filtroLocal) {
            <button mat-icon-button matSuffix (click)="limparFiltro()" aria-label="Limpar filtro">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      <!-- Estado de Loading -->
      @if (carregando$()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Carregando usuários...</p>
        </div>
      }

      <!-- Mensagem de Erro -->
      @if (erro$()) {
        <div class="erro-container">
          <mat-icon>error</mat-icon>
          <p>{{ erro$() }}</p>
          <button mat-button (click)="recarregar()">
            <mat-icon>refresh</mat-icon>
            Tentar Novamente
          </button>
        </div>
      }

      <!-- Lista de Usuarios (em cards)
           @for com track: Angular 17 control flow.
           Superior ao *ngFor + trackBy porque:
           - Compilado de forma mais eficiente (sem diretiva, inline no compilador)
           - Com OnPush, somente os cards cujas referencias mudam sao re-renderizados
           - Em listas com centenas de itens, evita re-criacao de DOM para itens estaveis
           - O track usuario.id e obrigatorio na nova sintaxe, forcando boas praticas
      -->
      @if (!carregando$() && !erro$()) {
        <div class="usuarios-grid">
          @for (usuario of usuariosFiltrados$(); track usuario.id) {
            <mat-card class="usuario-card">

              <mat-card-header>
                <div mat-card-avatar class="avatar">{{ getIniciais(usuario.nome) }}</div>
                <mat-card-title>{{ usuario.nome }}</mat-card-title>
                <mat-card-subtitle>{{ usuario.email }}</mat-card-subtitle>
                <span class="tipo-badge tipo-{{ usuario.tipoTelefone }}">{{ usuario.tipoTelefone }}</span>
              </mat-card-header>

              <mat-divider></mat-divider>

              <mat-card-content>
                <div class="usuario-info">
                  <div class="info-item">
                    <mat-icon class="info-icon">badge</mat-icon>
                    <span class="label">CPF</span>
                    <span class="value">{{ usuario.cpf }}</span>
                  </div>
                  <div class="info-item">
                    <mat-icon class="info-icon">phone_iphone</mat-icon>
                    <span class="label">Telefone</span>
                    <span class="value">{{ usuario.telefone }}</span>
                  </div>
                  <div class="info-item">
                    <mat-icon class="info-icon">calendar_today</mat-icon>
                    <span class="label">Criado</span>
                    <span class="value">{{ usuario.criadoEm | date: 'dd/MM/yyyy' }}</span>
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions align="end">
                <button mat-stroked-button color="primary" (click)="abrirModalEdicao(usuario)">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
                <button mat-stroked-button color="warn" (click)="deletar(usuario.id)">
                  <mat-icon>delete_outline</mat-icon>
                  Deletar
                </button>
              </mat-card-actions>

            </mat-card>
          } @empty {
            <!-- @empty: bloco exibido quando a lista está vazia (nova sintaxe Angular 17) -->
            <div class="sem-resultados">
              <mat-icon>inbox</mat-icon>
              <p>{{ filtro$() ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado' }}</p>
            </div>
          }
        </div>
      }

      <!-- Resumo -->
      @if (!carregando$() && temResultados$()) {
        <div class="resumo">
          <p>
            Mostrando <strong>{{ usuariosFiltrados$().length }}</strong> de
            <strong>{{ totalUsuarios$() }}</strong> usuários
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px 24px;
      background-color: #4D4D4D;
      border-radius: 8px;
      color: white;

      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 500;
      }
    }

    .filtro-container {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;

      .filtro-input {
        width: 100%;
        max-width: 480px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
      font-size: 16px;

      p { margin-top: 20px; }
    }

    .erro-container {
      background-color: #ffebee;
      border: 1px solid #ef5350;
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      color: #d32f2f;

      mat-icon { font-size: 24px; width: 24px; height: 24px; }
      p { margin: 0; flex: 1; }
      button { white-space: nowrap; }
    }

    .usuarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3949ab, #5c6bc0);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 1px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(57, 73, 171, 0.35);
    }

    .tipo-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: auto;
      align-self: flex-start;
      margin-top: 4px;

      &.tipo-celular     { background: #e8f5e9; color: #2e7d32; }
      &.tipo-comercial   { background: #e3f2fd; color: #1565c0; }
      &.tipo-residencial { background: #fff3e0; color: #e65100; }
    }

    .usuario-card {
      border-radius: 12px;
      border-left: 4px solid #3949ab;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      overflow: hidden;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.13);
        border-left-color: #5c6bc0;
      }

      mat-card-header {
        padding: 16px 16px 12px;
        display: flex;
        align-items: center;
        gap: 4px;

        mat-card-title   { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
        mat-card-subtitle { font-size: 13px; }
      }

      mat-divider { margin: 0; }

      mat-card-content {
        padding: 14px 16px 6px;
      }

      .usuario-info {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;

          .info-icon {
            font-size: 17px;
            width: 17px;
            height: 17px;
            color: #9e9e9e;
            flex-shrink: 0;
          }

          .label {
            color: #757575;
            min-width: 58px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .value {
            color: #212121;
            font-weight: 500;
            margin-left: auto;
            text-align: right;
          }
        }
      }

      mat-card-actions {
        padding: 10px 12px 12px;
        display: flex;
        justify-content: flex-end;
        gap: 8px;

        button {
          font-size: 13px;
          height: 34px;
          line-height: 34px;
          padding: 0 14px;
        }
      }
    }

    .sem-resultados {
      text-align: center;
      padding: 60px 20px;
      color: #999;

      mat-icon { font-size: 64px; width: 64px; height: 64px; opacity: 0.5; }
      p { margin-top: 16px; font-size: 16px; }
    }

    .resumo {
      text-align: center;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 4px;
      color: #666;

      p { margin: 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private store = inject(UsuariosStore);
  private destroyRef = inject(DestroyRef);

  // Estado local para o input (debounce acontece aqui)
  filtroLocal = '';

  // Subject para debounce do filtro
  private filtroSubject$ = new Subject<string>();

  // Signals expostos para o template
  readonly filtro$ = this.store.filtro;
  readonly carregando$ = this.store.carregando;
  readonly erro$ = this.store.erro;
  readonly usuariosFiltrados$ = this.store.usuariosFiltrados;
  readonly totalUsuarios$ = this.store.totalUsuarios;
  readonly temResultados$ = this.store.temResultados;

  private dialog = inject(MatDialog);

  constructor() {
    /**
     * RxJS Pipeline: debounce 300ms + distinctUntilChanged + switchMap
     * Reduz requisições desnecessárias enquanto usuário está digitando
     */
    this.filtroSubject$
      .pipe(
        debounceTime(300), // Espera 300ms sem mudanças
        distinctUntilChanged(), // Pula se filtro é igual ao anterior
        switchMap(filtro => {
          this.store.setFiltro(filtro);
          return this.usuarioService.buscarTodos();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: usuarios => {
          this.store.setUsuarios(usuarios);
          this.store.setCarregando(false);
          this.store.setErro(null);
        },
        error: error => {
          this.store.setCarregando(false);
          this.store.setErro(error.message || 'Erro ao carregar usuários');
        }
      });
  }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  /**
   * Carrega todos os usuários
   */
  private carregarUsuarios(): void {
    this.store.setCarregando(true);
    this.store.setErro(null);

    this.usuarioService
      .buscarTodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: usuarios => {
          this.store.setUsuarios(usuarios);
          this.store.setCarregando(false);
        },
        error: error => {
          this.store.setCarregando(false);
          this.store.setErro(error.message || 'Erro ao carregar usuários');
        }
      });
  }

  /**
   * Atualiza filtro (chamado quando input muda)
   * O debounce acontece no pipeline do filtroSubject$
   */
  atualizarFiltro(value: string): void {
    this.filtroSubject$.next(value);
  }

  /**
   * Limpa filtro
   */
  limparFiltro(): void {
    this.filtroLocal = '';
    this.atualizarFiltro('');
  }

  /**
   * Recarrega usuários
   */
  recarregar(): void {
    this.carregarUsuarios();
  }

  /**
   * Abre modal para novo usuário
   */
  abrirModalNovo(): void {
    this.store.abrirModalNovo();
    this.dialog.open(UsuarioFormDialogComponent, {
      width: '540px',
      disableClose: true
    });
  }

  /**
   * Abre modal para editar usuário
   */
  abrirModalEdicao(usuario: Usuario): void {
    this.store.abrirModalEdicao(usuario);
    this.dialog.open(UsuarioFormDialogComponent, {
      width: '540px',
      disableClose: true
    });
  }

  /**
   * Deleta usuário
   */
  deletar(id: number): void {
    if (!confirm('Deseja deletar este usuário?')) {
      return;
    }

    this.usuarioService
      .deletar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.store.removerUsuario(id);
        },
        error: error => {
          this.store.setErro(error.message || 'Erro ao deletar usuário');
        }
      });
  }

  /**
   * TrackBy para melhorar performance em *ngFor (mantido para compatibilidade)
   */
  trackById(index: number, usuario: Usuario): number {
    return usuario.id;
  }

  /**
   * Retorna as iniciais do nome para o avatar.
   * Ex: "João Silva" → "JS"
   */
  getIniciais(nome: string): string {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  }
}
