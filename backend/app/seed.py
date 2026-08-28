import uuid
from datetime import datetime, date, time
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import (
    Base, Perfil, AreaAtendimento, Usuario, Patient, ContatoPaciente,
    Jornada, JornadaAcompanhante, EtapaJornada, Formulario, FormularioVersao,
    CampoFormulario, CampoOpcao, PreenchimentoFormulario, Resposta,
    DadoCompartilhadoDef, DadoCompartilhado
)

def clean_database(db: Session):
    print("Limpando dados existentes no banco de dados...")
    # Deleta na ordem correta para respeitar restrições de chave estrangeira
    db.query(Resposta).delete()
    db.query(DadoCompartilhado).delete()
    db.query(PreenchimentoFormulario).delete()
    db.query(CampoOpcao).delete()
    db.query(CampoFormulario).delete()
    db.query(FormularioVersao).delete()
    db.query(Formulario).delete()
    db.query(EtapaJornada).delete()
    db.query(JornadaAcompanhante).delete()
    db.query(Jornada).delete()
    db.query(ContatoPaciente).delete()
    db.query(Patient).delete()
    db.query(Usuario).delete()
    db.query(Perfil).delete()
    db.query(AreaAtendimento).delete()
    db.query(DadoCompartilhadoDef).delete()
    db.commit()
    print("Banco de dados limpo com sucesso.")

def seed_data():
    db = SessionLocal()
    try:
        clean_database(db)

        print("Semeando perfis...")
        perfis = {
            "ADMINISTRADOR": Perfil(id=uuid.uuid4(), codigo="ADMINISTRADOR"),
            "PROFISSIONAL": Perfil(id=uuid.uuid4(), codigo="PROFISSIONAL"),
            "RECEPCAO": Perfil(id=uuid.uuid4(), codigo="RECEPCAO")
        }
        for p in perfis.values():
            db.add(p)
        db.commit()

        print("Semeando áreas de atendimento...")
        areas = {
            "recepcao": AreaAtendimento(id=uuid.uuid4(), nome="Recepção", tipo="OPERACIONAL", ordem_padrao=1, meta_tempo_minutos=15),
            "enfermagem": AreaAtendimento(id=uuid.uuid4(), nome="Enfermagem", tipo="ASSISTENCIAL", ordem_padrao=2, meta_tempo_minutos=30),
            "medicina": AreaAtendimento(id=uuid.uuid4(), nome="Medicina", tipo="ASSISTENCIAL", ordem_padrao=3, meta_tempo_minutos=40),
            "nutricao": AreaAtendimento(id=uuid.uuid4(), nome="Nutrição", tipo="ASSISTENCIAL", ordem_padrao=4, meta_tempo_minutos=35),
            "fisioterapia": AreaAtendimento(id=uuid.uuid4(), nome="Fisioterapia", tipo="ASSISTENCIAL", ordem_padrao=5, meta_tempo_minutos=25),
            "servico-social": AreaAtendimento(id=uuid.uuid4(), nome="Serviço Social", tipo="ASSISTENCIAL", ordem_padrao=6, meta_tempo_minutos=30),
            "psicologia": AreaAtendimento(id=uuid.uuid4(), nome="Psicologia", tipo="ASSISTENCIAL", ordem_padrao=7, meta_tempo_minutos=40),
            "odontologia": AreaAtendimento(id=uuid.uuid4(), nome="Odontologia", tipo="ASSISTENCIAL", ordem_padrao=8, meta_tempo_minutos=20),
            "fonoaudiologia": AreaAtendimento(id=uuid.uuid4(), nome="Fonoaudiologia", tipo="ASSISTENCIAL", ordem_padrao=9, meta_tempo_minutos=25),
            "terapia-ocupacional": AreaAtendimento(id=uuid.uuid4(), nome="Terapia Ocupacional", tipo="ASSISTENCIAL", ordem_padrao=10, meta_tempo_minutos=35)
        }
        for a in areas.values():
            db.add(a)
        db.commit()

        print("Semeando usuários...")
        users = {
            "admin": Usuario(id=uuid.uuid4(), nome="Administrador do Sistema", email="admin@hospital.com.br", senha_hash="dummy", perfil_id=perfis["ADMINISTRADOR"].id),
            "recepcao": Usuario(id=uuid.uuid4(), nome="Felipe Recepção", email="recepcao@hospital.com.br", senha_hash="dummy", perfil_id=perfis["RECEPCAO"].id, area_atendimento_id=areas["recepcao"].id),
            "enfermagem": Usuario(id=uuid.uuid4(), nome="Felipe Marinho", email="felipe@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["enfermagem"].id),
            "medicina": Usuario(id=uuid.uuid4(), nome="Dr. Rafael Costa", email="rafael@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["medicina"].id),
            "nutricao": Usuario(id=uuid.uuid4(), nome="Dra. Aline Nutri", email="aline@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["nutricao"].id),
            "fisioterapia": Usuario(id=uuid.uuid4(), nome="Claudia Diaz", email="claudia@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["fisioterapia"].id),
            "servico-social": Usuario(id=uuid.uuid4(), nome="Liana Serviço Social", email="liana@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["servico-social"].id),
            "psicologia": Usuario(id=uuid.uuid4(), nome="Dra. Juliana Psicologia", email="juliana@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["psicologia"].id),
            "odontologia": Usuario(id=uuid.uuid4(), nome="Dr. Bruno Odonto", email="bruno@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["odontologia"].id),
            "fonoaudiologia": Usuario(id=uuid.uuid4(), nome="Dra. Mariana Fono", email="mariana@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["fonoaudiologia"].id),
            "terapia-ocupacional": Usuario(id=uuid.uuid4(), nome="Dra. Debora TO", email="debora@hospital.com.br", senha_hash="dummy", perfil_id=perfis["PROFISSIONAL"].id, area_atendimento_id=areas["terapia-ocupacional"].id)
        }
        for u in users.values():
            db.add(u)
        db.commit()

        print("Semeando definições de dados compartilhados...")
        shared_defs = {
            "diagnostico": DadoCompartilhadoDef(id=uuid.uuid4(), nome="Diagnóstico Principal", tipo="TEXTO"),
            "cid": DadoCompartilhadoDef(id=uuid.uuid4(), nome="CID-10", tipo="TEXTO"),
            "alergias": DadoCompartilhadoDef(id=uuid.uuid4(), nome="Alergias", tipo="TEXTO")
        }
        for sd in shared_defs.values():
            db.add(sd)
        db.commit()

        # Helper para criar Formulários
        def create_form(nome_form: str, campos_def: list) -> FormularioVersao:
            form = Formulario(id=uuid.uuid4(), nome=nome_form, ativo=True)
            db.add(form)
            db.commit()
            
            versao = FormularioVersao(
                id=uuid.uuid4(),
                formulario_id=form.id,
                criado_por_id=users["admin"].id,
                versao=1,
                ativo=True
            )
            db.add(versao)
            db.commit()
            
            for idx, cdef in enumerate(campos_def):
                campo = CampoFormulario(
                    id=uuid.uuid4(),
                    formulario_versao_id=versao.id,
                    nome=cdef["nome"],
                    tipo=cdef["tipo"],
                    ordem_exibicao=idx + 1,
                    ativo_versao=True
                )
                db.add(campo)
                db.commit()
                
                if "opcoes" in cdef:
                    for val, pont in cdef["opcoes"]:
                        opcao = CampoOpcao(
                            id=uuid.uuid4(),
                            campo_formulario_id=campo.id,
                            valor=val,
                            pontuacao=pont
                        )
                        db.add(opcao)
                    db.commit()
            return versao

        print("Semeando Formulário de Recepção...")
        recepcao_fields = [
            {"nome": "Documentos verificados", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None)]},
            {"nome": "Tipo de documento", "tipo": "TEXTO"},
            {"nome": "Cobertura", "tipo": "SELECAO_UNICA", "opcoes": [("SUS", None), ("Particular", None), ("Convênio", None)]},
            {"nome": "Observações", "tipo": "TEXTO"}
        ]
        f_recepcao = create_form("Formulário de Recepção", recepcao_fields)

        print("Semeando Formulário de Enfermagem...")
        enfermagem_fields = [
            {"nome": "Pressão arterial", "tipo": "TEXTO"},
            {"nome": "Temperatura", "tipo": "TEXTO"},
            {"nome": "Saturação O₂", "tipo": "TEXTO"},
            {"nome": "Frequência cardíaca", "tipo": "TEXTO"},
            {"nome": "Peso", "tipo": "TEXTO"},
            {"nome": "Altura", "tipo": "TEXTO"},
            {"nome": "Alergias", "tipo": "TEXTO"},
            {"nome": "Queixas principais", "tipo": "TEXTO"},
            {"nome": "Mora com quem", "tipo": "TEXTO"},
            {"nome": "Forma de deslocamento até o hospital", "tipo": "TEXTO"},
            {"nome": "Apoio familiar", "tipo": "TEXTO"},
            {"nome": "Limitação de atividade laboral", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Trabalhando atualmente", None),
                ("Afastado pelo INSS", None),
                ("Desempregado", None),
                ("Outro", None)
            ]},
            {"nome": "Diabetes Mellitus", "tipo": "TEXTO"},
            {"nome": "Hipertensão arterial", "tipo": "TEXTO"},
            {"nome": "Outras doenças", "tipo": "TEXTO"},
            {"nome": "Medicações de uso contínuo", "tipo": "TEXTO"},
            {"nome": "Cirurgia Prévia", "tipo": "TEXTO"},
            {"nome": "Tabagista", "tipo": "TEXTO"},
            {"nome": "Etilista", "tipo": "TEXTO"},
            {"nome": "Alergia", "tipo": "TEXTO"},
            {"nome": "Paciente tem conhecimento sobre seu diagnóstico", "tipo": "TEXTO"},
            {"nome": "Sinais e sintomas", "tipo": "TEXTO"},
            {"nome": "Exames", "tipo": "TEXTO"},
            {"nome": "Diagnóstico", "tipo": "TEXTO"},
            {"nome": "Afeto e humor", "tipo": "TEXTO"},
            {"nome": "Tratamento prévio", "tipo": "TEXTO"},
            {"nome": "Casos de câncer na família", "tipo": "TEXTO"},
            {"nome": "Orientação", "tipo": "TEXTO"},
            {"nome": "Sono", "tipo": "TEXTO"},
            {"nome": "Alimentação", "tipo": "TEXTO"},
            {"nome": "Disfagia", "tipo": "TEXTO"},
            {"nome": "Locomoção", "tipo": "TEXTO"},
            {"nome": "Episódios de queda (últimos 3 meses)", "tipo": "TEXTO"},
            {"nome": "MMII", "tipo": "TEXTO"},
            {"nome": "Eliminações urinárias", "tipo": "TEXTO"},
            {"nome": "Eliminações intestinais", "tipo": "TEXTO"},
            {"nome": "Avaliação da dor", "tipo": "TEXTO"},
            {"nome": "Lesão tumoral exposta", "tipo": "TEXTO"},
            {"nome": "Dispositivos", "tipo": "TEXTO"}
        ]
        f_enfermagem = create_form("Formulário de Acolhimento de Enfermagem", enfermagem_fields)

        print("Semeando Formulário de Medicina...")
        medicina_fields = [
            {"nome": "Diagnóstico oncológico", "tipo": "TEXTO"},
            {"nome": "Estadiamento", "tipo": "SELECAO_UNICA", "opcoes": [
                ("I", None), ("II", None), ("III", None), ("IV", None), ("IIA", None), ("Outro", None)
            ]},
            {"nome": "Tipo histológico", "tipo": "TEXTO"},
            {"nome": "Metástase", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None)]},
            {"nome": "Conduta proposta", "tipo": "TEXTO"},
            {"nome": "Encaminhamentos", "tipo": "TEXTO"},
            {"nome": "Observações", "tipo": "TEXTO"}
        ]
        f_medicina = create_form("Formulário de Medicina", medicina_fields)

        print("Semeando Formulário de Nutrição (ASG-PPP)...")
        asg_opcoes_normal = [("nunca", 1), ("raramente", 2), ("às vezes", 3), ("frequentemente", 4), ("sempre", 5)]
        nutricao_fields = [
            {"nome": "Peso aferido", "tipo": "TEXTO"},
            {"nome": "Altura", "tipo": "TEXTO"},
            {"nome": "IMC", "tipo": "TEXTO"},
            {"nome": "Via de alimentação", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Oral", None), ("SNE", None), ("GTT", None), ("NPT", None)
            ]},
            {"nome": "Suplementação", "tipo": "SELECAO_UNICA", "opcoes": [("Não", None), ("Sim", None)]},
            {"nome": "Qual suplemento", "tipo": "TEXTO"},
            {"nome": "Tratamento prévio", "tipo": "SELECAO_UNICA", "opcoes": [("Não", None), ("Sim", None)]},
            {"nome": "Qual tratamento prévio", "tipo": "SELECAO_UNICA", "opcoes": [
                ("cirurgia", None), ("RT", None), ("BQT", None), ("QT", None)
            ]},
            {"nome": "Escolaridade", "tipo": "TEXTO"},
            {"nome": "Atividade física", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None)]},
            {"nome": "Renda familiar", "tipo": "TEXTO"},
            {"nome": "Pessoas na habitação", "tipo": "TEXTO"},
            {"nome": "Tabagismo", "tipo": "SELECAO_UNICA", "opcoes": [("Não", None), ("Sim", None)]},
            {"nome": "Etilismo", "tipo": "SELECAO_UNICA", "opcoes": [("Não", None), ("Sim", None)]},
            {"nome": "Risco nutricional", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Baixo", None), ("Moderado", None), ("Alto", None)
            ]},
            {"nome": "Apetite", "tipo": "SELECAO_UNICA", "opcoes": [("Preservado", None), ("Diminuído", None)]},
            {"nome": "Classificação ASG-PPP", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Bem nutrido (A)", None),
                ("Desnutrição moderada ou suspeita (B)", None),
                ("Desnutrição grave (C)", None)
            ]},
            {"nome": "Observações", "tipo": "TEXTO"}
        ]
        f_nutricao = create_form("Formulário de Nutrição (ASG-PPP)", nutricao_fields)

        print("Semeando Formulário de Fisioterapia...")
        fisioterapia_fields = [
            {"nome": "Nível de dor", "tipo": "TEXTO"},
            {"nome": "Mobilidade", "tipo": "TEXTO"},
            {"nome": "Limitação funcional", "tipo": "TEXTO"},
            {"nome": "Necessidade de reabilitação", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Sim – ambulatorial", None), ("Não", None)
            ]},
            {"nome": "Observações", "tipo": "TEXTO"}
        ]
        f_fisioterapia = create_form("Formulário de Fisioterapia", fisioterapia_fields)

        print("Semeando Formulário de Serviço Social...")
        servico_social_fields = [
            {"nome": "Cor", "tipo": "SELECAO_UNICA", "opcoes": [
                ("BRANCA", None), ("NEGRA", None), ("PARDA", None), ("AMARELO", None),
                ("INDÍGENA", None), ("SEM DECLARAÇÃO", None), ("Outro", None)
            ]},
            {"nome": "Grau de Escolaridade", "tipo": "SELECAO_UNICA", "opcoes": [
                ("NENHUM", None), ("ALFABETIZADO", None), ("ENSINO FUNDAMENTAL COMPLETO", None),
                ("ENSINO FUNDAMENTAL INCOMPLETO", None), ("ENSINO MÉDIO COMPLETO", None),
                ("ENSINO MÉDIO INCOMPLETO", None), ("SUPERIOR COMPLETO", None),
                ("SUPERIOR INCOMPLETO", None), ("PÓS GRADUAÇÃO", None), ("Outro", None)
            ]},
            {"nome": "Estado Civil", "tipo": "SELECAO_UNICA", "opcoes": [
                ("CASADO(A)", None), ("SOLTEIRO(A)", None), ("UNIÃO ESTÁVEL", None),
                ("DIVORCIADO(A) LEGALMENTE", None), ("SEPARAÇÃO APENAS DE CORPOS", None),
                ("VIÚVO(A)", None), ("Outro", None)
            ]},
            {"nome": "Acompanhante/Cuidador", "tipo": "TEXTO"},
            {"nome": "Grau de parentesco", "tipo": "TEXTO"},
            {"nome": "Paciente fez diagnóstico onde", "tipo": "SELECAO_UNICA", "opcoes": [
                ("SES-DF", None), ("HUB", None), ("Outro", None)
            ]},
            {"nome": "Religião", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Católico(a)", None), ("Evangélico(a)", None), ("Espírita", None),
                ("Cristão", None), ("Ateu", None), ("Religiões Afro", None),
                ("Protestante", None), ("Indígena", None), ("TESTEMUNHA DE JEOVÁ", None),
                ("Outro", None)
            ]},
            {"nome": "Profissão", "tipo": "TEXTO"},
            {"nome": "Reside no Distrito Federal", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None)]},
            {"nome": "Procedência", "tipo": "TEXTO"},
            {"nome": "Necessita de hospedagem em abrigo", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Sim", None), ("Não", None), ("Não se aplica", None)
            ]},
            {"nome": "Possui dependentes", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None), ("Outro", None)]},
            {"nome": "Possui suporte familiar", "tipo": "SELECAO_UNICA", "opcoes": [
                ("EXCELENTE", None), ("SATISFATÓRIO", None), ("RESTRITO", None),
                ("PRECÁRIO", None), ("NÃO POSSUI", None), ("Outro", None)
            ]},
            {"nome": "Como vem para o HUB", "tipo": "TEXTO"},
            {"nome": "Acesso a telefone com internet", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None)]},
            {"nome": "Renda do Paciente", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Sem renda", None), ("1 Salário Mínimo", None),
                ("1,2 a 3 Salários Mínimos", None), ("Acima de 3 Salários Mínimos", None),
                ("Não quis responder", None)
            ]},
            {"nome": "Renda Familiar", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Sem renda", None), ("1 Salário Mínimo", None),
                ("1,2 a 3 Salários Mínimos", None), ("Acima de 3 Salários Mínimos", None),
                ("Não quis responder", None)
            ]},
            {"nome": "Observações Conduta", "tipo": "TEXTO"}
        ]
        f_servico_social = create_form("Formulário de Serviço Social", servico_social_fields)

        print("Semeando Formulário de Psicologia (IRPO 27 itens + extras)...")
        irpo_opcoes_inverse = [("sempre", 1), ("frequentemente", 2), ("às vezes", 3), ("raramente", 4), ("nunca", 5)]
        
        psicologia_fields = [
            {"nome": "01. Tenho me sentido muito ansioso(a) por causa do meu tratamento.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "02. Tenho medo do que pode acontecer comigo.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "03. Sinto dificuldade de controlar minha preocupação com a doença.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "04. Tenho sentido tristeza ou desânimo com frequência.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "05. Tenho vontade de chorar sem saber o motivo.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "06. Tenho tido pensamentos negativos sobre o futuro.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "07. Sinto que posso contar com alguém quando estou triste.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "08. Tenho recebido apoio emocional da minha família.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "09. Tenho amigos ou pessoas próximas que me escutam quando preciso.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "10. Sinto que as pessoas ao meu redor entendem o que estou passando.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "11. Tenho me sentido acolhido(a) pela equipe de saúde.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "12. Tenho buscado informações sobre o meu tratamento.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "13. Tento manter uma atitude positiva frente à doença.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "14. Procuro fazer atividades que me ajudam a relaxar ou distrair.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "15. Tento manter minha rotina o máximo possível.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "16. Busco conversar abertamente sobre meus sentimentos.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "17. Tenho alguém que me acompanha às consultas e exames.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "18. Recebo ajuda prática (financeira, transporte, alimentação, etc.) quando preciso.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "19. Sinto que minha família está organizada para me ajudar.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "20. Tenho recebido os cuidados de que preciso desde a descoberta do diagnóstico atual.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "21. Sinto que minha doença mudou completamente quem eu sou.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "22. Tenho me sentido um peso para minha família.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "23. Acho que minha vida perdeu o sentido por causa da doença.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "24. Tenho dificuldade em aceitar meu diagnóstico.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "25. Sinto que minha saúde pode melhorar.", "tipo": "ESCALA", "opcoes": irpo_opcoes_inverse},
            {"nome": "26. Evito falar sobre minha doença.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "27. Tenho medo constante da morte.", "tipo": "ESCALA", "opcoes": asg_opcoes_normal},
            {"nome": "28. Recentemente tenho pensado em acabar com a minha própria vida", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None)]},
            {"nome": "29. Se sim, apresenta planejamento?", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None), ("Outro", None)]},
            {"nome": "Encaminhado (a) para", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Ambulatório de Psicologia", None),
                ("Ambulatório de Psiquiatria", None),
                ("Não identificada necessidade de encaminhamento nesse momento", None),
                ("Outro", None)
            ]},
            {"nome": "Observações", "tipo": "TEXTO"}
        ]
        f_psicologia = create_form("Formulário de Psicologia (IRPO)", psicologia_fields)

        print("Semeando Formulário de Odontologia...")
        odontologia_fields = [
            {"nome": "Condição bucal", "tipo": "SELECAO_UNICA", "opcoes": [("Boa", None), ("Regular", None), ("Ruim", None)]},
            {"nome": "Lesões orais", "tipo": "SELECAO_UNICA", "opcoes": [("Ausentes", None), ("Presentes", None)]},
            {"nome": "Necessidade de tratamento", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None)]},
            {"nome": "Observações", "tipo": "TEXTO"}
        ]
        f_odontologia = create_form("Formulário de Odontologia", odontologia_fields)

        print("Semeando Formulário de Fonoaudiologia...")
        fonoaudiologia_fields = [
            {"nome": "Deglutição", "tipo": "SELECAO_UNICA", "opcoes": [("Preservada", None), ("Alterada", None)]},
            {"nome": "Comunicação", "tipo": "SELECAO_UNICA", "opcoes": [("Adequada", None), ("Alterada", None)]},
            {"nome": "Observações", "tipo": "TEXTO"}
        ]
        f_fonoaudiologia = create_form("Formulário de Fonoaudiologia", fonoaudiologia_fields)

        print("Semeando Formulário de Terapia Ocupacional...")
        terapia_ocupacional_fields = [
            {"nome": "Independência nas AVDs", "tipo": "SELECAO_UNICA", "opcoes": [
                ("Independente", None), ("Parcialmente dependente", None), ("Dependente", None)
            ]},
            {"nome": "Uso de órtese/prótese", "tipo": "SELECAO_UNICA", "opcoes": [("Sim", None), ("Não", None)]},
            {"nome": "Capacidade de autocuidado", "tipo": "SELECAO_UNICA", "opcoes": [("Preservada", None), ("Alterada", None)]},
            {"nome": "Atividades de lazer/trabalho", "tipo": "SELECAO_UNICA", "opcoes": [("Mantidas", None), ("Reduzidas", None), ("Interrompidas", None)]},
            {"nome": "Adaptações no domicílio", "tipo": "SELECAO_UNICA", "opcoes": [("Necessárias", None), ("Não necessárias", None)]},
            {"nome": "Observações", "tipo": "TEXTO"}
        ]
        f_terapia_ocupacional = create_form("Formulário de Terapia Ocupacional", terapia_ocupacional_fields)

        print("Semeando Pacientes e Jornadas...")
        
        # Paciente 1: Maria das Graças Oliveira
        p1 = Patient(
            id=uuid.uuid4(),
            codigo_publico="CAO-2024-0001",
            nome_completo="Maria das Graças Oliveira",
            name="Maria das Graças Oliveira",
            data_nascimento=date(1962, 5, 14),
            cpf="123.456.789-00",
            email="maria.graca@email.com",
            diagnosis="Câncer de Mama",
            treatment_stage="Em Atendimento"
        )
        db.add(p1)
        db.commit()
        
        c1 = ContatoPaciente(id=uuid.uuid4(), paciente_id=p1.id, nome="José Oliveira", relacao="Cônjuge (esposo)", telefone="(31) 98765-4321", cuidador=True)
        c2 = ContatoPaciente(id=uuid.uuid4(), paciente_id=p1.id, nome="Ana Oliveira", relacao="Filha", telefone="(31) 99999-0000", contato_emergencia=True)
        db.add(c1)
        db.add(c2)
        db.commit()

        j1 = Jornada(
            id=uuid.uuid4(),
            paciente_id=p1.id,
            criado_por_id=users["recepcao"].id,
            codigo="CAO-2024-0001",
            data_acolhimento=date(2024, 7, 3),
            status="EM_ATENDIMENTO",
            chegada_em=datetime.combine(date(2024, 7, 3), time(8, 15)),
            iniciada_em=datetime.combine(date(2024, 7, 3), time(8, 20)),
            diagnostico_principal="Câncer de Mama",
            fase_tratamento="Acolhimento",
            origem="UBS Central",
            observacao_geral="Paciente orientada sobre o fluxo de acolhimento."
        )
        db.add(j1)
        db.commit()

        # Etapas da Jornada 1
        etapas_p1 = [
            ("recepcao", "ATENDIDO", 1),
            ("enfermagem", "ATENDIDO", 2),
            ("medicina", "EM_ATENDIMENTO", 3),
            ("nutricao", "PENDENTE", 4),
            ("fisioterapia", "PENDENTE", 5),
            ("servico-social", "PENDENTE", 6),
            ("psicologia", "PENDENTE", 7),
            ("odontologia", "NAO_SE_APLICA", 8),
            ("fonoaudiologia", "NAO_SE_APLICA", 9),
            ("terapia-ocupacional", "PENDENTE", 10),
        ]
        for key, st, ord in etapas_p1:
            et = EtapaJornada(
                id=uuid.uuid4(),
                jornada_id=j1.id,
                area_atendimento_id=areas[key].id,
                status=st,
                ordem=ord,
                prioridade=1,
                iniciada_em=datetime.now() if st in ["ATENDIDO", "EM_ATENDIMENTO"] else None,
                finalizada_em=datetime.now() if st == "ATENDIDO" else None
            )
            db.add(et)
        db.commit()


        # Paciente 2: Roberto Ferreira Silva
        p2 = Patient(
            id=uuid.uuid4(),
            codigo_publico="CAO-2024-0002",
            nome_completo="Roberto Ferreira Silva",
            name="Roberto Ferreira Silva",
            data_nascimento=date(1956, 9, 21),
            cpf="987.654.321-00",
            email="roberto.silva@email.com",
            diagnosis="Câncer de Próstata",
            treatment_stage="Aguardando Acolhimento"
        )
        db.add(p2)
        db.commit()
        
        c3 = ContatoPaciente(id=uuid.uuid4(), paciente_id=p2.id, nome="Laura Silva", relacao="Filha", telefone="(31) 98888-1111", contato_emergencia=True)
        db.add(c3)
        db.commit()

        j2 = Jornada(
            id=uuid.uuid4(),
            paciente_id=p2.id,
            criado_por_id=users["recepcao"].id,
            codigo="CAO-2024-0002",
            data_acolhimento=date(2024, 7, 3),
            status="AGUARDANDO",
            chegada_em=datetime.combine(date(2024, 7, 3), time(9, 0)),
            diagnostico_principal="Câncer de Próstata",
            fase_tratamento="Aguardando",
            origem="Hospital das Clínicas"
        )
        db.add(j2)
        db.commit()

        # Etapas da Jornada 2
        etapas_p2 = [
            ("recepcao", "PENDENTE", 1),
            ("enfermagem", "PENDENTE", 2),
            ("medicina", "PENDENTE", 3),
            ("nutricao", "PENDENTE", 4),
            ("fisioterapia", "PENDENTE", 5),
            ("servico-social", "PENDENTE", 6),
            ("psicologia", "PENDENTE", 7),
            ("odontologia", "PENDENTE", 8),
            ("fonoaudiologia", "NAO_SE_APLICA", 9),
            ("terapia-ocupacional", "PENDENTE", 10),
        ]
        for key, st, ord in etapas_p2:
            et = EtapaJornada(
                id=uuid.uuid4(),
                jornada_id=j2.id,
                area_atendimento_id=areas[key].id,
                status=st,
                ordem=ord,
                prioridade=1
            )
            db.add(et)
        db.commit()


        # Paciente 3: Ana Beatriz Martins
        p3 = Patient(
            id=uuid.uuid4(),
            codigo_publico="CAO-2024-0003",
            nome_completo="Ana Beatriz Martins",
            name="Ana Beatriz Martins",
            data_nascimento=date(1979, 3, 2),
            cpf="456.789.123-00",
            email="ana.martins@email.com",
            diagnosis="Linfoma de Hodgkin",
            treatment_stage="Acolhimento Finalizado"
        )
        db.add(p3)
        db.commit()
        
        c4 = ContatoPaciente(id=uuid.uuid4(), paciente_id=p3.id, nome="Paulo Martins", relacao="Irmão", telefone="(31) 97777-2222", contato_emergencia=True)
        db.add(c4)
        db.commit()

        j3 = Jornada(
            id=uuid.uuid4(),
            paciente_id=p3.id,
            criado_por_id=users["recepcao"].id,
            codigo="CAO-2024-0003",
            data_acolhimento=date(2024, 7, 3),
            status="FINALIZADA",
            chegada_em=datetime.combine(date(2024, 7, 3), time(7, 30)),
            iniciada_em=datetime.combine(date(2024, 7, 3), time(7, 35)),
            finalizada_em=datetime.combine(date(2024, 7, 3), time(11, 45)),
            saida_em=datetime.combine(date(2024, 7, 3), time(11, 50)),
            diagnostico_principal="Linfoma de Hodgkin",
            fase_tratamento="Alta Acolhimento",
            origem="Clínica Oncovida"
        )
        db.add(j3)
        db.commit()

        # Etapas da Jornada 3 (todas finalizadas/atendidas, exceto odonto/fono que são nao se aplica)
        etapas_p3 = [
            ("recepcao", "ATENDIDO", 1),
            ("enfermagem", "ATENDIDO", 2),
            ("medicina", "ATENDIDO", 3),
            ("nutricao", "ATENDIDO", 4),
            ("fisioterapia", "ATENDIDO", 5),
            ("servico-social", "ATENDIDO", 6),
            ("psicologia", "ATENDIDO", 7),
            ("odontologia", "NAO_SE_APLICA", 8),
            ("fonoaudiologia", "NAO_SE_APLICA", 9),
            ("terapia-ocupacional", "ATENDIDO", 10),
        ]
        
        created_etapas_p3 = {}
        for key, st, ord in etapas_p3:
            et = EtapaJornada(
                id=uuid.uuid4(),
                jornada_id=j3.id,
                area_atendimento_id=areas[key].id,
                status=st,
                ordem=ord,
                prioridade=1,
                iniciada_em=datetime.combine(date(2024, 7, 3), time(8, 0)),
                finalizada_em=datetime.combine(date(2024, 7, 3), time(8, 30))
            )
            db.add(et)
            db.commit()
            created_etapas_p3[key] = et

        # Vamos preencher alguns formulários mockados para a Jornada 3
        # Helper para responder campo de formulario
        def fill_form(etapa_jornada_id: uuid.UUID, f_versao: FormularioVersao, profissional_id: uuid.UUID, answers: dict):
            preenchimento = PreenchimentoFormulario(
                id=uuid.uuid4(),
                etapa_jornada_id=etapa_jornada_id,
                formulario_versao_id=f_versao.id,
                profissional_id=profissional_id,
                status="FINALIZADO"
            )
            db.add(preenchimento)
            db.commit()
            
            # Buscar os campos desse formulário
            campos = db.query(CampoFormulario).filter(CampoFormulario.formulario_versao_id == f_versao.id).all()
            for campo in campos:
                val = answers.get(campo.nome)
                if val is not None:
                    resp = Resposta(
                        id=uuid.uuid4(),
                        preenchimento_id=preenchimento.id,
                        campo_formulario_id=campo.id
                    )
                    if campo.tipo in ["SELECAO_UNICA", "ESCALA"]:
                        # Buscar opção correspondente
                        opcao = db.query(CampoOpcao).filter(
                            CampoOpcao.campo_formulario_id == campo.id,
                            CampoOpcao.valor == str(val)
                        ).first()
                        if opcao:
                            # Associar ao campo opção caso o schema suporte ou apenas salvar no valor_texto
                            resp.valor_texto = str(val)
                        else:
                            resp.valor_texto = str(val)
                    else:
                        resp.valor_texto = str(val)
                    db.add(resp)
            db.commit()

        print("Preenchendo formulários da paciente Ana Beatriz Martins (Jornada 3)...")
        
        # Recepção
        ans_recepcao = {
            "Documentos verificados": "Sim",
            "Tipo de documento": "RG + CPF",
            "Cobertura": "SUS",
            "Observações": "Paciente orientada sobre o fluxo de acolhimento."
        }
        fill_form(created_etapas_p3["recepcao"].id, f_recepcao, users["recepcao"].id, ans_recepcao)

        # Enfermagem
        ans_enfermagem = {
            "Pressão arterial": "130/85 mmHg",
            "Temperatura": "36,8°C",
            "Saturação O₂": "97%",
            "Frequência cardíaca": "78 bpm",
            "Peso": "68 kg",
            "Altura": "1,63 m",
            "Alergias": "Dipirona",
            "Queixas principais": "Dor moderada no local da cirurgia. Relata cansaço frequente."
        }
        fill_form(created_etapas_p3["enfermagem"].id, f_enfermagem, users["enfermagem"].id, ans_enfermagem)

        # Medicina
        ans_medicina = {
            "Estadiamento": "IIA",
            "Tipo histológico": "Carcinoma ductal invasivo",
            "Metástase": "Não",
            "Conduta proposta": "Quimioterapia neoadjuvante",
            "Encaminhamentos": "Oncologia clínica, Radioterapia",
            "Observações": "Paciente orientada sobre plano terapêutico. Exames complementares solicitados."
        }
        fill_form(created_etapas_p3["medicina"].id, f_medicina, users["medicina"].id, ans_medicina)

        # Nutrição
        ans_nutricao = {
            "Peso aferido": "68 kg",
            "Altura": "1,63 m",
            "IMC": "25,6",
            "Risco nutricional": "Moderado",
            "Via de alimentação": "Oral",
            "Suplementação": "Não",
            "Apetite": "Preservado",
            "Observações": "Alimentação oral adequada. Sem perda de peso significativa nos últimos 3 meses."
        }
        fill_form(created_etapas_p3["nutricao"].id, f_nutricao, users["nutricao"].id, ans_nutricao)

        # Fisioterapia
        ans_fisioterapia = {
            "Nível de dor": "4",
            "Mobilidade": "Limitada",
            "Limitação funcional": "Moderada",
            "Necessidade de reabilitação": "Sim – ambulatorial",
            "Observações": "Limitação de amplitude de movimento no membro superior esquerdo."
        }
        fill_form(created_etapas_p3["fisioterapia"].id, f_fisioterapia, users["fisioterapia"].id, ans_fisioterapia)

        # Serviço Social
        ans_servico_social = {
            "Cor": "PARDA",
            "Grau de Escolaridade": "ENSINO MÉDIO COMPLETO",
            "Estado Civil": "CASADO(A)",
            "Acompanhante/Cuidador": "Paulo Martins",
            "Grau de parentesco": "Irmão",
            "Paciente fez diagnóstico onde": "HUB",
            "Religião": "Católico(a)",
            "Reside no Distrito Federal": "Sim",
            "Possui dependentes": "Não",
            "Possui suporte familiar": "SATISFATÓRIO",
            "Como vem para o HUB": "Transporte Particular",
            "Acesso a telefone com internet": "Sim",
            "Renda do Paciente": "1,2 a 3 Salários Mínimos",
            "Renda Familiar": "1,2 a 3 Salários Mínimos",
            "Observações Conduta": "Família presente e participativa. Esposo acompanha em todos os atendimentos."
        }
        fill_form(created_etapas_p3["servico-social"].id, f_servico_social, users["servico-social"].id, ans_servico_social)

        # Psicologia (IRPO)
        # Vamos pontuar com 3 em quase tudo (às vezes / raramente) para simular escore moderado
        ans_psicologia = {
            "01. Tenho me sentido muito ansioso(a) por causa do meu tratamento.": "3",
            "02. Tenho medo do que pode acontecer comigo.": "3",
            "03. Sinto dificuldade de controlar minha preocupação com a doença.": "3",
            "04. Tenho sentido tristeza ou desânimo com frequência.": "3",
            "05. Tenho vontade de chorar sem saber o motivo.": "3",
            "06. Tenho tido pensamentos negativos sobre o futuro.": "3",
            "07. Sinto que posso contar com alguém quando estou triste.": "às vezes",
            "08. Tenho recebido apoio emocional da minha família.": "às vezes",
            "09. Tenho amigos ou pessoas próximas que me escutam quando preciso.": "às vezes",
            "10. Sinto que as pessoas ao meu redor entendem o que estou passando.": "às vezes",
            "11. Tenho me sentido acolhido(a) pela equipe de saúde.": "às vezes",
            "12. Tenho buscado informações sobre o meu tratamento.": "às vezes",
            "13. Tento manter uma atitude positiva frente à doença.": "às vezes",
            "14. Procuro fazer atividades que me ajudam a relaxar ou distrair.": "às vezes",
            "15. Tento manter minha rotina o máximo possível.": "às vezes",
            "16. Busco conversar abertamente sobre meus sentimentos.": "às vezes",
            "17. Tenho alguém que me acompanha às consultas e exames.": "às vezes",
            "18. Recebo ajuda prática (financeira, transporte, alimentação, etc.) quando preciso.": "às vezes",
            "19. Sinto que minha família está organizada para me ajudar.": "às vezes",
            "20. Tenho recebido os cuidados de que preciso desde a descoberta do diagnóstico atual.": "às vezes",
            "21. Sinto que minha doença mudou completamente quem eu sou.": "3",
            "22. Tenho me sentido um peso para minha família.": "3",
            "23. Acho que minha vida perdeu o sentido por causa da doença.": "3",
            "24. Tenho dificuldade em aceitar meu diagnóstico.": "3",
            "25. Sinto que minha saúde pode melhorar.": "às vezes",
            "26. Evito falar sobre minha doença.": "3",
            "27. Tenho medo constante da morte.": "3",
            "28. Recentemente tenho pensado em acabar com a minha própria vida": "Não",
            "Encaminhado (a) para": "Não identificada necessidade de encaminhamento nesse momento",
            "Observações": "Paciente ansiosa em relação ao diagnóstico. Receptiva à intervenção psicológica."
        }
        fill_form(created_etapas_p3["psicologia"].id, f_psicologia, users["psicologia"].id, ans_psicologia)

        # Terapia Ocupacional
        ans_to = {
            "Independência nas AVDs": "Parcialmente dependente",
            "Uso de órtese/prótese": "Não",
            "Capacidade de autocuidado": "Preservada",
            "Atividades de lazer/trabalho": "Reduzidas",
            "Adaptações no domicílio": "Não necessárias",
            "Observações": "Paciente com limitação funcional leve no membro superior. Orientações sobre conservação de energia."
        }
        fill_form(created_etapas_p3["terapia-ocupacional"].id, f_terapia_ocupacional, users["terapia-ocupacional"].id, ans_to)

        print("Sementeira finalizada com sucesso!")

    except Exception as e:
        db.rollback()
        print(f"Erro ao semear banco de dados: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
