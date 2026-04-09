/**
 * SEÇÃO 1.1 — Refatoração: Produto e Verdureira
 *
 * PROBLEMAS no código original:
 *  - Todos os campos tipados como `any` (sem type-safety)
 *  - Loops manuais `for` em vez de métodos funcionais
 *  - Código duplicado entre getDescricaoProduto e hasEstoqueProduto
 *  - Acesso a `produto.id` sem verificar se `produto` é undefined (crash em runtime)
 *
 * MELHORIAS APLICADAS:
 *  - Interface `IProduto` com tipagem explícita
 *  - Método privado `_encontrarProduto()` elimina duplicação (DRY)
 *  - `.find()` substitui o loop manual
 *  - `.some()` na verificação de estoque
 *  - Tratamento explícito quando o ID não existe (retorno `null` ou `false`)
 */

// ─── Interface com tipagem forte ────────────────────────────────────────────

export interface IProduto {
  id: number;
  descricao: string;
  quantidadeEstoque: number;
}

// ─── Classe Produto ──────────────────────────────────────────────────────────

export class Produto implements IProduto {
  constructor(
    public readonly id: number,
    public readonly descricao: string,
    public quantidadeEstoque: number
  ) {}
}

// ─── Classe Verdureira (refatorada) ─────────────────────────────────────────

export class Verdureira {
  readonly produtos: IProduto[];

  constructor() {
    this.produtos = [
      new Produto(1, 'Maçã', 20),
      new Produto(2, 'Laranja', 0),
      new Produto(3, 'Limão', 20),
    ];
  }

  /**
   * Princípio DRY: método privado reutilizado por getDescricaoProduto e hasEstoqueProduto.
   * Retorna `undefined` quando o ID não existe (tratado pelos consumidores).
   */
  private _encontrarProduto(produtoId: number): IProduto | undefined {
    return this.produtos.find(p => p.id === produtoId);
  }

  /**
   * Retorna a descrição formatada ou `null` se o ID não existir.
   */
  getDescricaoProduto(produtoId: number): string | null {
    const produto = this._encontrarProduto(produtoId);
    if (!produto) {
      console.warn(`Produto com id ${produtoId} não encontrado.`);
      return null;
    }
    return `${produto.id} - ${produto.descricao} (${produto.quantidadeEstoque}x)`;
  }

  /**
   * Retorna `true` se o produto tiver estoque, `false` se não tiver ou não existir.
   * Demonstração alternativa com `.some()`.
   */
  hasEstoqueProduto(produtoId: number): boolean {
    return this.produtos.some(p => p.id === produtoId && p.quantidadeEstoque > 0);
  }
}
