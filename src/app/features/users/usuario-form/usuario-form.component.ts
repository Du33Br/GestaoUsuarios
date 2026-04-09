import {
  Component,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
  signal
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuariosStore } from '../../../services/usuarios.store';
import { Usuario, UsuarioForm } from '../../../models/usuario.model';
import {
  validarCPF,
  validarEmail,
  validarTelefone,
  emailUnicValidator,
  cpfUnicoValidator
} from '../../../shared/validators/usuarios.validators';

/**
 * Componente do Dialog/Modal com Formulário
 * 
 * Funcionalidades:
 * - Formulário reativo
 * - Validação de CPF, Email, Telefone
 * - Validadores assincronos (email e CPF únicos)
 * - Mensagens de erro por campo
 * - Preenchimento automático em modo edição
 * - Estados de loading e sucesso
 * 
 * RxJS Operators: switchMap (em validadores assincronos)
 * Validadores: customizados + assincronos
 * Change Detection: OnPush
 */
@Component({
  selector: 'app-usuario-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h2>{{ modoEdicao ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
        <button
          type="button"
          mat-icon-button
          (click)="fecharModal()"
          class="close-button"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="salvar()">
        <!-- Nome -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" placeholder="Seu nome completo" />
          <mat-error *ngIf="tem('nome', 'required')">
            Nome é obrigatório
          </mat-error>
          <mat-error *ngIf="tem('nome', 'minlength')">
            Mínimo 3 caracteres
          </mat-error>
        </mat-form-field>

        <!-- Email -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>E-mail</mat-label>
          <input
            matInput
            formControlName="email"
            type="email"
            placeholder="seu.email@example.com"
          />
          <mat-error *ngIf="tem('email', 'required')">
            E-mail é obrigatório
          </mat-error>
          <mat-error *ngIf="tem('email', 'emailInvalido')">
            E-mail inválido
          </mat-error>
          <mat-error *ngIf="tem('email', 'emailJaExiste')">
            Este e-mail já está cadastrado
          </mat-error>
        </mat-form-field>

        <!-- CPF -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>CPF</mat-label>
          <input
            matInput
            formControlName="cpf"
            placeholder="000.000.000-00"
            (input)="formatarCPF($event)"
          />
          <mat-error *ngIf="tem('cpf', 'required')">
            CPF é obrigatório
          </mat-error>
          <mat-error *ngIf="tem('cpf', 'cpfInvalido')">
            CPF inválido
          </mat-error>
          <mat-error *ngIf="tem('cpf', 'cpfJaExiste')">
            Este CPF já está cadastrado
          </mat-error>
        </mat-form-field>

        <!-- Telefone -->
        <div class="telefone-group">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Telefone</mat-label>
            <input
              matInput
              formControlName="telefone"
              placeholder="(11) 98765-4321"
              (input)="formatarTelefone($event)"
            />
            <mat-error *ngIf="tem('telefone', 'required')">
              Telefone é obrigatório
            </mat-error>
            <mat-error *ngIf="tem('telefone', 'telefoneInvalido')">
              Telefone inválido (10-11 dígitos)
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipoTelefone">
              <mat-option value="celular">Celular</mat-option>
              <mat-option value="comercial">Comercial</mat-option>
              <mat-option value="residencial">Residencial</mat-option>
            </mat-select>
            <mat-error *ngIf="tem('tipoTelefone', 'required')">
              Tipo é obrigatório
            </mat-error>
          </mat-form-field>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button
            type="button"
            mat-button
            (click)="fecharModal()"
            [disabled]="salvando"
          >
            Cancelar
          </button>
          <button
            type="submit"
            mat-raised-button
            color="primary"
            [disabled]="!form.valid || salvando()"
          >
            <mat-icon *ngIf="salvando()">sync</mat-icon>
            {{ salvando() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      width: 100%;
      max-width: 500px;
      padding: 20px;

      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }

        .close-button {
          margin: 0;
        }
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-field {
        width: 100%;
      }

      .telefone-group {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;

        button {
          min-width: 100px;
        }
      }

      mat-icon {
        animation: spin 2s linear infinite;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioFormDialogComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private store = inject(UsuariosStore);
  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(MatDialogRef<UsuarioFormDialogComponent>);

  salvando = signal(false);
  modoEdicao = false;
  usuarioId?: number;
  form: FormGroup;

  constructor() {
    const usuarioSelecionado = this.store.usuarioSelecionado();
    this.modoEdicao = !!usuarioSelecionado;
    this.usuarioId = usuarioSelecionado?.id;
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: [
        '',
        {
          validators: [Validators.required, validarEmail()],
          asyncValidators: [emailUnicValidator(usuarioSelecionado?.id)],
          updateOn: 'blur'
        }
      ],
      cpf: [
        '',
        {
          validators: [Validators.required, validarCPF()],
          asyncValidators: [cpfUnicoValidator(usuarioSelecionado?.id)],
          updateOn: 'blur'
        }
      ],
      telefone: ['', [Validators.required, validarTelefone()]],
      tipoTelefone: ['celular', Validators.required]
    });
    if (usuarioSelecionado) {
      this.form.patchValue(usuarioSelecionado);
      // Force validators to run immediately on pre-filled data
      this.form.updateValueAndValidity();
      Object.values(this.form.controls).forEach(c => c.updateValueAndValidity());
    }
  }

  /**
   * Salva usuário (criar ou atualizar)
   */
  salvar(): void {
    if (!this.form.valid) {
      return;
    }

    this.salvando.set(true);
    const dadosFormulario: UsuarioForm = this.form.value;

    const requisicao = this.modoEdicao && this.usuarioId
      ? this.usuarioService.atualizar(this.usuarioId, dadosFormulario)
      : this.usuarioService.criar(dadosFormulario);

    requisicao
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: usuarioCriado => {
          this.salvando.set(false);
          if (this.modoEdicao) {
            this.store.atualizarUsuario(usuarioCriado);
          } else {
            this.store.adicionarUsuario(usuarioCriado);
          }
          this.fecharModal();
        },
        error: error => {
          this.salvando.set(false);
          this.store.setErro(error.message || 'Erro ao salvar usuário');
        }
      });
  }

  /**
   * Fecha modal
   */
  fecharModal(): void {
    this.form.reset();
    this.store.fecharModal();
    this.dialogRef.close();
  }

  /**
   * Verifica se campo tem erro
   */
  tem(campo: string, erro: string): boolean {
    if (!this.form) return false;
    const control = this.form.get(campo);
    return !!(control && control.hasError(erro) &&
              (control.dirty || control.touched));
  }

  /**
   * Formata CPF ao digitar
   */
  formatarCPF(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    // Formata: XXX.XXX.XXX-XX
    if (valor.length > 9) {
      valor = `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6, 9)}-${valor.slice(9)}`;
    } else if (valor.length > 6) {
      valor = `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6)}`;
    } else if (valor.length > 3) {
      valor = `${valor.slice(0, 3)}.${valor.slice(3)}`;
    }

    this.form.get('cpf')?.setValue(valor, { emitEvent: false });
  }

  /**
   * Formata Telefone ao digitar
   */
  formatarTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');

    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    // Formata: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
    if (valor.length >= 10) {
      const tem9 = valor[2] === '9';
      if (tem9) {
        valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
      } else {
        valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`;
      }
    } else if (valor.length > 5) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 5)}-${valor.slice(5)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else if (valor.length > 0) {
      valor = `(${valor}`;
    }

    this.form.get('telefone')?.setValue(valor, { emitEvent: false });
  }
}
