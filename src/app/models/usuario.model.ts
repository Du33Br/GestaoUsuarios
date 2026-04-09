/**
 * Modelo de Usuário
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoTelefone: 'celular' | 'comercial' | 'residencial';
  criadoEm: Date;
}

export type UsuarioForm = Omit<Usuario, 'id' | 'criadoEm'>;
export type UsuarioParaEditar = Partial<UsuarioForm> & { id: number };
