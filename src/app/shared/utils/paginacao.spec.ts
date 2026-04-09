import { describe, it, expect } from 'vitest';
import { filtrarEPaginar, PaginaParams } from './paginacao';
import { Usuario } from '../../models/usuario.model';

describe('filtrarEPaginar — Generics (Seção 1.2)', () => {
  const usuarios: Usuario[] = [
    { id: 1, nome: 'João Silva',  email: 'joao@a.com',  cpf: '111.444.777-35', telefone: '11999990001', tipoTelefone: 'celular',     criadoEm: new Date() },
    { id: 2, nome: 'Maria Souza', email: 'maria@a.com', cpf: '529.982.247-25', telefone: '11999990002', tipoTelefone: 'celular',     criadoEm: new Date() },
    { id: 3, nome: 'Pedro Lima',  email: 'pedro@a.com', cpf: '871.263.988-78', telefone: '11999990003', tipoTelefone: 'comercial',   criadoEm: new Date() },
    { id: 4, nome: 'Ana Costa',   email: 'ana@a.com',   cpf: '153.509.460-56', telefone: '11999990004', tipoTelefone: 'residencial', criadoEm: new Date() },
    { id: 5, nome: 'João Pedro',  email: 'joaop@a.com', cpf: '182.795.494-04', telefone: '11999990005', tipoTelefone: 'celular',     criadoEm: new Date() },
  ];

  const params: PaginaParams = { pagina: 1, itensPorPagina: 2 };

  describe('Filtragem', () => {
    it('deve filtrar por predicado', () => {
      const resultado = filtrarEPaginar(
        usuarios,
        u => u.nome.toLowerCase().includes('joão'),
        { pagina: 1, itensPorPagina: 10 }
      );
      expect(resultado.total).toBe(2);
      expect(resultado.itens.every(u => u.nome.includes('João'))).toBe(true);
    });

    it('deve retornar todos quando predicado sempre true', () => {
      const resultado = filtrarEPaginar(usuarios, () => true, { pagina: 1, itensPorPagina: 10 });
      expect(resultado.total).toBe(5);
    });

    it('deve retornar vazio quando nenhum item passa', () => {
      const resultado = filtrarEPaginar(usuarios, () => false, params);
      expect(resultado.total).toBe(0);
      expect(resultado.itens).toHaveLength(0);
    });
  });

  describe('Paginação', () => {
    it('deve retornar a quantidade correta por página', () => {
      const resultado = filtrarEPaginar(usuarios, () => true, { pagina: 1, itensPorPagina: 2 });
      expect(resultado.itens).toHaveLength(2);
    });

    it('deve calcular totalPaginas corretamente', () => {
      const resultado = filtrarEPaginar(usuarios, () => true, { pagina: 1, itensPorPagina: 2 });
      expect(resultado.totalPaginas).toBe(3); // 5 itens / 2 = ceil(2.5) = 3
    });

    it('deve navegar para página 2', () => {
      const p1 = filtrarEPaginar(usuarios, () => true, { pagina: 1, itensPorPagina: 2 });
      const p2 = filtrarEPaginar(usuarios, () => true, { pagina: 2, itensPorPagina: 2 });
      expect(p2.itens[0].id).not.toBe(p1.itens[0].id);
    });

    it('deve ter temProxima/temAnterior corretos', () => {
      const pag1 = filtrarEPaginar(usuarios, () => true, { pagina: 1, itensPorPagina: 2 });
      expect(pag1.temAnterior).toBe(false);
      expect(pag1.temProxima).toBe(true);

      const ultima = filtrarEPaginar(usuarios, () => true, { pagina: 3, itensPorPagina: 2 });
      expect(ultima.temAnterior).toBe(true);
      expect(ultima.temProxima).toBe(false);
    });
  });

  describe('Generics — funciona com qualquer tipo T', () => {
    it('deve funcionar com array de strings', () => {
      const frutas = ['maçã', 'laranja', 'uva', 'limão'];
      const resultado = filtrarEPaginar(
        frutas,
        f => f.includes('a'),
        { pagina: 1, itensPorPagina: 2 }
      );
      expect(resultado.total).toBe(3); // maçã, laranja, uva
    });

    it('deve funcionar com array de números', () => {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const resultado = filtrarEPaginar(nums, n => n % 2 === 0, { pagina: 1, itensPorPagina: 3 });
      expect(resultado.total).toBe(5); // pares: 2,4,6,8,10
      expect(resultado.itens).toEqual([2, 4, 6]);
    });
  });
});
