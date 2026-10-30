"""Validação mínima Ocean; não substitui revisão humana."""
import argparse,pathlib,re,subprocess,sys
import yaml

def validate(root,template=False,tracked=True):
    errors=[]
    for f in ['README.md','PROJECT.yml','CONTRIBUTING.md','SECURITY.md','.gitignore','docs/README.md','software/README.md','data/README.md','deploy/README.md','deploy/docker/README.md','deploy/k8s/README.md']:
        if not (root/f).is_file(): errors.append('Ausente: '+f)
    try:
        d=yaml.safe_load((root/'PROJECT.yml').read_text(encoding='utf-8'))
        if not isinstance(d,dict): raise ValueError()
        required=['project_id','project_name','project_slug','institution','year','term','group','kind','status','visibility','sensitivity','mentor','technology','local_run','deploy','maintainers']
        errors += ['Campo ausente: '+k for k in required if k not in d]
        for k,allowed in {'kind':['docs','software','hybrid'],'status':['active','validation','completed','archived'],'sensitivity':['public','internal','restricted-off-github'],'visibility':['private']}.items():
            if d.get(k) not in allowed: errors.append('Valor inválido: '+k)
        if type(d.get('year')) is not int or not 1000<=d['year']<=9999: errors.append('Ano inválido')
        for k in ['project_name','project_slug','institution','term','group','mentor','local_run']:
            if not isinstance(d.get(k),str) or not d[k].strip(): errors.append('Texto obrigatório: '+k)
        for k in ['technology','maintainers']:
            if not isinstance(d.get(k),list) or any(not isinstance(v,str) for v in d[k]): errors.append('Lista inválida: '+k)
        deploy=d.get('deploy')
        if not isinstance(deploy,dict): errors.append('deploy deve ser mapa')
        else:
            for k in ['target','namespace','demo_url']:
                if not isinstance(deploy.get(k),str): errors.append('deploy.'+k+' deve ser texto')
            if deploy.get('target')!='kubernetes': errors.append('Destino inválido')
            url=deploy.get('demo_url','')
            if url and not re.fullmatch(r'https://[^\s]+',url): errors.append('Demo deve ser HTTPS ou vazia')
        if not template:
            g=d.get('group','')
            if not isinstance(g,str) or not re.fullmatch(r'g(?:0[1-9]|[1-9][0-9])',g): errors.append('Grupo inválido')
            expected=f"{d.get('institution')}-{d.get('year')}-{d.get('term')}-{g}"
            if d.get('project_id')!=expected: errors.append('project_id inconsistente')
            if isinstance(deploy,dict) and deploy.get('namespace')!='ocean-'+expected: errors.append('Namespace inconsistente')
        if not re.fullmatch(r'[a-z][a-z0-9-]*',str(d.get('institution',''))): errors.append('Instituição inválida')
        if not re.fullmatch(r't[1-9][0-9]*',str(d.get('term',''))): errors.append('Ciclo inválido')
        slug=d.get('project_slug','')
        if isinstance(slug,str) and slug!='TBD' and not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug): errors.append('Slug inválido')
    except (OSError,ValueError,yaml.YAMLError,TypeError): errors.append('PROJECT.yml inválido')
    if tracked:
        r=subprocess.run(['git','ls-files','-z'],cwd=root,capture_output=True,check=True)
        files=[root/f for f in r.stdout.decode('utf-8').split('\0') if f]
    else: files=[f for f in root.rglob('*') if f.is_file() and '.git' not in f.parts]
    for f in files:
        rel=f.relative_to(root).as_posix(); name=f.name.lower()
        if (name=='.env' or name.startswith('.env.') or (name.startswith('kubeconfig') and name!='kubeconfig.example.yaml') or name.endswith(('.kubeconfig','.pem','.key','.p12','.crt','.secret')) or name.startswith('secret.') or 'secrets' in f.relative_to(root).parts or 'out' in f.relative_to(root).parts): errors.append('Arquivo proibido: '+rel)
        try: text=f.read_text(encoding='utf-8')
        except (UnicodeDecodeError,OSError): continue
        if re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',text) or re.search(r'\bgh[pousr]_[A-Za-z0-9]{30,}\b',text): errors.append('Possível segredo: '+rel)
        if name=='kubeconfig.example.yaml':
            try:
                cfg=yaml.safe_load(text)
                for u in cfg.get('users',[]):
                    for k,v in u.get('user',{}).items():
                        if not isinstance(v,str) or not re.fullmatch(r'\$\{[A-Z0-9_]+\}',v): errors.append('Exemplo contém credencial: '+rel)
            except (yaml.YAMLError,TypeError,AttributeError): errors.append('Exemplo inválido')
    return errors

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--template',action='store_true');p.add_argument('--root',default='.');p.add_argument('--local-files',action='store_true');a=p.parse_args()
    errors=validate(pathlib.Path(a.root).resolve(),a.template,not a.local_files)
    for e in errors: print(e)
    print('Validação reprovada' if errors else 'Estrutura e metadados válidos; revisão humana continua necessária.')
    sys.exit(bool(errors))
