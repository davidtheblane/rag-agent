import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
});

export async function populateDb() {
  try {
    // TABELA: CATEGORIA

    await pool.query(
      `CREATE TABLE IF NOT EXISTS CATEGORIAS (
            CODIGO SERIAL PRIMARY KEY,
            NOME VARCHAR(255) NOT NULL UNIQUE
        )`
    );

    await pool.query(
      `INSERT INTO CATEGORIAS (NOME)
        VALUES
            ('Eletrônicos'),
            ('Roupas'),
            ('Livros'),
            ('Casa e Decoração'),
            ('Esportes'),
            ('Brinquedos'),
            ('Beleza'),
            ('Saúde'),
            ('Automotivo')
        `
    );

    // TABELA: MARCA

    await pool.query(
      `CREATE TABLE IF NOT EXISTS MARCAS (
              CODIGO SERIAL PRIMARY KEY,
              NOME VARCHAR(255) NOT NULL UNIQUE
          )`
    );

    await pool.query(
      `INSERT INTO MARCAS (NOME)
          VALUES
              ('Apple'),
              ('Samsung'),
              ('Nike'),
              ('Adidas'),
              ('Sony'),
              ('LG'),
              ('Lenovo'),
              ('ASUS'),
              ('ACTINE'),
              ('FIAT')
          `
    );

    // TABELA: PRODUTO

    await pool.query(
      `CREATE TABLE IF NOT EXISTS PRODUTOS (
                CODIGO SERIAL PRIMARY KEY,
                NOME VARCHAR(255) NOT NULL,
                DESCRICAO TEXT,
                CODIGO_MARCA INT REFERENCES MARCAS(CODIGO) ON DELETE CASCADE,
                CODIGO_CATEGORIA INT REFERENCES CATEGORIAS(CODIGO) ON DELETE CASCADE,
                DATA_CRIACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ATIVO BOOLEAN DEFAULT TRUE,
                ALTURA NUMERIC(10, 2),
                COMPRIMENTO NUMERIC(10, 2),
                LARGURA NUMERIC(10, 2),
                PESO NUMERIC(10, 2)
            )`
    );

    await pool.query(
      `INSERT INTO PRODUTOS (NOME, DESCRICAO, CODIGO_MARCA, CODIGO_CATEGORIA, DATA_CRIACAO,
        ATIVO, ALTURA, COMPRIMENTO, LARGURA, PESO)
            VALUES
                ('iPhone 15', 'Seu iPhone novo vem com muito mais.', 1, 1, '2025-04-13 12:00:00', TRUE, 14.7,
                0.8, 7.1, 0.17),
                ('Celular Samsung Galaxy S23 Ultra 5G', 'Câmera com 200MP e Zoom extraordinário de até 100x', 1, 2, '2025-04-13 12:00:00', TRUE, 7.7,
                0.8, 3.1, 0.17),
                ('Tênis Air Max', 'Tênis confortável para corrida', 3, 5, '2025-04-13 12:00:00', TRUE, 12.0,
                17.0, 28.0, 0.35),
                ('Tênis Adidas UltraBoost', 'Tênis esportivo Adidas UltraBoost, ideal para corrida e atividades físicas. Conforto e performance.', 4, 5, '2025-04-13 12:00:00', TRUE, 12.0,
                17.0, 28.0, 0.35),
                ('Fones de Ouvido Sony WH-1000XM5', 'Fones de ouvido Sony WH-1000XM5 com cancelamento de ruído ativo, som de alta qualidade, e design confortável.', 1, 5, '2025-04-13 12:00:00', TRUE, 14.7,
                0.8, 7.1, 0.17)
            `
    );

    // TABELA: PREÇO

    await pool.query(
      `CREATE TABLE IF NOT EXISTS PRECOS (
              CODIGO SERIAL PRIMARY KEY,
              CODIGO_PRODUTO INT NOT NULL REFERENCES PRODUTOS(CODIGO) ON DELETE CASCADE,
              VALOR NUMERIC(10, 2) NOT NULL,
              DATA_INICIO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              DATA_FIM TIMESTAMP,
              ATIVO BOOLEAN DEFAULT TRUE
          )`
    );

    await pool.query(
      `INSERT INTO PRECOS (CODIGO_PRODUTO, VALOR, DATA_INICIO, DATA_FIM, ATIVO)
          VALUES
              (1, 6999.99, '2025-04-01 00:00:00', '2025-04-10 00:00:00', TRUE),
              (2, 6999.99, '2025-04-10 00:00:00', '2025-04-20 00:00:00', TRUE),
              (3, 499.90, '2025-04-20 00:00:00', '2025-04-30 00:00:00', TRUE),
              (4, 600.90, '2025-05-01 00:00:00', '2025-05-10 00:00:00', TRUE),
              (5, 800.90, '2025-05-10 00:00:00', '2025-05-20 00:00:00', TRUE)
          `
    );

    // TABELA: ESTOQUE

    await pool.query(
      `CREATE TABLE IF NOT EXISTS ESTOQUES (
                CODIGO SERIAL PRIMARY KEY,
                CODIGO_PRODUTO INT NOT NULL REFERENCES PRODUTOS(CODIGO) ON DELETE CASCADE,
                QUANTIDADE INT NOT NULL
            )`
    );

    await pool.query(
      `INSERT INTO ESTOQUES (CODIGO_PRODUTO, QUANTIDADE)
            VALUES
                (1, 100),
                (2, 90),
                (3, 80),
                (4, 70),
                (5, 60)
            `
    );

    // TABELA: CLIENTE

    await pool.query(
      `CREATE TABLE IF NOT EXISTS CLIENTES (
                    CODIGO SERIAL PRIMARY KEY,
                    NOME VARCHAR(150) NOT NULL,
                    TIPO VARCHAR(10) NOT NULL CHECK (tipo IN ('pf', 'pj')),
                    DOCUMENTO VARCHAR(20) NOT NULL UNIQUE,
                    EMAIL VARCHAR(100),
                    TELEFONE VARCHAR(20),
                    ENDERECO TEXT,
                    DATA_CRIACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
    );

    await pool.query(
      `INSERT INTO CLIENTES (NOME, TIPO, DOCUMENTO, EMAIL, TELEFONE, ENDERECO)
                VALUES
                    ('João da Silva', 'pf', '123.456.789-00', 'joao@gmail.com', '(11) 91234-5678', 'Rua das Flores, 123, São Paulo - SP'),
                    ('Maria Oliveira', 'pf', '987.654.321-00', 'maria.oliveira@yahoo.com', '(21) 99876-5432', 'Av. Brasil, 456, Rio de Janeiro - RJ'),
                    ('Empresa Beta Comércio EIRELI', 'pj', '12.345.678/0001-99', 'contato@betacomercio.com.br', '(11) 4002-8922', 'Rua Comercial, 89, Campinas - SP'),
                    ('Carlos Henrique', 'pf', '321.654.987-11', 'carlos.h@hotmail.com', '(31) 93333-4444', 'Rua Minas Gerais, 321, Belo Horizonte - MG'),
                    ('Alpha Tech Solutions Ltda', 'pj', '98.765.432/0001-00', 'suporte@alphatech.com', '(48) 98888-7777', 'Av. das Nações, 789, Florianópolis - SC')
                `
    );

    // TABELA: PEDIDO

    await pool.query(
      `CREATE TABLE IF NOT EXISTS PEDIDOS (
            CODIGO SERIAL PRIMARY KEY,
            CODIGO_CLIENTE INT NOT NULL REFERENCES CLIENTES(CODIGO) ON DELETE CASCADE,
            DATA_PEDIDO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            STATUS VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'pago', 'enviado', 'cancelado', 'concluido')),
            VALOR_TOTAL NUMERIC(12, 2) NOT NULL,
            OBSERVACOES TEXT
                  )`
    );

    await pool.query(
      `INSERT INTO PEDIDOS (CODIGO_CLIENTE, STATUS, VALOR_TOTAL, OBSERVACOES)
                  VALUES
                    (1, 'pago', 1499.90, 'Pedido aprovado e aguardando envio'),
                    (2, 'pendente', 899.90, 'Aguardando confirmação de pagamento'),
                    (3, 'concluido', 3199.00, 'Pedido entregue com sucesso'),
                    (4, 'cancelado', 749.90, 'Cliente cancelou antes da aprovação'),
                    (5, 'enviado', 2150.00, 'Pedido enviado via transportadora XYZ')
                  `
    );

    // TABELA: STATUS_PEDIDO

    await pool.query(
      `CREATE TABLE IF NOT EXISTS STATUS_PEDIDO (
                  CODIGO SERIAL PRIMARY KEY,
                  CODIGO_PEDIDO INT NOT NULL REFERENCES PEDIDOS(CODIGO) ON DELETE CASCADE,
                  NOME_STATUS VARCHAR(50) NOT NULL UNIQUE,
                  DESCRICAO TEXT
              )`
    );

    await pool.query(
      `INSERT INTO STATUS_PEDIDO (CODIGO_PEDIDO, NOME_STATUS, DESCRICAO)
              VALUES
                (1, 'Pendente', 'Pedido recebido, aguardando processamento'),
                (2, 'Processando', 'Pedido está sendo preparado'),
                (3, 'Enviado', 'Pedido foi enviado para entrega'),
                (4, 'Entregue', 'Pedido entregue ao cliente'),
                (5, 'Cancelado', 'Pedido foi cancelado')
              `
    );

    // TABELA NOTAS_FISCAIS

    await pool.query(
      `CREATE TABLE IF NOT EXISTS NOTAS_FISCAIS (
                    CODIGO SERIAL PRIMARY KEY,
                    CODIGO_PEDIDO INT NOT NULL REFERENCES PEDIDOS(CODIGO) ON DELETE CASCADE,
                    NUMERO_NOTA VARCHAR(50) NOT NULL,
                    SERIE VARCHAR(20),
                    DATA_EMISSAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CHAVE_ACESSO VARCHAR(60)
                )`
    );

    await pool.query(
      `INSERT INTO NOTAS_FISCAIS (CODIGO_PEDIDO, NUMERO_NOTA, SERIE, DATA_EMISSAO, CHAVE_ACESSO)
                VALUES
                  (1, '12345', '001', '2025-04-20 00:00:00', '12345678901234567890123456789012345678901234'),
                  (2, '10001', '002', '2025-04-21 00:00:00', '34567890123456789012345678901234567890123456'),
                  (3, '12346', '002', '2025-04-22 00:00:00', '45678901234567890123456789012345678901234567'),
                  (4, '10002', '002', '2025-04-23 00:00:00', '56789012345678901234567890123456789012345678'),
                  (5, '12347', '003', '2025-04-24 00:00:00', '23456789012345678901234567890123456789012345')
                `
    );
  } catch (error) {
    console.log("Error in populate db", error);
    pool.end();
    return error;
  } finally {
    console.log("Database successfully populated");
    pool.end();
    return {
      success: true,
    };
  }
}

populateDb();
