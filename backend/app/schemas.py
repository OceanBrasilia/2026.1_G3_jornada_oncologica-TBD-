from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# Schema base para Perfil
class PerfilBase(BaseModel):
    codigo: str
    ativo: Optional[bool] = True


class PerfilCreate(PerfilBase):
    pass


class PerfilResponse(PerfilBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Área de Atendimento
class AreaAtendimentoBase(BaseModel):
    nome: str
    tipo: str
    ordem_padrao: int
    meta_tempo_minutos: Optional[int] = None
    ativa: Optional[bool] = True


class AreaAtendimentoCreate(AreaAtendimentoBase):
    pass


class AreaAtendimentoResponse(AreaAtendimentoBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Usuário
class UsuarioBase(BaseModel):
    nome: str
    perfil_id: UUID
    area_atendimento_id: Optional[UUID] = None


class UsuarioCreate(UsuarioBase):
    pass


class UsuarioResponse(UsuarioBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Paciente (mantendo suporte aos campos antigos)
class PatientBase(BaseModel):
    codigo_publico: str
    nome_completo: str
    data_nascimento: date
    cpf: str

    # Suporte legado
    name: Optional[str] = None
    email: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_stage: Optional[str] = "Diagnóstico"


class PatientCreate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema base para Contato do Paciente
class ContatoPacienteBase(BaseModel):
    paciente_id: UUID
    nome: str
    relacao: Optional[str] = None
    telefone: Optional[str] = None
    contato_emergencia: Optional[bool] = False
    cuidador: Optional[bool] = False
    ativo: Optional[bool] = True


class ContatoPacienteCreate(ContatoPacienteBase):
    pass


class ContatoPacienteResponse(ContatoPacienteBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema para Acompanhante da Jornada
class JornadaAcompanhanteBase(BaseModel):
    jornada_id: UUID
    contato_paciente_id: UUID
    observacao: Optional[str] = None


class JornadaAcompanhanteCreate(JornadaAcompanhanteBase):
    pass


class JornadaAcompanhanteResponse(JornadaAcompanhanteBase):
    model_config = ConfigDict(from_attributes=True)


# Schema base para Jornada
class JornadaBase(BaseModel):
    paciente_id: UUID
    criado_por_id: UUID
    codigo: str
    data_acolhimento: date
    status: Optional[str] = "AGUARDANDO"
    chegada_em: Optional[datetime] = None
    iniciada_em: Optional[datetime] = None
    finalizada_em: Optional[datetime] = None
    saida_em: Optional[datetime] = None
    diagnostico_principal: Optional[str] = None
    fase_tratamento: Optional[str] = None
    origem: Optional[str] = None
    observacao_geral: Optional[str] = None


class JornadaCreate(JornadaBase):
    pass


class JornadaResponse(JornadaBase):
    id: UUID
    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema base para Etapa da Jornada
class EtapaJornadaBase(BaseModel):
    jornada_id: UUID
    area_atendimento_id: UUID
    profissional_responsavel_id: Optional[UUID] = None
    status: Optional[str] = "PENDENTE"
    ordem: int
    prioridade: int
    iniciada_em: Optional[datetime] = None
    finalizada_em: Optional[datetime] = None
    motivo_nao_aplicavel: Optional[str] = None
    observacao: Optional[str] = None


class EtapaJornadaCreate(EtapaJornadaBase):
    pass


class EtapaJornadaResponse(EtapaJornadaBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Formulário
class FormularioBase(BaseModel):
    nome: str
    ativo: Optional[bool] = True


class FormularioCreate(FormularioBase):
    pass


class FormularioResponse(FormularioBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Versão de Formulário
class FormularioVersaoBase(BaseModel):
    formulario_id: UUID
    criado_por_id: UUID
    versao: int
    ativo: Optional[bool] = True


class FormularioVersaoCreate(FormularioVersaoBase):
    pass


class FormularioVersaoResponse(FormularioVersaoBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Campo do Formulário
class CampoFormularioBase(BaseModel):
    formulario_versao_id: UUID
    nome: str
    tipo: str
    ordem_exibicao: int
    ativo_versao: Optional[bool] = True


class CampoFormularioCreate(CampoFormularioBase):
    pass


class CampoFormularioResponse(CampoFormularioBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Opção de Campo
class CampoOpcaoBase(BaseModel):
    campo_formulario_id: UUID
    valor: str
    pontuacao: Optional[int] = None


class CampoOpcaoCreate(CampoOpcaoBase):
    pass


class CampoOpcaoResponse(CampoOpcaoBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Preenchimento de Formulário
class PreenchimentoFormularioBase(BaseModel):
    etapa_jornada_id: UUID
    formulario_versao_id: UUID
    profissional_id: UUID
    status: Optional[str] = "RASCUNHO"


class PreenchimentoFormularioCreate(PreenchimentoFormularioBase):
    pass


class PreenchimentoFormularioResponse(PreenchimentoFormularioBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Resposta
class RespostaBase(BaseModel):
    preenchimento_id: UUID
    campo_formulario_id: UUID
    valor_texto: Optional[str] = None
    valor_numero: Optional[Decimal] = None
    valor_booleano: Optional[bool] = None
    valor_data: Optional[date] = None


class RespostaCreate(RespostaBase):
    pass


class RespostaResponse(RespostaBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Definição de Dado Compartilhado
class DadoCompartilhadoDefBase(BaseModel):
    nome: str
    tipo: str
    ativo: Optional[bool] = True


class DadoCompartilhadoDefCreate(DadoCompartilhadoDefBase):
    pass


class DadoCompartilhadoDefResponse(DadoCompartilhadoDefBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Schema base para Dado Compartilhado
class DadoCompartilhadoBase(BaseModel):
    definicao_id: UUID
    paciente_id: UUID
    jornada_id: Optional[UUID] = None
    registrado_por_id: UUID
    resposta_origem_id: Optional[UUID] = None
    valor_texto: Optional[str] = None
    valor_numero: Optional[Decimal] = None
    valor_booleano: Optional[bool] = None
    valor_data: Optional[date] = None
    encerrado_em: Optional[datetime] = None
    atual: Optional[bool] = True


class DadoCompartilhadoCreate(DadoCompartilhadoBase):
    pass


class DadoCompartilhadoResponse(DadoCompartilhadoBase):
    id: UUID
    registrado_em: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema base para Pendência
class PendenciaBase(BaseModel):
    jornada_id: UUID
    etapa_origem_id: Optional[UUID] = None
    area_destino_id: Optional[UUID] = None
    usuario_responsavel_id: Optional[UUID] = None
    descricao: str
    prioridade: Optional[str] = None
    status: Optional[str] = "PENDENTE"
    prazo: Optional[datetime] = None
    resolvida_em: Optional[datetime] = None


class PendenciaCreate(PendenciaBase):
    pass


class PendenciaResponse(PendenciaBase):
    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema base para Encaminhamento
class EncaminhamentoBase(BaseModel):
    jornada_id: UUID
    etapa_origem_id: UUID
    criado_por_id: UUID
    area_destino_id: Optional[UUID] = None
    destino_externo: Optional[str] = None
    status: Optional[str] = "PENDENTE"
    concluido_em: Optional[datetime] = None


class EncaminhamentoCreate(EncaminhamentoBase):
    pass


class EncaminhamentoResponse(EncaminhamentoBase):
    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema base para Registro Profissional
class RegistroProfissionalBase(BaseModel):
    etapa_jornada_id: UUID
    autor_id: UUID
    tipo: str
    texto: str


class RegistroProfissionalCreate(RegistroProfissionalBase):
    pass


class RegistroProfissionalResponse(RegistroProfissionalBase):
    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema base para Anexo
class AnexoBase(BaseModel):
    paciente_id: UUID
    jornada_id: Optional[UUID] = None
    etapa_jornada_id: Optional[UUID] = None
    nome: str
    caminho: str
    hash: Optional[str] = None


class AnexoCreate(AnexoBase):
    pass


class AnexoResponse(AnexoBase):
    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema base para Ficha Consolidada
class FichaConsolidadaBase(BaseModel):
    jornada_id: UUID
    gerada_por_id: UUID
    versao: int
    caminho_arquivo: str
    hash_arquivo: Optional[str] = None


class FichaConsolidadaCreate(FichaConsolidadaBase):
    pass


class FichaConsolidadaResponse(FichaConsolidadaBase):
    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema base para Registro de Auditoria
class RegistroAuditoriaBase(BaseModel):
    usuario_id: UUID
    acao: str
    detalhe: Optional[str] = None


class RegistroAuditoriaCreate(RegistroAuditoriaBase):
    pass


class RegistroAuditoriaResponse(RegistroAuditoriaBase):
    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
