# Kubernetes

Aqui ficarão manifests da aplicação. Não coloque kubeconfigs, certificados privados ou senhas.

Namespace previsto: `TBD`. Namespace é isolamento lógico dentro do cluster compartilhado; não cria uma máquina virtual. A restrição de acesso vem de RBAC (regras de autorização), não apenas do namespace escrito no kubeconfig.

Peça à infraestrutura um kubeconfig restrito. Salve fora do repositório. O kubeconfig informa ao kubectl qual cluster e credencial usar.

Exemplos, executados de uma pasta segura que contenha o kubeconfig:

```sh
kubectl get pods --kubeconfig=kubeconfig-ocean-unb-2026-t1-gXX.yaml
kubectl get services --kubeconfig=kubeconfig-ocean-unb-2026-t1-gXX.yaml
kubectl get deployments --kubeconfig=kubeconfig-ocean-unb-2026-t1-gXX.yaml
```

Os comandos listam, respectivamente, unidades de execução, serviços de acesso e configurações de implantação. Antes de publicar, a aplicação precisa de manifests válidos e um kustomization.yaml nesta pasta.

Somente depois disso, a partir da raiz do projeto (ajuste o caminho do kubeconfig):

```sh
kubectl apply -k deploy/k8s --kubeconfig=/caminho-seguro/kubeconfig-ocean-unb-2026-t1-gXX.yaml
```

Esse comando aplica a configuração da aplicação. Ainda não funciona neste scaffold, pois não há aplicação definida.
