export class ClienteOutputDto {
  _id?: string;

  codigo!: number;

  nome_fantasia?: string | null;

  razao_social?: string | null;

  contato_compras?: string | null;

  contato_financeiro?: string | null;

  email?: string | null;

  fone_1?: string | null;

  fone_2?: string | null;

  vendedor?: string | null;
}