---
trigger: always_on
description: Regras e padrões de arquitetura para a aplicação React no diretório apps/frontend.
---

# VPS Infrastructure & DevOps Rules (Multi-Tenant Architecture)

Este documento define as regras obrigatórias de arquitetura, redes, Nginx e CI/CD para todos os projetos hospedados na VPS (Debian 13 + Podman). O objetivo é garantir isolamento total, zero colisão de portas e segurança global.

## 1. Descentralização e Isolamento

-   **Propriedade da Configuração:** Cada projeto é dono da sua própria configuração de Nginx e infraestrutura de containers. Não existe um repositório central de infraestrutura.
    
-   **Arquivos no Repositório:** O arquivo de proxy reverso do Nginx e os arquivos de especificação de container (`.container` do Podman Quadlet) devem morar dentro da pasta `infra/` no repositório do próprio projeto.
    

## 2. Gerenciamento de Portas (Prevenção de Colisão)

Cada projeto recebe um bloco de portas dedicado (Range de 100 portas) no Host para evitar conflitos.

### Tabela de Alocação de Portas:

**Bloco de Portas**

**Projeto / Contexto**

**Exemplo de Aplicação**

**`3100 - 3199`**

`site-pessoal` (Monorepo)

`3100`: Frontend / `3101`: API (Go)

**`3200 - 3299`**

`outraurl.com`

`3200`: Frontend / `3201`: API

**`3300 - 3399`**

_Próximo Projeto_

Reservado

> **PROIBIDO:** Subir containers mapeando portas aleatórias diretamente no host sem respeitar o bloco designado ao projeto.

## 3. Regras para o Nginx (Proxy Reverso)

O Nginx Global (instalado no SO da VPS) apenas lê a pasta `/etc/nginx/conf.d/`. Cada projeto deve injetar seu arquivo lá dentro seguindo estas regras:

1.  **Nomenclatura do Arquivo:** O arquivo deve se chamar `[nome-do-projeto].conf` (ex: `site-pessoal.conf`, `outraurl.conf`). Nunca use `nginx.conf` ou `default.conf`.
    
2.  **Escuta Local:** O Nginx do host deve redirecionar para o IP local (`127.0.0.1:PORTA`). Nunca exponha as portas dos containers diretamente para a internet (`0.0.0.0`).
    
3.  **Template Base Obrigatório:**
    

Nginx

```
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    return 301 https://seu-dominio.com.br$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    ssl_certificate     /root/.acme.sh/seu-dominio.com.br_ecc/seu-dominio.com.br.cer;
    ssl_certificate_key /root/.acme.sh/seu-dominio.com.br_ecc/seu-dominio.com.br.key;

    location / {
        proxy_pass         http://127.0.0.1:PORTA_DO_SEU_BLOCO;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

```

## 4. Regras de Containers (Podman Quadlet)

Não utilizamos docker-compose ou comandos manuais em produção. Usamos Quadlets (`.container`) integrados ao systemd do Linux.

-   Os arquivos `.container` devem ser salvos na pasta `infra/` do projeto.
    
-   Devem especificar o IP local no `PublishPort` para segurança.
    
-   **Template Obrigatório (`.container`):**
    

Ini, TOML

```
[Unit]
Description=Nome do Servico do Projeto
After=network-online.target

[Container]
Image=ghcr.io/samuelpanzera/nome-da-imagem:latest
ContainerName=nome-do-container-unico
PublishPort=127.0.0.1:PORTA_DO_BLOCO:PORTA_INTERNA_CONTAINER
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=multi-user.target default.target

```

## 5. Regras de CI/CD (Deploy Atômico)

O pipeline do GitHub Actions de qualquer projeto deve seguir o fluxo de Validação Atômica para garantir a estabilidade dos demais sites da VPS.

### Fluxo do Script de Deploy:

1.  **Envio Temporário:** Enviar o arquivo `.conf` do Nginx para a pasta `/tmp/deploy-projeto/`.
    
2.  **Atualização de Containers:** Mover os arquivos `.container` para `/etc/containers/systemd/`, atualizar as imagens com `podman pull` e reiniciar os serviços via `systemctl restart`.
    
3.  **Validação do Nginx:**
    
    -   Copiar o novo arquivo `.conf` para `/etc/nginx/conf.d/`.
        
    -   Executar o comando: `sudo nginx -t`.
        
    -   **Sucesso:** Executar `sudo systemctl reload nginx`.
        
    -   **Falha:** Deletar imediatamente o arquivo `.conf` recém-copiado da pasta `conf.d/` e abortar o deploy com erro (`exit 1`).
        

> **Nota de Segurança:** O usuário SSH do GitHub Actions deve ter permissões estritas configuradas no `/etc/sudoers` da VPS apenas para os comandos necessários (`podman`, `systemctl`, `nginx`).