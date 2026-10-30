# Jornada Oncológica (Jornada Conectada — HUB)

Ocean Brasil · UnB · Saúde Digital · 2026.1 · G03

**Status:** ativo · **Grupo:** G03 · **Mentor:** TBD

**Demo:** ainda não publicada · **Documentação:** [comece aqui](docs/README.md)

## O projeto em 30 segundos

Aplicação web multiprofissional para o acolhimento oncológico da UNACON no Hospital Universitário de Brasília (HUB/UnB). Reúne formulários estruturados de 9 especialidades com reaproveitamento automático de dados compartilhados, arquitetura de alertas clínicos em 4 níveis, cálculos assistenciais auditáveis (IMC, ASG-PPP e IRPO), geração de Ficha Consolidada em PDF e consulta pública humanizada da jornada do paciente sem exposição de dados sensíveis.

## Onde está cada coisa?

| Pasta | Conteúdo |
|---|---|
| [docs/](docs/README.md) | Problema, usuários, requisitos (SRS), modelagem de dados, formulários de referência, roteiro de testes e roadmap pós-MVP |
| [software/](software/README.md) | Código da aplicação: `software/frontend/` (React + TypeScript + Vite + Tailwind v4) e `software/backend/` (Python + FastAPI + SQLAlchemy) |
| [deploy/](deploy/README.md) | Instruções de execução com Docker (`compose.yaml`) e preparação para publicação em Kubernetes |
| [data/](data/README.md) | Somente dados permitidos e exemplos sintéticos |

## Quero apenas conhecer o projeto

Leia a [documentação](docs/README.md), o [índice de documentos](docs/listaDocumentos.md) e o [roteiro prático de testes e usabilidade](docs/COMO_TESTAR.md). Quando houver demo publicada, seu endereço aparecerá no topo deste README.

## Quero colaborar sem terminal

Registre uma Issue (tarefa ou problema), edite pelo navegador, proponha um Pull Request (alteração para revisão) e aguarde revisão. Veja [como colaborar](CONTRIBUTING.md).

## Quero executar no meu computador

Com **Docker** e **Docker Compose** instalados, execute na raiz do repositório:

```bash
docker compose up --build
```

- **Frontend (Web):** http://localhost:5173
- **Backend (API):** http://localhost:8001
- **Swagger (Docs da API):** http://localhost:8001/docs

Para instruções completas (incluindo execução sem Docker e testes automatizados), consulte [software/README.md](software/README.md) e [deploy/docker/README.md](deploy/docker/README.md).

## Quero fazer deploy

Deploy é publicar a aplicação para outras pessoas utilizarem. Siga [deploy/README.md](deploy/README.md).

## Recursos compartilhados do Ocean

- [Handbook e tutoriais](https://github.com/OceanBrasilia/handbook) · [Comece aqui](https://github.com/OceanBrasilia/handbook/blob/main/docs/00-comece-aqui.md)
- [Template de projetos](https://github.com/OceanBrasilia/project-template)
- [Catálogo institucional](https://github.com/OceanBrasilia/catalog)
- [Kubernetes: orientações](https://github.com/OceanBrasilia/handbook/blob/main/docs/07-kubernetes.md) · [Templates de referência](https://github.com/OceanBrasilia/project-template/tree/main/deploy/k8s)
- [Colaboração e Pull Requests](https://github.com/OceanBrasilia/handbook/blob/main/docs/03-colaboracao.md) · [Segurança](https://github.com/OceanBrasilia/handbook/blob/main/docs/09-seguranca.md)

Os materiais centrais são consultados na fonte, sem duplicar tutoriais no projeto. Use sua conta institucional autorizada; se um recurso privado não abrir, solicite à coordenação a conferência do acesso.

## Integrantes

Preencher somente nomes aprovados; não incluir e-mails.

## Mentor

TBD. Conta GitHub de manutenção: a confirmar; não inferir username pelo nome.

## Segurança

Nunca incluir prontuários, CPF, informações identificáveis de pacientes, dados clínicos reais não autorizados, senhas, tokens, chaves privadas, kubeconfigs funcionais ou arquivos `.env` com segredos. Leia [SECURITY.md](SECURITY.md).
