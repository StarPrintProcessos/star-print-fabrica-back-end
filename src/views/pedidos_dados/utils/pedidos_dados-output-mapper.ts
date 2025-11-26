import { PedidoOutputDTO } from "../dto/pedido-output-dto";
import { PedidoDadosDatabaseDTO } from "../dto/pedidos_dados-database.dto";

export function mapPedidosDadosToOutput(p: PedidoDadosDatabaseDTO): PedidoOutputDTO {
  return {
    codigo: p.codigo_pedido!,

    datas: {
      pedido: p.data_pedido!,
      baixa_pcp: p.data_baixa_pcp ?? undefined,
      finalizacao: p.data_finalizacao ?? undefined,
      previsao: p.data_previsao!,
    },

    atraso: {
      dias: p.data_finalizacao ? (p.divergencia_dias_uteis ?? 0) : undefined,
      investigacao: p.atraso_investigacao ?? undefined,
      motivo: p.atraso_motivo ?? undefined,
      desconsiderar: p.atraso_desconsiderar ?? false
    },

    descricao: p.descricao ?? undefined,

    cliente: p.cliente_codigo
      ? {
          codigo: p.cliente_codigo,
          nome_fantasia: p.cliente_nome_fantasia ?? undefined,
          razao_social: p.cliente_razao_social ?? undefined,
        }
      : undefined,

    faca: {
      codigo: p.codigo_faca ?? "",
      tipo: p.tipo_faca ?? undefined,
      largura: p.largura_faca ?? undefined,
      altura: p.altura_faca ?? undefined,
      colunas: p.colunas_faca ?? undefined,
      fator: p.fator_faca ?? undefined,
      numero_de_dentes: p.numero_de_dentes_faca ?? undefined,
      l1_corte: p.l1_corte_faca ?? undefined
    },

    detalhes: {
      acabamento_cold: p.acabamento_cold ?? false,
      amostra: p.eh_amostra ?? false,
      desconsiderar_metragem: p.desconsiderar_metragem ?? false,
      retrabalho: p.retrabalho ?? false,
      redimensionamento: p.redimensionamento ?? false,
      segmento: (p.segmento as any) ?? undefined,
    },

    producao: {
      cores: p.cores ?? 0,
      pistas_de_corte: p.pistas_de_corte ?? 0,
      metros_por_pacote: p.metros_por_pacote ?? 0,
      quantidade_por_pacote: p.quantidade_por_pacote ?? 0,
      metragem_linear: p.metragem_linear ?? 0,
      unidades_produzidas: p.unidades_produzidas ?? 0,

      material: p.largura_material_mm
        ? {
            codigo: p.material_codigo ?? 0,
            largura_mm: p.largura_material_mm,
            materia_prima: p.nome_materia_prima
              ? {
                  codigo: p.materia_prima_codigo ?? 0,
                  nome: p.nome_materia_prima,
                  tipo: p.tipo_materia_prima ?? "",
                }
              : undefined,
          }
        : undefined,

      total_m2: p.metragem_total_m2 ?? 0,
      producao_m2: p.producao_m2 ?? 0,

      algo_novo: p.algo_novo ?? [],
    },

    perda: {
      investigacao: p.perda_investigacao ?? undefined,
      motivo: p.perda_motivo ?? undefined,
      justificativa: p.perda_justificativa ?? undefined,
      m2: p.perda_m2 ?? 0,
      porcentagem: p.perda_percentual ?? 0,
    },

    // ======================
    // OPERADORES
    // ======================
    impressores: p.operacoes
      ? (p.operacoes as any[])
          .filter(o => o.tipo === "Impressão")
          .map(o => ({
            operador: o.operador_nome,
            metragem_linear: o.metragem_linear,
            metragem_quadrada: o.metragem_quadrada,
            perda_metragem_quadrada: o.perda_metragem_quadrada,
            maquina: {
              codigo: o.maquina_codigo
            }
          }))
      : undefined,

    cortadores: p.operacoes
      ? (p.operacoes as any[])
          .filter(o => o.tipo === "Corte")
          .map(o => ({
            operador: o.operador_nome,
            metragem_linear: o.metragem_linear,
            metragem_quadrada: o.metragem_quadrada,
            perda_metragem_quadrada: o.perda_metragem_quadrada,
            maquina: {
              codigo: o.maquina_codigo
            }
          }))
      : undefined,

    revisores: p.operacoes
      ? (p.operacoes as any[])
          .filter(o => o.tipo === "Revisão")
          .map(o => ({
            operador: o.operador_nome,
            metragem_linear: o.metragem_linear,
            metragem_quadrada: o.metragem_quadrada,
            maquina: {
              codigo: o.maquina_codigo
            }
          }))
      : undefined,

    nc: {
        checklist: p.nc_checklist ?? false,
        rastreio: p.nc_rastreio ?? false
    },
    observacao: p.observacao ?? undefined,
    pasta_de_arquivamento: p.pasta_de_arquivamento ?? undefined,
    validado: p.validado ?? false
  };
}
