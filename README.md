# FashionHub

**Sobre o Projeto**

FashionHub é uma plataforma full-stack de marketplace de moda projetada para conectar lojistas e clientes de uma maneira inovadora. A aplicação permite que clientes solicitem uma "mala" de roupas para experimentar em casa, decidam com quais peças ficar e devolvam o restante, com todo o processo gerenciado pela plataforma, incluindo lojistas e entregadores.

Este repositório contém o código-fonte completo da aplicação, dividido em:

- **/backend**: A API RESTful construída com Node.js, Express e Sequelize, responsável por toda a lógica de negócio, gerenciamento de dados e autenticação.
- **/frontend**: O aplicativo mobile desenvolvido com React Native, que consome a API e fornece a interface para clientes, lojistas e entregadores.

**Funcionalidades Principais**

- **Autenticação por Perfis**: Sistema de registro e login seguro com JWT para diferentes tipos de usuários (Cliente, Lojista, Entregador).
- **Gerenciamento de Produtos**: Lojistas podem cadastrar, atualizar e gerenciar seus produtos, incluindo variações de tamanho e cor.
- **Catálogo de Produtos**: Clientes podem navegar, buscar e filtrar produtos de diversas lojas.
- **Sistema de "Mala" (Bag)**: O cliente pode solicitar uma mala de produtos para experimentar em casa.
- **Fluxo de Compra e Devolução**: O cliente confirma quais itens da mala deseja comprar e quais irá devolver.
- **Processamento de Pedidos**: Lojistas recebem e gerenciam as solicitações de malas dos clientes.

**Tecnologias Utilizadas**

A aplicação foi construída utilizando as seguintes tecnologias:

| Backend                | Frontend             | Banco de Dados |
| ---------------------- | -------------------- | -------------- |
| Node.js                | React Native         | PostgreSQL     |
| Express.js             | TypeScript           |                |
| Sequelize (ORM)        | React Navigation     |                |
| JWT (JSON Web Tokens)  | Axios                |                |
| Bcrypt.js              | Joi                  |                |

**Como Executar o Projeto**

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

**Pré-requisitos**

Antes de começar, certifique-se de ter instalado:

- Node.js (versão LTS) e Yarn
- PostgreSQL
- Android Studio (para o ambiente mobile Android)
- Um editor de código como o VS Code

**1. Clone o Repositório**

```bash
git clone https://github.com/chimdos/fashionhub.git
cd seu-repositorio
```

**2. Configuração do Backend**

```bash
# Navegue para a pasta do backend
cd backend

# Instale as dependências
npm install

# Crie um arquivo .env a partir do .env.example
cp .env.example .env

# Configure as variáveis de ambiente no arquivo .env
# (credenciais do banco de dados, segredo JWT, etc.)

# Inicie o servidor de desenvolvimento
npm run dev
```

O servidor da API estará rodando em `http://localhost:3000` (ou na porta que você definiu no `.env`).

**3. Configuração do Frontend**

```bash
# Abra um novo terminal e navegue para a pasta do frontend
cd frontend

# Instale as dependências
yarn install

# Para iOS (em macOS), instale os pods
# cd ios && pod install && cd ..

# Inicie o aplicativo no emulador Android (certifique-se que ele esteja aberto)
yarn android
```

**Estrutura da API (Exemplos de Endpoints)**

| Método | Endpoint                | Descrição                               |
| ------ | ----------------------- | --------------------------------------- |
| POST   | /api/auth/register      | Registra um novo usuário.               |
| POST   | /api/auth/login         | Autentica um usuário e retorna um token. |
| GET    | /api/products           | Lista todos os produtos (com filtros).  |
| POST   | /api/products           | Cria um novo produto.                   |
| POST   | /api/bags               | Cliente solicita uma nova mala.         |
| PUT    | /api/bags/:id/confirm   | Cliente confirma itens comprados/devolvidos. |
