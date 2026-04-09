/**
 * SEÇÃO 2.1 — O Enigma do OnPush
 *
 * ─── DIAGNÓSTICO DO PROBLEMA ───────────────────────────────────────────────
 *
 * O componente original não atualiza porque usa ChangeDetectionStrategy.OnPush,
 * que SÓ re-renderiza quando:
 *   1. Um @Input() referenciado muda (nova referência de objeto)
 *   2. Um event binding no template é disparado
 *   3. Um Observable ligado via async pipe emite
 *   4. ChangeDetectorRef.markForCheck() é chamado manualmente
 *
 * No código original, NENHUMA dessas condições é satisfeita:
 *   - `this.texto = ...` no subscribe → propriedade simples, não dispara CD
 *   - `this.contador++` no setInterval → mutação de primitivo, não dispara CD
 *
 * ─── SOLUÇÃO: SIGNALS ──────────────────────────────────────────────────────
 *
 * Angular Signals são AUTOMATICAMENTE rastreados pelo compilador e sempre
 * disparam re-render ao mudar, mesmo com OnPush.
 * Não é necessário `async pipe`, `markForCheck()` nem alterar a estratégia.
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaService } from './pessoa.service';

// ─────────────────────────────────────────────────────────────────────────────
// CÓDIGO ORIGINAL (com bug) — para referência e comparação
// ─────────────────────────────────────────────────────────────────────────────
//
// @Component({
//   selector: 'app-root',
//   providers: [PessoaService],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   template: `<h1>{{ texto }}</h1> <p>Contador: {{ contador }}</p>`,
// })
// export class AppComponent implements OnInit {
//   texto: string;             ← propriedade simples, OnPush não rastreia
//   contador = 0;              ← idem
//   constructor(private pessoaService: PessoaService) {}
//   ngOnInit() {
//     this.pessoaService.buscarPorId(1).subscribe(p => {
//       this.texto = `Nome: ${p.nome}`; ← muta a propriedade, CD não é notificado
//     });
//     setInterval(() => this.contador++, 1000); ← idem
//   }
// }

// ─────────────────────────────────────────────────────────────────────────────
// SOLUÇÃO CORRIGIDA com Signals
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-onpush-demo',
  standalone: true,
  imports: [CommonModule],
  providers: [PessoaService],
  changeDetection: ChangeDetectionStrategy.OnPush, // ← estratégia mantida
  template: `
    <div class="onpush-demo">
      <h2>Enigma OnPush — Solução com Signals</h2>

      <!-- Signals são lidos como funções no template: texto() -->
      <!-- O compilador Angular registra automaticamente a dependência -->
      <!-- e re-renderiza quando o valor muda, mesmo com OnPush -->
      <h1>{{ texto() }}</h1>
      <p>Contador: {{ contador() }}</p>

      <div class="explanation">
        <strong>Por quê funciona?</strong>
        <p>
          Signals notificam o runtime Angular quando seu valor muda.
          O change detector do OnPush detecta a mudança via Producer/Consumer
          interno do Signal, sem precisar de async pipe nem markForCheck().
        </p>
      </div>
    </div>
  `,
  styles: [`
    .onpush-demo {
      padding: 24px;
      border: 2px solid #4caf50;
      border-radius: 8px;
      margin: 16px;
    }
    .explanation {
      margin-top: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
    }
  `]
})
export class OnPushDemoComponent implements OnInit, OnDestroy {
  private pessoaService = inject(PessoaService);

  // ← Signals substituem as propriedades simples.
  //    O template lê texto() e contador() — Angular registra
  //    as dependências e re-agenda CD automaticamente ao .set()
  readonly texto = signal('Carregando...');
  readonly contador = signal(0);

  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // Quando o subscribe chama .set(), o Signal notifica o scheduler
    // do Angular que este componente precisa re-renderizar
    this.pessoaService.buscarPorId(1).subscribe(p => {
      this.texto.set(`Nome: ${p.nome}`);
    });

    // O .set() dentro do setInterval também dispara a re-renderização
    this.intervalId = setInterval(() => {
      this.contador.update(v => v + 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
