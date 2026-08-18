import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    SmallInteger,
    Boolean,
    DateTime,
    Date,
    Numeric,
    Text,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Perfil(Base):
    __tablename__ = "perfil"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo = Column(String, unique=True, nullable=False, index=True)
    ativo = Column(Boolean, default=True, nullable=False)

    usuarios = relationship("Usuario", back_populates="perfil")


class AreaAtendimento(Base):
    __tablename__ = "area_atendimento"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # ex: OPERACIONAL, ASSISTENCIAL
    ordem_padrao = Column(SmallInteger, nullable=False)
    meta_tempo_minutos = Column(SmallInteger, nullable=True)
    ativa = Column(Boolean, default=True, nullable=False)

    usuarios = relationship("Usuario", back_populates="area_atendimento")
    etapas = relationship("EtapaJornada", back_populates="area_atendimento")
    pendencias = relationship("Pendencia", back_populates="area_destino")
    encaminhamentos = relationship("Encaminhamento", back_populates="area_destino")


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    perfil_id = Column(UUID(as_uuid=True), ForeignKey("perfil.id"), nullable=False)
    area_atendimento_id = Column(UUID(as_uuid=True), ForeignKey("area_atendimento.id"), nullable=True)

    perfil = relationship("Perfil", back_populates="usuarios")
    area_atendimento = relationship("AreaAtendimento", back_populates="usuarios")

    jornadas_criadas = relationship("Jornada", back_populates="criado_por")
    etapas_responsavel = relationship("EtapaJornada", back_populates="profissional_responsavel")
    formularios_versao_criados = relationship("FormularioVersao", back_populates="criado_por")
    preenchimentos = relationship("PreenchimentoFormulario", back_populates="profissional")
    dados_compartilhados_registrados = relationship("DadoCompartilhado", back_populates="registrado_por")
    pendencias_responsaveis = relationship("Pendencia", back_populates="usuario_responsavel")
    encaminhamentos_criados = relationship("Encaminhamento", back_populates="criado_por")
    registros_profissionais_criados = relationship("RegistroProfissional", back_populates="autor")
    fichas_consolidadas_criadas = relationship("FichaConsolidada", back_populates="gerada_por")
    auditorias = relationship("RegistroAuditoria", back_populates="usuario")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo_publico = Column(String, unique=True, index=True, nullable=False)
    nome_completo = Column(String, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    cpf = Column(String, unique=True, index=True, nullable=False)

    # Mantidos para retrocompatibilidade
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    diagnosis = Column(String, nullable=True)
    treatment_stage = Column(String, default="Diagnóstico")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    contacts = relationship("ContatoPaciente", back_populates="patient", cascade="all, delete-orphan")
    journeys = relationship("Jornada", back_populates="patient", cascade="all, delete-orphan")
    dados_compartilhados = relationship("DadoCompartilhado", back_populates="patient", cascade="all, delete-orphan")
    anexos = relationship("Anexo", back_populates="patient", cascade="all, delete-orphan")


class ContatoPaciente(Base):
    __tablename__ = "contato_paciente"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    nome = Column(String, nullable=False)
    relacao = Column(String, nullable=True)
    telefone = Column(String, nullable=True)
    contato_emergencia = Column(Boolean, default=False, nullable=False)
    cuidador = Column(Boolean, default=False, nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)

    patient = relationship("Patient", back_populates="contacts")
    acompanhamentos = relationship("JornadaAcompanhante", back_populates="contato_paciente", cascade="all, delete-orphan")


class Jornada(Base):
    __tablename__ = "jornada"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    criado_por_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    codigo = Column(String, unique=True, index=True, nullable=False)
    data_acolhimento = Column(Date, nullable=False)
    status = Column(String, default="AGUARDANDO", nullable=False)  # AGUARDANDO, EM_ATENDIMENTO, PENDENTE, FINALIZADA, CANCELADA
    chegada_em = Column(DateTime, nullable=True)
    iniciada_em = Column(DateTime, nullable=True)
    finalizada_em = Column(DateTime, nullable=True)
    saida_em = Column(DateTime, nullable=True)
    diagnostico_principal = Column(String, nullable=True)
    fase_tratamento = Column(String, nullable=True)
    origem = Column(String, nullable=True)
    observacao_geral = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="journeys")
    criado_por = relationship("Usuario", back_populates="jornadas_criadas")

    acompanhantes = relationship("JornadaAcompanhante", back_populates="jornada", cascade="all, delete-orphan")
    etapas = relationship("EtapaJornada", back_populates="jornada", cascade="all, delete-orphan")
    dados_compartilhados = relationship("DadoCompartilhado", back_populates="jornada")
    pendencias = relationship("Pendencia", back_populates="jornada", cascade="all, delete-orphan")
    encaminhamentos = relationship("Encaminhamento", back_populates="jornada", cascade="all, delete-orphan")
    anexos = relationship("Anexo", back_populates="jornada")
    fichas_consolidadas = relationship("FichaConsolidada", back_populates="jornada", cascade="all, delete-orphan")


class JornadaAcompanhante(Base):
    __tablename__ = "jornada_acompanhante"

    jornada_id = Column(UUID(as_uuid=True), ForeignKey("jornada.id"), primary_key=True)
    contato_paciente_id = Column(UUID(as_uuid=True), ForeignKey("contato_paciente.id"), primary_key=True)
    observacao = Column(Text, nullable=True)

    jornada = relationship("Jornada", back_populates="acompanhantes")
    contato_paciente = relationship("ContatoPaciente", back_populates="acompanhamentos")


class EtapaJornada(Base):
    __tablename__ = "etapa_jornada"
    __table_args__ = (
        UniqueConstraint("jornada_id", "area_atendimento_id", name="uq_jornada_area"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jornada_id = Column(UUID(as_uuid=True), ForeignKey("jornada.id"), nullable=False)
    area_atendimento_id = Column(UUID(as_uuid=True), ForeignKey("area_atendimento.id"), nullable=False)
    profissional_responsavel_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=True)
    status = Column(String, default="PENDENTE", nullable=False)  # PENDENTE, EM_ATENDIMENTO, ATENDIDO, NAO_SE_APLICA
    ordem = Column(SmallInteger, nullable=False)
    prioridade = Column(SmallInteger, nullable=False)
    iniciada_em = Column(DateTime, nullable=True)
    finalizada_em = Column(DateTime, nullable=True)
    motivo_nao_aplicavel = Column(Text, nullable=True)
    observacao = Column(Text, nullable=True)

    jornada = relationship("Jornada", back_populates="etapas")
    area_atendimento = relationship("AreaAtendimento", back_populates="etapas")
    profissional_responsavel = relationship("Usuario", back_populates="etapas_responsavel")

    preenchimentos = relationship("PreenchimentoFormulario", back_populates="etapa_jornada")
    pendencias_origem = relationship("Pendencia", back_populates="etapa_origem")
    encaminhamentos_origem = relationship("Encaminhamento", back_populates="etapa_origem")
    registro_profissionais = relationship("RegistroProfissional", back_populates="etapa_jornada")
    anexos = relationship("Anexo", back_populates="etapa_jornada")


class Formulario(Base):
    __tablename__ = "formulario"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)

    versoes = relationship("FormularioVersao", back_populates="formulario")


class FormularioVersao(Base):
    __tablename__ = "formulario_versao"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    formulario_id = Column(UUID(as_uuid=True), ForeignKey("formulario.id"), nullable=False)
    criado_por_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    versao = Column(Integer, nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)

    formulario = relationship("Formulario", back_populates="versoes")
    criado_por = relationship("Usuario", back_populates="formularios_versao_criados")

    campos = relationship("CampoFormulario", back_populates="formulario_versao")
    preenchimentos = relationship("PreenchimentoFormulario", back_populates="formulario_versao")


class CampoFormulario(Base):
    __tablename__ = "campo_formulario"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    formulario_versao_id = Column(UUID(as_uuid=True), ForeignKey("formulario_versao.id"), nullable=False)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # DATA, DATA_HORA, SELECAO_UNICA, SELECAO_MULTIPLA, ESCALA, TEXTO, NUMERO, BOOLEANO
    ordem_exibicao = Column(SmallInteger, nullable=False)
    ativo_versao = Column(Boolean, default=True, nullable=False)

    formulario_versao = relationship("FormularioVersao", back_populates="campos")
    opcoes = relationship("CampoOpcao", back_populates="campo_formulario")
    respostas = relationship("Resposta", back_populates="campo_formulario")


class CampoOpcao(Base):
    __tablename__ = "campo_opcao"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campo_formulario_id = Column(UUID(as_uuid=True), ForeignKey("campo_formulario.id"), nullable=False)
    valor = Column(String, nullable=False)
    pontuacao = Column(SmallInteger, nullable=True)

    campo_formulario = relationship("CampoFormulario", back_populates="opcoes")


class PreenchimentoFormulario(Base):
    __tablename__ = "preenchimento_formulario"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etapa_jornada_id = Column(UUID(as_uuid=True), ForeignKey("etapa_jornada.id"), nullable=False)
    formulario_versao_id = Column(UUID(as_uuid=True), ForeignKey("formulario_versao.id"), nullable=False)
    profissional_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    status = Column(String, default="RASCUNHO", nullable=False)  # RASCUNHO, FINALIZADO, CANCELADO

    etapa_jornada = relationship("EtapaJornada", back_populates="preenchimentos")
    formulario_versao = relationship("FormularioVersao", back_populates="preenchimentos")
    profissional = relationship("Usuario", back_populates="preenchimentos")

    respostas = relationship("Resposta", back_populates="preenchimento")


class Resposta(Base):
    __tablename__ = "resposta"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    preenchimento_id = Column(UUID(as_uuid=True), ForeignKey("preenchimento_formulario.id"), nullable=False)
    campo_formulario_id = Column(UUID(as_uuid=True), ForeignKey("campo_formulario.id"), nullable=False)
    valor_texto = Column(Text, nullable=True)
    valor_numero = Column(Numeric, nullable=True)
    valor_booleano = Column(Boolean, nullable=True)
    valor_data = Column(Date, nullable=True)

    preenchimento = relationship("PreenchimentoFormulario", back_populates="respostas")
    campo_formulario = relationship("CampoFormulario", back_populates="respostas")
    dados_compartilhados = relationship("DadoCompartilhado", back_populates="resposta_origem")


class DadoCompartilhadoDef(Base):
    __tablename__ = "dado_compartilhado_def"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # TEXTO, NUMERO, BOOLEANO, DATA
    ativo = Column(Boolean, default=True, nullable=False)

    valores = relationship("DadoCompartilhado", back_populates="definicao")


class DadoCompartilhado(Base):
    __tablename__ = "dado_compartilhado"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    definicao_id = Column(UUID(as_uuid=True), ForeignKey("dado_compartilhado_def.id"), nullable=False)
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    jornada_id = Column(UUID(as_uuid=True), ForeignKey("jornada.id"), nullable=True)
    registrado_por_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    resposta_origem_id = Column(UUID(as_uuid=True), ForeignKey("resposta.id"), nullable=True)
    valor_texto = Column(Text, nullable=True)
    valor_numero = Column(Numeric, nullable=True)
    valor_booleano = Column(Boolean, nullable=True)
    valor_data = Column(Date, nullable=True)
    registrado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    encerrado_em = Column(DateTime, nullable=True)
    atual = Column(Boolean, default=True, nullable=False)

    definicao = relationship("DadoCompartilhadoDef", back_populates="valores")
    patient = relationship("Patient", back_populates="dados_compartilhados")
    jornada = relationship("Jornada", back_populates="dados_compartilhados")
    registrado_por = relationship("Usuario", back_populates="dados_compartilhados_registrados")
    resposta_origem = relationship("Resposta", back_populates="dados_compartilhados")


class Pendencia(Base):
    __tablename__ = "pendencia"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jornada_id = Column(UUID(as_uuid=True), ForeignKey("jornada.id"), nullable=False)
    etapa_origem_id = Column(UUID(as_uuid=True), ForeignKey("etapa_jornada.id"), nullable=True)
    area_destino_id = Column(UUID(as_uuid=True), ForeignKey("area_atendimento.id"), nullable=True)
    usuario_responsavel_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=True)
    descricao = Column(Text, nullable=False)
    prioridade = Column(String, nullable=True)
    status = Column(String, default="PENDENTE", nullable=False)  # PENDENTE, EM_ANDAMENTO, RESOLVIDA, CANCELADA
    prazo = Column(DateTime, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolvida_em = Column(DateTime, nullable=True)

    jornada = relationship("Jornada", back_populates="pendencias")
    etapa_origem = relationship("EtapaJornada", back_populates="pendencias_origem")
    area_destino = relationship("AreaAtendimento", back_populates="pendencias")
    usuario_responsavel = relationship("Usuario", back_populates="pendencias_responsaveis")


class Encaminhamento(Base):
    __tablename__ = "encaminhamento"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jornada_id = Column(UUID(as_uuid=True), ForeignKey("jornada.id"), nullable=False)
    etapa_origem_id = Column(UUID(as_uuid=True), ForeignKey("etapa_jornada.id"), nullable=False)
    criado_por_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    area_destino_id = Column(UUID(as_uuid=True), ForeignKey("area_atendimento.id"), nullable=True)
    destino_externo = Column(String, nullable=True)
    status = Column(String, default="PENDENTE", nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    concluido_em = Column(DateTime, nullable=True)

    jornada = relationship("Jornada", back_populates="encaminhamentos")
    etapa_origem = relationship("EtapaJornada", back_populates="encaminhamentos_origem")
    criado_por = relationship("Usuario", back_populates="encaminhamentos_criados")
    area_destino = relationship("AreaAtendimento", back_populates="encaminhamentos")


class RegistroProfissional(Base):
    __tablename__ = "registro_profissional"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etapa_jornada_id = Column(UUID(as_uuid=True), ForeignKey("etapa_jornada.id"), nullable=False)
    autor_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    tipo = Column(String, nullable=False)  # OBSERVACAO, EVOLUCAO, AVALIACAO, CONDUTA
    texto = Column(Text, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    etapa_jornada = relationship("EtapaJornada", back_populates="registro_profissionais")
    autor = relationship("Usuario", back_populates="registros_profissionais_criados")


class Anexo(Base):
    __tablename__ = "anexo"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    jornada_id = Column(UUID(as_uuid=True), ForeignKey("jornada.id"), nullable=True)
    etapa_jornada_id = Column(UUID(as_uuid=True), ForeignKey("etapa_jornada.id"), nullable=True)
    nome = Column(String, nullable=False)
    caminho = Column(String, nullable=False)
    hash = Column(String, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="anexos")
    jornada = relationship("Jornada", back_populates="anexos")
    etapa_jornada = relationship("EtapaJornada", back_populates="anexos")


class FichaConsolidada(Base):
    __tablename__ = "ficha_consolidada"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jornada_id = Column(UUID(as_uuid=True), ForeignKey("jornada.id"), nullable=False)
    gerada_por_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    versao = Column(Integer, nullable=False)
    caminho_arquivo = Column(String, nullable=False)
    hash_arquivo = Column(String, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    jornada = relationship("Jornada", back_populates="fichas_consolidadas")
    gerada_por = relationship("Usuario", back_populates="fichas_consolidadas_criadas")


class RegistroAuditoria(Base):
    __tablename__ = "registro_auditoria"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    acao = Column(String, nullable=False)
    detalhe = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    usuario = relationship("Usuario", back_populates="auditorias")
