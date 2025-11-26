import { ClienteOutputDto } from 'src/collections/clientes/dto/cliente-output.dto';

export class PedidoOutputDTO {
  codigo: number;
  datas: {
    baixa_pcp?: Date;
    finalizacao?: Date;
    pedido: Date;
    previsao: Date;
  };
  atraso: {
    dias?: number;
    investigacao?: string;
    motivo?: string;
    desconsiderar?: boolean;
  };
  descricao?: string;
  cliente?: ClienteOutputDto;
  faca: {
    codigo: string;
    tipo?: string;
    medida?: string;
    largura?: number;
    altura?: number;
    colunas?: number;
    fator?: number;
    numero_de_dentes?: number;
    l1_corte?: number;
  };
  detalhes: {
    tipo_de_servico?: string;
    acabamento_cold: boolean;
    amostra: boolean;
    desconsiderar_metragem: boolean;
    redimensionamento: boolean;
    retrabalho: boolean;
    segmento?: 'Digital' | 'Novo' | 'Casa';
  };
  producao: {
    cores: number;
    pistas_de_corte: number;
    metros_por_pacote: number;
    quantidade_por_pacote: number;
    metragem_linear: number;
    unidades_produzidas: number;
    material?: {
      codigo: number;
      largura_mm: number;
      materia_prima?: {
        codigo: number;
        nome: string;
        tipo: string;
      };
    };
    total_m2: number;
    producao_m2: number;
    algo_novo?: string[];
  };
  perda: {
    investigacao?: string;
    motivo?: string;
    justificativa?: string;
    m2: number;
    porcentagem: number;
  };
  impressores?: {
    operador: string;
    metragem_linear: number;
    metragem_quadrada: number;
    perda_metragem_quadrada: number;
    maquina: {
      codigo: number;
    };
  }[];
  cortadores?: {
    operador: string;
    metragem_linear: number;
    metragem_quadrada: number;
    perda_metragem_quadrada: number;
    maquina: {
      codigo: number;
    };
  }[];
  revisores?: {
    operador: string;
    metragem_linear: number;
    metragem_quadrada: number;
    maquina: {
      codigo: number;
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
