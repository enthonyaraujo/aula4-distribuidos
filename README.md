# 🎲 Dominó Online Multiplayer (4 Jogadores)

Projeto desenvolvido para a **Avaliação 04** da disciplina de **Sistemas Distribuídos**.

Consiste em um jogo completo de Dominó para 4 jogadores conectado em tempo real, empacotado em um contêiner **Docker** pronto para deploy em uma instância **AWS EC2**.

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
- **Backend / Mensageria**: Node.js + Express + Socket.io (WebSockets).
- **Conteinerização**: Docker (Multi-stage build leve com Alpine Linux).
- **Nuvem**: AWS EC2 (Ubuntu Server).

---

## 🎮 Regras e Mecânicas Implementadas

- **4 Assentos**: Sul (Jogador Local), Oeste, Norte e Leste.
- **28 Peças (Duplo-6)**: 7 peças distribuídas para cada um dos 4 jogadores.
- **Início Inteligente**: O jogador com a maior bucha (6:6 - "carroção") ou peça mais alta inicia a rodada.
- **Validação de Jogadas**: Encaixe nas duas pontas abertas da mesa (Ponta Esquerda e Ponta Direita) com orientação visual das pedras.
- **Passagem de Turno**: Se o jogador não tiver peças compatíveis, pode passar a vez.
- **Detecção de Fechamento**: Se 4 jogadores consecutivos passarem, o jogo tranca e vence quem tiver a menor pontuação.
- **Bots Automáticos**: Botão no topo para adicionar bots e preencher assentos vazios, permitindo testar sozinho com facilidade.
- **Segurança Distribuída**: As pedras dos oponentes são mantidas em sigilo no servidor (apenas a contagem é pública até o fim da rodada).

---

## 💻 Como Rodar Localmente

### Modo Desenvolvimento
```bash
# Instalar dependências
npm install

# Iniciar servidor backend
npm run start
```
Acesse no navegador: `http://localhost:3000`

---

## 🐳 Como Rodar com Docker

```bash
# 1. Construir a imagem Docker
docker build -t domino-online .

# 2. Executar o contêiner (mapeando na porta 80 ou 8080)
docker run -d -p 8080:80 --name domino-game domino-online
```
Acesse no navegador: `http://localhost:8080`

---

## ☁️ Deploy na AWS EC2

Para instruções detalhadas de como lançar a instância EC2, configurar o Security Group (portas 22 e 80) e iniciar o contêiner em produção, consulte o guia:
👉 **[DEPLOY_AWS_EC2.md](./DEPLOY_AWS_EC2.md)**
