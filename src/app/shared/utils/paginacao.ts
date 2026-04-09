/**
 * SEÇÃO 1.2 — Generics e Paginação
 *
 * Implementa a função genérica e pura `filtrarEPaginar<T>` que:
 *  - Aceita qualquer tipo `T`
 *  - Aplica um predicado de filtro arbitrário
 *  - Fatia os resultados conforme os parâmetros de página
 *  - É pura (sem efeitos colaterais, sem mutações)
 */

import { Usuario } from '../../models/usuario.model';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PaginaParams {
  /** Página atual (base 1) */
  pagina: number;
  /** Quantidade de itens por página */
  itensPorPagina: number;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
  temProxima: boolean;
  temAnterior: boolean;
}

// ─── Função genérica pura ────────────────────────────────────────────────────

/**
 * Filtra um array pelo predicado e retorna a página solicitada.
 *
 * @param data         Array de entrada (qualquer tipo T)
 * @param filterFn     Predicado de filtro — recebe um item e retorna boolean
 * @param params       Parâmetros de paginação ({ pagina, itensPorPagina })
 * @returns            Objeto Pagina<T> com os itens da página e metadados
 *
 * @example
 * const resultado = filtrarEPaginar(
 *   usuarios,
 *   u => u.nome.toLowerCase().includes('joão'),
 *   { pagina: 1, itensPorPagina: 5 }
 * );
 */
export function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams
): Pagina<T> {
  const { pagina, itensPorPagina } = params;

  // 1. Filtrar
  const filtrados = data.filter(filterFn);

  // 2. Calcular metadados
  const total = filtrados.length;
  const totalPaginas = Math.ceil(total / itensPorPagina);
  const paginaSegura = Math.max(1, Math.min(pagina, totalPaginas || 1));

  // 3. Fatiar (slice é imutável)
  const inicio = (paginaSegura - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const itens = filtrados.slice(inicio, fim);

  return {
    itens,
    total,
    pagina: paginaSegura,
    totalPaginas,
    temProxima: paginaSegura < totalPaginas,
    temAnterior: paginaSegura > 1,
  };
}

// ─── Demonstração com Usuario ────────────────────────────────────────────────

const usuariosExemplo: Usuario[] = [
  { id: 1, nome: 'João Silva',   email: 'joao@email.com',   cpf: '111.444.777-35', telefone: '11999990001', tipoTelefone: 'celular',     criadoEm: new Date() },
  { id: 2, nome: 'Maria Souza',  email: 'maria@email.com',  cpf: '529.982.247-25', telefone: '11999990002', tipoTelefone: 'celular',     criadoEm: new Date() },
  { id: 3, nome: 'Pedro Lima',   email: 'pedro@email.com',  cpf: '871.263.988-78', telefone: '11999990003', tipoTelefone: 'comercial',   criadoEm: new Date() },
  { id: 4, nome: 'Ana Costa',    email: 'ana@email.com',    cpf: '153.509.460-56', telefone: '11999990004', tipoTelefone: 'residencial', criadoEm: new Date() },
  { id: 5, nome: 'João Pedro',   email: 'joaop@email.com',  cpf: '182.795.494-04', telefone: '11999990005', tipoTelefone: 'celular',     criadoEm: new Date() },
];

/**
 * Uso real: buscar usuários cujo nome contém "João", página 1, 2 itens por página.
 *
 * Resultado esperado:
 *   itens: [João Silva, João Pedro]
 *   total: 2, pagina: 1, totalPaginas: 1
 */
export const demonstracao = filtrarEPaginar<Usuario>(
  usuariosExemplo,
  u => u.nome.toLowerCase().includes('joão'),
  { pagina: 1, itensPorPagina: 2 }
);
