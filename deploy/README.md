# Executar e publicar

Aqui ficam instruções e manifests (descrições dos recursos a criar). Não ficam senhas nem credenciais.

- Local: aplicação no computador da pessoa.
- Docker: empacota aplicação, runtime (ambiente que executa o código) e dependências em uma imagem; o container é a instância executável dessa imagem.
- Kubernetes: administra containers no ambiente compartilhado.
- URL da demo: endereço da aplicação já publicada; um link de repositório não é uma demo.

Comece em [Docker](docker/README.md). Depois use [Kubernetes](k8s/README.md).

Fluxo de referência: desenvolvimento → GitHub → PR e merge em main → Actions → build de imagem → GHCR, quando aplicável → Kubernetes → demo.

Ainda não há aplicação nem deploy ativo. A infraestrutura precisa definir endpoint/CA do cluster, capacidade e DEMO_BASE_URL. Quando publicar, atualize o topo do README, PROJECT.yml e catálogo. O programa deve continuar executável localmente.
