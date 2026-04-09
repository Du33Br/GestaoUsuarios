import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Pessoa {
  id: number;
  nome: string;
}

@Injectable()
export class PessoaService {
  private pessoas: Pessoa[] = [
    { id: 1, nome: 'João Silva' },
    { id: 2, nome: 'Maria Souza' },
  ];

  buscarPorId(id: number): Observable<Pessoa> {
    const pessoa = this.pessoas.find(p => p.id === id) ?? { id, nome: 'Desconhecido' };
    return of(pessoa).pipe(delay(500));
  }
}
