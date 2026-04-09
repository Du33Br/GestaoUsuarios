import { describe, it, expect } from 'vitest';
import { Produto, Verdureira } from './produto';

describe('Produto e Verdureira — Refatoração (Seção 1.1)', () => {
  let verdureira: Verdureira;

  beforeEach(() => {
    verdureira = new Verdureira();
  });

  describe('Verdureira.getDescricaoProduto', () => {
    it('deve retornar descrição formatada para produto existente', () => {
      const resultado = verdureira.getDescricaoProduto(1);
      expect(resultado).toBe('1 - Maçã (20x)');
    });

    it('deve retornar null para ID inexistente', () => {
      const resultado = verdureira.getDescricaoProduto(999);
      expect(resultado).toBeNull();
    });

    it('deve tratar produto sem estoque', () => {
      const resultado = verdureira.getDescricaoProduto(2);
      expect(resultado).toBe('2 - Laranja (0x)');
    });
  });

  describe('Verdureira.hasEstoqueProduto', () => {
    it('deve retornar true para produto com estoque', () => {
      expect(verdureira.hasEstoqueProduto(1)).toBe(true);
    });

    it('deve retornar false para produto sem estoque', () => {
      expect(verdureira.hasEstoqueProduto(2)).toBe(false);
    });

    it('deve retornar false para ID inexistente', () => {
      expect(verdureira.hasEstoqueProduto(999)).toBe(false);
    });
  });

  describe('DRY — sem duplicação', () => {
    it('produtos devem ter tipagem correta via interface IProduto', () => {
      const produto = new Produto(10, 'Uva', 5);
      expect(produto.id).toBe(10);
      expect(produto.descricao).toBe('Uva');
      expect(produto.quantidadeEstoque).toBe(5);
    });
  });
});
