import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UsuarioService } from '../../services/usuario.service';
import { inject } from '@angular/core';

/**
 * Validador de CPF
 * Valida formato e algoritmo da sequência
 */
export function validarCPF(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Deixa para validador 'required'
    }

    const cpf = control.value.replace(/\D/g, '');

    // CPF deve ter 11 dígitos
    if (cpf.length !== 11) {
      return { cpfInvalido: true };
    }

    // Rejeita CPFs com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { cpfInvalido: true };
    }

    // Valida primeiro dígito
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let primeiroDigito = 11 - (soma % 11);
    primeiroDigito = primeiroDigito > 9 ? 0 : primeiroDigito;

    if (primeiroDigito !== parseInt(cpf.charAt(9))) {
      return { cpfInvalido: true };
    }

    // Valida segundo dígito
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let segundoDigito = 11 - (soma % 11);
    segundoDigito = segundoDigito > 9 ? 0 : segundoDigito;

    if (segundoDigito !== parseInt(cpf.charAt(10))) {
      return { cpfInvalido: true };
    }

    return null;
  };
}

/**
 * Validador de Email
 * Valida formato básico
 */
export function validarEmail(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      return { emailInvalido: true };
    }

    return null;
  };
}

/**
 * Validador de Telefone
 * Valida formato brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function validarTelefone(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const telefone = control.value.replace(/\D/g, '');

    // Deve ter 10 ou 11 dígitos (com DDD)
    if (telefone.length < 10 || telefone.length > 11) {
      return { telefoneInvalido: true };
    }

    return null;
  };
}

/**
 * Validador assíncrono: Email único
 * Verifica no servidor se email já existe
 * RxJS: timer + switchMap + map
 */
export function emailUnicValidator(idAtual?: number): AsyncValidatorFn {
  const usuarioService = inject(UsuarioService);
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() => usuarioService.verificarEmailExistente(control.value, idAtual)),
      map(existe => (existe ? { emailJaExiste: true } : null))
    );
  };
}

/**
 * Validador assíncrono: CPF único
 * Verifica no servidor se CPF já existe
 * RxJS: timer + switchMap + map
 */
export function cpfUnicoValidator(idAtual?: number): AsyncValidatorFn {
  const usuarioService = inject(UsuarioService);
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() => usuarioService.verificarCpfExistente(control.value, idAtual)),
      map(existe => (existe ? { cpfJaExiste: true } : null))
    );
  };
}

/**
 * Validador customizado: Comparar senhas (exemplo reutilizável)
 */
export function compararSenhasValidator(
  senhaFieldName: string,
  confirmacaoFieldName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const senha = control.get(senhaFieldName);
    const confirmacao = control.get(confirmacaoFieldName);

    if (!senha || !confirmacao) {
      return null;
    }

    if (senha.value !== confirmacao.value) {
      confirmacao.setErrors({ nenasNaoCombinam: true });
      return { senhasNaoCombinam: true };
    }

    return null;
  };
}
