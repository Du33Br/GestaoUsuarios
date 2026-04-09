import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validarCPF, validarEmail, validarTelefone } from './usuarios.validators';
import { FormControl } from '@angular/forms';

describe('Validadores de Usuários', () => {
  describe('validarCPF', () => {
    it('deve aceitar CPF válido', () => {
      const control = new FormControl('111.444.777-35'); // CPF válido
      const validator = validarCPF();
      expect(validator(control)).toBeNull();
    });

    it('deve rejeitar CPF com formato inválido', () => {
      const control = new FormControl('123.456.789-10');
      const validator = validarCPF();
      const resultado = validator(control);
      expect(resultado).toEqual({ cpfInvalido: true });
    });

    it('deve rejeitar CPF vazio', () => {
      const control = new FormControl('');
      const validator = validarCPF();
      expect(validator(control)).toBeNull(); // Deixa para 'required'
    });

    it('deve rejeitar CPF com todos dígitos iguais', () => {
      const control = new FormControl('111.111.111-11');
      const validator = validarCPF();
      const resultado = validator(control);
      expect(resultado).toEqual({ cpfInvalido: true });
    });

    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      const control = new FormControl('123.456.789');
      const validator = validarCPF();
      const resultado = validator(control);
      expect(resultado).toEqual({ cpfInvalido: true });
    });
  });

  describe('validarEmail', () => {
    it('deve aceitar email válido', () => {
      const control = new FormControl('usuario@email.com');
      const validator = validarEmail();
      expect(validator(control)).toBeNull();
    });

    it('deve rejeitar email sem @', () => {
      const control = new FormControl('usuarioemail.com');
      const validator = validarEmail();
      const resultado = validator(control);
      expect(resultado).toEqual({ emailInvalido: true });
    });

    it('deve rejeitar email sem domínio', () => {
      const control = new FormControl('usuario@');
      const validator = validarEmail();
      const resultado = validator(control);
      expect(resultado).toEqual({ emailInvalido: true });
    });

    it('deve rejeitar email vazio', () => {
      const control = new FormControl('');
      const validator = validarEmail();
      expect(validator(control)).toBeNull();
    });
  });

  describe('validarTelefone', () => {
    it('deve aceitar telefone com 10 dígitos', () => {
      const control = new FormControl('(11) 3456-7890');
      const validator = validarTelefone();
      expect(validator(control)).toBeNull();
    });

    it('deve aceitar telefone com 11 dígitos', () => {
      const control = new FormControl('(11) 98765-4321');
      const validator = validarTelefone();
      expect(validator(control)).toBeNull();
    });

    it('deve rejeitar telefone com menos de 10 dígitos', () => {
      const control = new FormControl('(11) 345-678');
      const validator = validarTelefone();
      const resultado = validator(control);
      expect(resultado).toEqual({ telefoneInvalido: true });
    });

    it('deve rejeitar telefone com mais de 11 dígitos', () => {
      const control = new FormControl('(11) 98765-4321-00');
      const validator = validarTelefone();
      const resultado = validator(control);
      expect(resultado).toEqual({ telefoneInvalido: true });
    });
  });
});
