-- Habilita a extensão UUID se não estiver ativada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de endereços (deve ser criada primeiro por causa das FKs)
CREATE TABLE enderecos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('cliente', 'lojista', 'entregador')),
    telefone VARCHAR(20) NOT NULL,
    endereco_id UUID REFERENCES enderecos(id),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Tabela de lojistas (extensão de usuários)
CREATE TABLE lojistas (
    id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_loja VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    descricao TEXT,
    url_logo VARCHAR(255),
    media_avaliacao DECIMAL(3, 2) DEFAULT 0.0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lojista_id UUID NOT NULL REFERENCES lojistas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
    categoria VARCHAR(100) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de variações de produtos
CREATE TABLE variacoes_produto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    tamanho VARCHAR(20),
    cor VARCHAR(50),
    sku VARCHAR(50) UNIQUE,
    quantidade_estoque INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_estoque >= 0)
);

-- Tabela de imagens de produtos
CREATE TABLE imagens_produto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    url_imagem VARCHAR(255) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0 CHECK (ordem >= 0)
);

-- Tabela de malas
CREATE TABLE malas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    entregador_id UUID REFERENCES usuarios(id),
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'solicitada', 'em_preparacao', 'a_caminho', 'entregue_cliente', 
        'em_devolucao', 'devolvida_lojista', 'finalizada', 'cancelada'
    )),
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_entrega_cliente TIMESTAMP,
    data_devolucao_lojista TIMESTAMP,
    endereco_entrega_id UUID NOT NULL REFERENCES enderecos(id),
    observacoes TEXT
);

-- Tabela de itens da mala
CREATE TABLE itens_mala (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mala_id UUID NOT NULL REFERENCES malas(id) ON DELETE CASCADE,
    variacao_produto_id UUID NOT NULL REFERENCES variacoes_produto(id),
    quantidade_solicitada INTEGER NOT NULL CHECK (quantidade_solicitada > 0),
    quantidade_incluida INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_incluida >= 0),
    status_item VARCHAR(20) NOT NULL CHECK (status_item IN (
        'incluido', 'comprado', 'devolvido', 'nao_incluido'
    )) DEFAULT 'nao_incluido',
    preco_unitario_mala DECIMAL(10, 2) NOT NULL CHECK (preco_unitario_mala > 0)
);

-- Tabela de transações
CREATE TABLE transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    mala_id UUID NOT NULL REFERENCES malas(id),
    valor_total DECIMAL(10, 2) NOT NULL CHECK (valor_total >= 0),
    status_pagamento VARCHAR(20) NOT NULL CHECK (status_pagamento IN (
        'pendente', 'processando', 'aprovado', 'recusado', 'estornado'
    )),
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pagamento VARCHAR(50) NOT NULL,
    id_transacao_gateway VARCHAR(255) UNIQUE
);

-- Tabela de avaliações
CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    produto_id UUID REFERENCES produtos(id),
    lojista_id UUID REFERENCES lojistas(id),
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_evaluation_target CHECK (
        (produto_id IS NOT NULL AND lojista_id IS NULL) OR
        (produto_id IS NULL AND lojista_id IS NOT NULL)
    )
);

-- Índices para melhorar a performance
CREATE INDEX idx_produtos_lojista ON produtos(lojista_id);
CREATE INDEX idx_variacoes_produto ON variacoes_produto(produto_id);
CREATE INDEX idx_malas_cliente ON malas(cliente_id);
CREATE INDEX idx_malas_entregador ON malas(entregador_id);
CREATE INDEX idx_itens_mala_mala ON itens_mala(mala_id);
