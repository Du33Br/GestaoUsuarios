import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, delay, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Usuario, UsuarioForm, UsuarioParaEditar } from '../models/usuario.model';

/**
 * Serviço de Usuários com dados mockados
 * Simula requisições HTTP com delay realista
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly DELAY_MS = 800;
  
  // Dados mockados em memória
  private usuariosMemoria: Usuario[] = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      cpf: '529.982.247-25',
      telefone: '(11) 98765-4321',
      tipoTelefone: 'celular',
      criadoEm: new Date('2024-01-15')
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      cpf: '111.444.777-35',
      telefone: '(11) 3456-7890',
      tipoTelefone: 'comercial',
      criadoEm: new Date('2024-02-20')
    },
    {
      id: 3,
      nome: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      cpf: '871.169.850-00',
      telefone: '(11) 2345-6789',
      tipoTelefone: 'residencial',
      criadoEm: new Date('2024-03-10')
    },
    {
      id: 4,
      nome: 'Ana Costa',
      email: 'ana.costa@email.com',
      cpf: '769.860.090-46',
      telefone: '(11) 99876-5432',
      tipoTelefone: 'celular',
      criadoEm: new Date('2024-03-25')
    },
    {
      id: 5,
      nome: 'Carlos Mendes',
      email: 'carlos.mendes@email.com',
      cpf: '345.678.901-75',
      telefone: '(11) 3210-9876',
      tipoTelefone: 'comercial',
      criadoEm: new Date('2024-04-05')
    }
  ];

  private proximoId: number = 6;
  private usuariosSubject$ = new BehaviorSubject<Usuario[]>(this.usuariosMemoria);

  constructor() {}

  /**
   * Busca todos os usuários
   * Simula requisição HTTP com delay
   */
  buscarTodos(): Observable<Usuario[]> {
    return of([...this.usuariosMemoria]).pipe(
      delay(this.DELAY_MS),
      catchError(error => {
        console.error('Erro ao buscar usuários', error);
        return throwError(() => new Error('Falha ao carregar usuários'));
      })
    );
  }

  /**
   * Busca usuários com filtro de nome
   * RxJS: map + catchError
   */
  buscarPorNome(nome: string): Observable<Usuario[]> {
    return of(this.usuariosMemoria).pipe(
      delay(this.DELAY_MS),
      map(usuarios =>
        usuarios.filter(u =>
          u.nome.toLowerCase().includes(nome.toLowerCase())
        )
      ),
      catchError(error => {
        console.error('Erro ao filtrar usuários', error);
        return throwError(() => new Error('Falha ao filtrar usuários'));
      })
    );
  }

  /**
   * Busca usuário por ID
   */
  buscarPorId(id: number): Observable<Usuario> {
    return of(this.usuariosMemoria).pipe(
      delay(this.DELAY_MS),
      map(usuarios => {
        const usuario = usuarios.find(u => u.id === id);
        if (!usuario) {
          throw new Error('Usuário não encontrado');
        }
        return usuario;
      }),
      catchError(error => {
        console.error('Erro ao buscar usuário', error);
        return throwError(() => new Error('Usuário não encontrado'));
      })
    );
  }

  /**
   * Cria novo usuário
   */
  criar(usuarioForm: UsuarioForm): Observable<Usuario> {
    return of(usuarioForm).pipe(
      delay(this.DELAY_MS),
      map(form => {
        const novoUsuario: Usuario = {
          id: this.proximoId++,
          ...form,
          criadoEm: new Date()
        };
        this.usuariosMemoria.push(novoUsuario);
        this.usuariosSubject$.next([...this.usuariosMemoria]);
        return novoUsuario;
      }),
      catchError(error => {
        console.error('Erro ao criar usuário', error);
        return throwError(() => new Error('Falha ao criar usuário'));
      })
    );
  }

  /**
   * Atualiza usuário existente
   * RxJS: map + catchError
   */
  atualizar(id: number, usuarioForm: UsuarioForm): Observable<Usuario> {
    return of(usuarioForm).pipe(
      delay(this.DELAY_MS),
      map(form => {
        const index = this.usuariosMemoria.findIndex(u => u.id === id);
        if (index === -1) {
          throw new Error('Usuário não encontrado');
        }
        const usuarioAtualizado: Usuario = {
          ...this.usuariosMemoria[index],
          ...form
        };
        this.usuariosMemoria[index] = usuarioAtualizado;
        this.usuariosSubject$.next([...this.usuariosMemoria]);
        return usuarioAtualizado;
      }),
      catchError(error => {
        console.error('Erro ao atualizar usuário', error);
        return throwError(() => new Error('Falha ao atualizar usuário'));
      })
    );
  }

  /**
   * Deleta usuário
   */
  deletar(id: number): Observable<void> {
    return of(void 0).pipe(
      delay(this.DELAY_MS),
      map(() => {
        const index = this.usuariosMemoria.findIndex(u => u.id === id);
        if (index === -1) {
          throw new Error('Usuário não encontrado');
        }
        this.usuariosMemoria.splice(index, 1);
        this.usuariosSubject$.next([...this.usuariosMemoria]);
      }),
      catchError(error => {
        console.error('Erro ao deletar usuário', error);
        return throwError(() => new Error('Falha ao deletar usuário'));
      })
    );
  }

  /**
   * Verifica se email já existe
   * Simulando validação no servidor
   */
  verificarEmailExistente(email: string, idAtual?: number): Observable<boolean> {
    return of(email).pipe(
      delay(400), // Delay realista para validação
      map(emailParaVerificar => {
        const existe = this.usuariosMemoria.some(u => u.email === emailParaVerificar);
        // Se é edição, permitir o mesmo email
        if (idAtual && existe) {
          return this.usuariosMemoria.some(
            u => u.email === emailParaVerificar && u.id !== idAtual
          );
        }
        return existe;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Verifica se CPF já existe
   */
  verificarCpfExistente(cpf: string, idAtual?: number): Observable<boolean> {
    return of(cpf).pipe(
      delay(400),
      map(cpfParaVerificar => {
        const existe = this.usuariosMemoria.some(u => u.cpf === cpfParaVerificar);
        if (idAtual && existe) {
          return this.usuariosMemoria.some(
            u => u.cpf === cpfParaVerificar && u.id !== idAtual
          );
        }
        return existe;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Observable dos usuários (para uso em streams)
   */
  get usuarios$(): Observable<Usuario[]> {
    return this.usuariosSubject$.asObservable();
  }
}
