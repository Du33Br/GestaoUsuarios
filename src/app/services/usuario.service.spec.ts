import { describe, it, expect, beforeEach } from 'vitest';
import { UsuarioService } from './usuario.service';
import { Usuario, UsuarioForm } from '../models/usuario.model';

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(() => {
    service = new UsuarioService();
  });

  describe('buscarTodos', () => {
    it('deve retornar lista de usuários', (done) => {
      service.buscarTodos().subscribe(usuarios => {
        expect(Array.isArray(usuarios)).toBe(true);
        expect(usuarios.length).toBeGreaterThan(0);
        done();
      });
    });

    it('cada usuário deve ter os campos obrigatórios', (done) => {
      service.buscarTodos().subscribe(usuarios => {
        usuarios.forEach(usuario => {
          expect(usuario).toHaveProperty('id');
          expect(usuario).toHaveProperty('nome');
          expect(usuario).toHaveProperty('email');
          expect(usuario).toHaveProperty('cpf');
          expect(usuario).toHaveProperty('telefone');
          expect(usuario).toHaveProperty('tipoTelefone');
        });
        done();
      });
    });
  });

  describe('buscarPorNome', () => {
    it('deve filtrar usuários por nome', (done) => {
      service.buscarPorNome('João').subscribe(usuarios => {
        expect(usuarios.length).toBeGreaterThan(0);
        usuarios.forEach(u => {
          expect(u.nome.toLowerCase()).toContain('joão');
        });
        done();
      });
    });

    it('deve retornar array vazio se nome não encontrado', (done) => {
      service.buscarPorNome('XYZ123').subscribe(usuarios => {
        expect(Array.isArray(usuarios)).toBe(true);
        expect(usuarios.length).toBe(0);
        done();
      });
    });

    it('deve ser case insensitive', (done) => {
      service.buscarPorNome('joão').subscribe(usuarios => {
        expect(usuarios.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar usuário com ID correto', (done) => {
      service.buscarPorId(1).subscribe(usuario => {
        expect(usuario.id).toBe(1);
        expect(usuario.nome).toBeDefined();
        done();
      });
    });

    it('deve retornar erro para ID não existente', (done) => {
      service.buscarPorId(99999).subscribe(
        () => {
          throw new Error('Deveria ter retornado erro');
        },
        error => {
          expect(error.message).toContain('não encontrado');
          done();
        }
      );
    });
  });

  describe('criar', () => {
    it('deve criar novo usuário', (done) => {
      const novoUsuario: UsuarioForm = {
        nome: 'Novo Usuário',
        email: 'novo@email.com',
        cpf: '555.666.777-88',
        telefone: '(11) 99999-9999',
        tipoTelefone: 'celular'
      };

      service.criar(novoUsuario).subscribe(usuarioCriado => {
        expect(usuarioCriado.id).toBeDefined();
        expect(usuarioCriado.nome).toBe(novoUsuario.nome);
        expect(usuarioCriado.email).toBe(novoUsuario.email);
        done();
      });
    });

    it('novo usuário deve ter ID único', (done) => {
      const usuario1: UsuarioForm = {
        nome: 'User 1',
        email: 'user1@email.com',
        cpf: '111.222.333-44',
        telefone: '(11) 91111-1111',
        tipoTelefone: 'celular'
      };

      const usuario2: UsuarioForm = {
        nome: 'User 2',
        email: 'user2@email.com',
        cpf: '222.333.444-55',
        telefone: '(11) 92222-2222',
        tipoTelefone: 'celular'
      };

      service.criar(usuario1).subscribe(u1 => {
        service.criar(usuario2).subscribe(u2 => {
          expect(u1.id).not.toBe(u2.id);
          done();
        });
      });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar usuário existente', (done) => {
      const atualizacao: UsuarioForm = {
        nome: 'Nome Atualizado',
        email: 'email.atualizado@email.com',
        cpf: '123.456.789-00',
        telefone: '(11) 98765-4321',
        tipoTelefone: 'comercial'
      };

      service.atualizar(1, atualizacao).subscribe(usuarioAtualizado => {
        expect(usuarioAtualizado.nome).toBe(atualizacao.nome);
        expect(usuarioAtualizado.tipoTelefone).toBe(atualizacao.tipoTelefone);
        done();
      });
    });

    it('deve retornar erro ao atualizar usuário não existente', (done) => {
      const atualizacao: UsuarioForm = {
        nome: 'Nome',
        email: 'email@email.com',
        cpf: '123.456.789-00',
        telefone: '(11) 98765-4321',
        tipoTelefone: 'celular'
      };

      service.atualizar(99999, atualizacao).subscribe(
        () => {
          throw new Error('Deveria ter retornado erro');
        },
        error => {
          expect(error.message).toContain('não encontrado');
          done();
        }
      );
    });
  });

  describe('deletar', () => {
    it('deve deletar usuário existente', (done) => {
      service.deletar(1).subscribe(() => {
        service.buscarPorId(1).subscribe(
          () => {
            throw new Error('Usuário ainda existe');
          },
          error => {
            expect(error.message).toContain('não encontrado');
            done();
          }
        );
      });
    });

    it('deve retornar erro ao deletar usuário não existente', (done) => {
      service.deletar(99999).subscribe(
        () => {
          throw new Error('Deveria ter retornado erro');
        },
        error => {
          expect(error.message).toContain('não encontrado');
          done();
        }
      );
    });
  });

  describe('verificarEmailExistente', () => {
    it('deve retornar true para email existente', (done) => {
      service.verificarEmailExistente('joao.silva@email.com').subscribe(existe => {
        expect(existe).toBe(true);
        done();
      });
    });

    it('deve retornar false para email não existente', (done) => {
      service.verificarEmailExistente('nao.existe@email.com').subscribe(existe => {
        expect(existe).toBe(false);
        done();
      });
    });

    it('deve permitir mesmo email em modo edição', (done) => {
      service.verificarEmailExistente('joao.silva@email.com', 1).subscribe(existe => {
        expect(existe).toBe(false); // Mesmo email do ID 1, então não "existe"
        done();
      });
    });
  });

  describe('verificarCpfExistente', () => {
    it('deve retornar true para CPF existente', (done) => {
      service.verificarCpfExistente('123.456.789-00').subscribe(existe => {
        expect(existe).toBe(true);
        done();
      });
    });

    it('deve retornar false para CPF não existente', (done) => {
      service.verificarCpfExistente('999.999.999-99').subscribe(existe => {
        expect(existe).toBe(false);
        done();
      });
    });
  });
});
