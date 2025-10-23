import { Cliente } from '../../clientes/schemas/clientes.schema';

export class PedidoOutputDTO {
  _id?: string;
  codigo: number;
  datas: {
    baixa_pcp?: Date;
    finalizacao?: Date;
    pedido: Date;
  };
  atraso: {
    dias: number;
    investigacao?: string;
    motivo?: string;
  };
  descricao?: string;
  cliente?: Cliente; // substitui cliente_codigo
  faca: {
    _id: string;
    codigo: string;
    tipo?: string;
    medida?: string;
    largura?: number;
    altura?: number;
    colunas?: number;
    fator?: number;
    numero_de_dentes?: number;
    l1_corte?: number;
  }; // lookup aplicado
  detalhes: {
    tipo_de_servico?: string; // calculado
    acabamento_cold: boolean;
    amostra: boolean;
    desconsiderar_metragem: boolean;
    redimensionamento: boolean;
    retrabalho: boolean;
    segmento?: 'Digital' | 'Novo' | 'Casa'; // calculado
  };
  producao: {
    cores: number;
    pistas_de_corte: number;
    metros_por_pacote: number;
    quantidade_por_pacote: number;
    metragem_linear: number;
    unidades_produzidas: number;
    material?: {
      _id: string;
      codigo: number;
      largura_mm: number;
      materia_prima?: {
        _id: string;
        nome: string;
        tipo: string;
      };
    }; // lookup aplicado
    total_m2: number; // calculado
    producao_m2: number; // calculado
    algo_novo?: string[];
  };
  perda: {
    investigacao: string;
    motivo?: string;
    justificativa?: string;
    m2: number; // calculado
    porcentagem: number; // calculado
  };
  impressores?: {
    operador: string;
    metragem_linear: number;
    metragem_quadrada: number;
    perda_metragem_quadrada: number;
    maquina_codigo: number;
    maquina?: {
      _id: string;
      codigo: number;
      tipos: string[];
      atividades: ('Corte' | 'Impressão' | 'Revisão')[];
    };
  }[];
  cortadores?: {
    operador: string;
    metragem_linear: number;
    metragem_quadrada: number;
    perda_metragem_quadrada: number;
    maquina?: {
      _id: string;
      codigo: number;
      tipos: string[];
      atividades: ('Corte' | 'Impressão' | 'Revisão')[];
    };
  }[];
  revisores?: {
    operador: string;
    metragem_linear: number;
    metragem_quadrada: number;
    maquina?: {
      _id: string;
      codigo: number;
      tipos: string[];
      atividades: ('Corte' | 'Impressão' | 'Revisão')[];
    };
  }[];
  nc?: {
    checklist: boolean;
    rastreio: boolean;
  };
  observacao?: string;
  pasta_de_arquivamento?: string;
  validado?: boolean;
}
