/**
 * SEÇÃO 3.1 — Carrinho de Compras com Signals
 *
 * Demonstra:
 *  - signal()   → estado reativo local (lista de itens)
 *  - computed() → total derivado automaticamente (preço × quantidade)
 *  - output()   → evento tipado para comunicação pai-filho (Angular 17.3+)
 *
 * Por que output() em vez de EventEmitter?
 *  - output() retorna um OutputEmitterRef com tipagem forte
 *  - Integra-se ao sistema de Signals (pode ser lido como Signal no futuro)
 *  - API mais simples e consistente com o modelo reativo do Angular
 */

import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  output,
} from '@angular/core';

// ─── Modelo ──────────────────────────────────────────────────────────────────

export interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

export interface PedidoFinalizado {
  itens: ItemCarrinho[];
  total: number;
  data: Date;
}

// ─── Componente ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-carrinho',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="carrinho">
      <h2>🛒 Carrinho de Compras</h2>

      <!-- Catálogo de produtos para adicionar -->
      <section class="catalogo">
        <h3>Produtos</h3>
        <div class="produtos-grid">
          @for (produto of catalogo; track produto.id) {
            <div class="produto-item">
              <span class="produto-nome">{{ produto.nome }}</span>
              <span class="produto-preco">R$ {{ produto.preco.toFixed(2) }}</span>
              <button (click)="adicionarItem(produto)">Adicionar</button>
            </div>
          }
        </div>
      </section>

      <!-- Itens no carrinho -->
      <section class="itens">
        <h3>Itens no Carrinho</h3>

        @if (itens().length === 0) {
          <p class="vazio">Carrinho vazio</p>
        } @else {
          @for (item of itens(); track item.id) {
            <div class="item-linha">
              <span class="item-nome">{{ item.nome }}</span>
              <div class="item-controles">
                <button (click)="decrementar(item.id)">−</button>
                <span class="item-qtd">{{ item.quantidade }}</span>
                <button (click)="incrementar(item.id)">+</button>
              </div>
              <span class="item-subtotal">
                R$ {{ (item.preco * item.quantidade).toFixed(2) }}
              </span>
              <button class="remover" (click)="removerItem(item.id)">✕</button>
            </div>
          }

          <!-- computed() lido como função no template: total() -->
          <div class="total-linha">
            <strong>Total:</strong>
            <strong class="total-valor">R$ {{ total().toFixed(2) }}</strong>
          </div>

          <!-- totalItens() → computed derivado de itens() -->
          <p class="resumo-qtd">{{ totalItens() }} item(ns) no carrinho</p>

          <div class="acoes">
            <button class="btn-limpar" (click)="limpar()">Limpar Carrinho</button>
            <!-- output(): emite o evento ao componente pai -->
            <button class="btn-finalizar" (click)="finalizar()">
              Finalizar Pedido
            </button>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .carrinho { padding: 24px; max-width: 600px; font-family: sans-serif; }
    h2 { color: #4D4D4D; }
    h3 { color: #666; border-bottom: 1px solid #eee; padding-bottom: 8px; }

    .produtos-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .produto-item {
      display: flex; align-items: center; gap: 8px;
      border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px;
      background: #fafafa;
    }
    .produto-nome { font-weight: 500; }
    .produto-preco { color: #e53935; font-weight: 600; min-width: 70px; text-align: right; }

    .vazio { color: #999; font-style: italic; }

    .item-linha {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid #f0f0f0;
    }
    .item-nome { flex: 1; }
    .item-controles { display: flex; align-items: center; gap: 6px; }
    .item-controles button {
      width: 28px; height: 28px; border-radius: 50%;
      border: 1px solid #ccc; background: white; cursor: pointer; font-size: 16px;
      &:hover { background: #f5f5f5; }
    }
    .item-qtd { min-width: 24px; text-align: center; font-weight: 600; }
    .item-subtotal { min-width: 80px; text-align: right; color: #333; }
    .remover { color: #e53935; border: none; background: none; cursor: pointer; font-size: 16px; }

    .total-linha {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; font-size: 18px; border-top: 2px solid #4D4D4D; margin-top: 8px;
    }
    .total-valor { color: #e53935; font-size: 22px; }
    .resumo-qtd { color: #666; font-size: 13px; margin: 4px 0 16px; }

    .acoes { display: flex; gap: 12px; }
    button { cursor: pointer; }
    .btn-limpar {
      flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 6px;
      background: white;
      &:hover { background: #f5f5f5; }
    }
    .btn-finalizar {
      flex: 2; padding: 10px; border: none; border-radius: 6px;
      background: #e53935; color: white; font-weight: 600; font-size: 15px;
      &:hover { background: #c62828; }
    }
  `],
})
export class CarrinhoComponent {
  // ── output(): event emitter tipado, API moderna do Angular 17.3+ ──────────
  readonly pedidoFinalizado = output<PedidoFinalizado>();
  readonly carrinhoLimpo = output<void>();

  // ── signal(): estado reativo local ───────────────────────────────────────
  readonly itens = signal<ItemCarrinho[]>([]);

  // ── computed(): valores derivados, recalculados apenas quando itens() muda ─
  readonly total = computed(() =>
    this.itens().reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  );

  readonly totalItens = computed(() =>
    this.itens().reduce((acc, item) => acc + item.quantidade, 0)
  );

  // Catálogo local (imutável — não é Signal, não muda em runtime)
  readonly catalogo: Omit<ItemCarrinho, 'quantidade'>[] = [
    { id: 1, nome: 'Maçã',   preco: 2.50 },
    { id: 2, nome: 'Laranja', preco: 1.80 },
    { id: 3, nome: 'Limão',   preco: 0.99 },
  ];

  adicionarItem(produto: Omit<ItemCarrinho, 'quantidade'>): void {
    this.itens.update(lista => {
      const existente = lista.find(i => i.id === produto.id);
      if (existente) {
        // Retorna novo array com quantidade incrementada (imutável)
        return lista.map(i => i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...lista, { ...produto, quantidade: 1 }];
    });
  }

  incrementar(id: number): void {
    this.itens.update(lista =>
      lista.map(i => i.id === id ? { ...i, quantidade: i.quantidade + 1 } : i)
    );
  }

  decrementar(id: number): void {
    this.itens.update(lista =>
      lista
        .map(i => i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i)
        .filter(i => i.quantidade > 0) // remove se chegar a 0
    );
  }

  removerItem(id: number): void {
    this.itens.update(lista => lista.filter(i => i.id !== id));
  }

  limpar(): void {
    this.itens.set([]);
    this.carrinhoLimpo.emit(); // output() emitindo void
  }

  finalizar(): void {
    const pedido: PedidoFinalizado = {
      itens: this.itens(),
      total: this.total(),
      data: new Date(),
    };
    this.pedidoFinalizado.emit(pedido); // output() emitindo objeto tipado
    this.itens.set([]);
  }
}
