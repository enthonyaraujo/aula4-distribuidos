# Guia Completo: Deploy do Dominó Online no AWS EC2 com Docker

Este guia detalha o passo a passo para cumprir os requisitos da **Avaliação 04**:
- Lançar uma instância **EC2 na AWS**;
- Instalar o **Docker** na instância;
- Conteinerizar e executar o jogo de **Dominó Online**;
- Testar o jogo publicamente através do IP da EC2.

---

## Passo 1: Lançar a Instância EC2 na AWS

1. Faça login no Console da AWS e acesse o serviço **EC2**.
2. Clique em **Launch Instance** (Executar Instância):
   - **Nome**: `domino-online-ec2`
   - **AMI (Sistema Operacional)**: `Ubuntu Server 24.04 LTS` (Elegível para nível gratuito / Free Tier).
   - **Tipo de Instância**: `t2.micro` ou `t3.micro`.
   - **Par de chaves (Key pair)**: Crie um novo par de chaves (ex: `minha-chave.pem`) ou selecione uma existente e baixe o arquivo `.pem`.
3. **Configurações de Rede (Security Group)**:
   - Marque a opção de criar um Security Group e habilite:
     - **SSH (Porta 22)**: Origem `0.0.0.0/0` (ou seu IP pessoal).
     - **HTTP (Porta 80)**: Origem `0.0.0.0/0` (permitir tráfego HTTP da internet).
4. Clique em **Launch Instance**.

---

## Passo 2: Conectar via SSH à Instância

No terminal do seu computador (ajuste as permissões da chave se necessário):

```bash
chmod 400 minha-chave.pem
ssh -i minha-chave.pem ubuntu@<IP_PUBLICO_DA_EC2>
```

---

## Passo 3: Instalar o Docker no Ubuntu EC2

Dentro da máquina EC2, execute os comandos para instalar o Docker:

```bash
# Atualizar repositórios
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install docker.io -y

# Habilitar e iniciar o serviço Docker
sudo systemctl enable --now docker

# (Opcional) Permitir rodar docker sem sudo
sudo usermod -aG docker ubuntu
newgrp docker
```

Verifique se o Docker está rodando:
```bash
docker --version
```

---

## Passo 4: Enviar o Projeto para a EC2 e Rodar o Contêiner

### Opção A: Clonar diretamente do GitHub na EC2 (Mais Fácil e Rápido)

Dentro da instância EC2 conectada via SSH:

```bash
# Clonar o repositório
git clone https://github.com/enthonyaraujo/aula4-distribuidos.git
cd aula4-distribuidos

# Construir a imagem Docker
sudo docker build -t domino-online .

# Executar o contêiner na porta 80
sudo docker run -d -p 80:80 --name domino-game --restart always domino-online
```

---

### Opção B: Copiar os arquivos locais via SCP/Rsync

Em seguida, na EC2:
```bash
cd ~/domino-online

# Construir a imagem Docker
sudo docker build -t domino-online .

# Executar o contêiner na porta 80
sudo docker run -d -p 80:80 --name domino-game --restart always domino-online
```

---

### Opção B: Enviar via Docker Hub

No seu computador local:
```bash
docker build -t seu_usuario/domino-online:latest .
docker push seu_usuario/domino-online:latest
```

Na EC2:
```bash
sudo docker run -d -p 80:80 --name domino-game --restart always seu_usuario/domino-online:latest
```

---

## Passo 5: Testar o Jogo em Execução

1. No navegador, acesse:
   ```
   http://<IP_PUBLICO_DA_EC2>
   ```
2. Digite seu nome e clique em **Entrar na Partida**.
3. Abra outros navegadores ou envie o link para amigos testarem os 4 assentos simultaneamente.
4. Para testar sozinho, clique no botão **"Adicionar Bots"** no topo para preencher as vagas vazias e jogar imediatamente contra a IA!

---

## Comandos Úteis do Docker na EC2

- Ver contêineres rodando:
  ```bash
  sudo docker ps
  ```
- Ver logs do jogo e conexões de jogadores:
  ```bash
  sudo docker logs -f domino-game
  ```
- Parar o contêiner:
  ```bash
  sudo docker stop domino-game
  ```
- Reiniciar o contêiner:
  ```bash
  sudo docker restart domino-game
  ```

