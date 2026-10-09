-- Configurações Iniciais
SET timezone = '+00:00';

-- --------------------------------------------------------
-- ESTRUTURA DAS TABELAS
-- --------------------------------------------------------

-- Configuração de tabelas de suporte primeiro
-- 1. Tabelas Base (Sem Chaves Estrangeiras dependentes)
CREATE TABLE tipo_user (
  cod_tipo INT NOT NULL,
  tipo VARCHAR(255) NOT NULL,
  PRIMARY KEY (cod_tipo)
) ENGINE=InnoDB;

CREATE TABLE modalidade (
  id_modalidade INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_modalidade)
) ENGINE=InnoDB;

CREATE TABLE estudio (
  id_estudio INT NOT NULL AUTO_INCREMENT,
  tamanho VARCHAR(255) NOT NULL,
  alocacao INT NOT NULL,
  PRIMARY KEY (id_estudio)
) ENGINE=InnoDB;

CREATE TABLE tipo_aula (
  cod_tipoaula INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(255) NOT NULL,
  PRIMARY KEY (cod_tipoaula)
) ENGINE=InnoDB;

CREATE TABLE tipo_pagamento (
  tipo_pagamento INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(255) NOT NULL,
  valor INT NOT NULL,
  data DATE NOT NULL,
  PRIMARY KEY (tipo_pagamento)
) ENGINE=InnoDB;

CREATE TABLE phpauth_config (
  setting VARCHAR(255) NOT NULL,
  value VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (setting)
) ENGINE=InnoDB;

CREATE TABLE phpauth_attempts (
  id INT NOT NULL AUTO_INCREMENT,
  ip VARCHAR(255) NOT NULL,
  expiredate DATETIME NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE phpauth_emails_banned (
  id INT NOT NULL AUTO_INCREMENT,
  domain VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 2. Tabelas de Utilizadores e Perfis
CREATE TABLE phpauth_users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) DEFAULT NULL,
  password VARCHAR(255) DEFAULT NULL,
  isactive SMALLINT NOT NULL DEFAULT 0,
  dt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nome VARCHAR(255) NOT NULL,
  cod_tipo INT,
  iban VARCHAR(255),
  PRIMARY KEY (id),
  CONSTRAINT fk_cod_tipo FOREIGN KEY (cod_tipo) REFERENCES tipo_user(cod_tipo)
) ENGINE=InnoDB;

CREATE TABLE dados_aluno (
  id_enceducacao INT NOT NULL,
  nomealuno VARCHAR(255) NOT NULL,
  apelidoaluno VARCHAR(255) NOT NULL,
  nomeenceducacao VARCHAR(255) NOT NULL,
  apelidoenceducacao VARCHAR(255) NOT NULL,
  telefone VARCHAR(255) NOT NULL,
  datanascimento DATE NOT NULL,
  iban VARCHAR(255) NOT NULL,
  nif VARCHAR(255) NOT NULL,
  cp VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_enceducacao),
  CONSTRAINT dados_aluno_ibfk_1 FOREIGN KEY (id_enceducacao) REFERENCES phpauth_users(id)
) ENGINE=InnoDB;

CREATE TABLE dados_direcao (
  id_direcao INT NOT NULL,
  nomegestor VARCHAR(255) NOT NULL,
  apelidogestor VARCHAR(255) NOT NULL,
  telefone VARCHAR(255) NOT NULL,
  nif VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_direcao),
  CONSTRAINT dados_direcao_ibfk_1 FOREIGN KEY (id_direcao) REFERENCES phpauth_users(id)
) ENGINE=InnoDB;

CREATE TABLE dados_docente (
  id_docente INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  apelido VARCHAR(255) NOT NULL,
  telefone VARCHAR(255) NOT NULL,
  datanascimento DATE NOT NULL,
  morada VARCHAR(255) NOT NULL,
  iban VARCHAR(255) NOT NULL,
  nif VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_docente),
  CONSTRAINT dados_docente_ibfk_1 FOREIGN KEY (id_docente) REFERENCES phpauth_users(id)
) ENGINE=InnoDB;

-- 3. Tabelas de Autenticação e Sessões
CREATE TABLE phpauth_requests (
  id INT NOT NULL AUTO_INCREMENT,
  uid INT NOT NULL,
  token CHAR(128) NOT NULL, -- Ajustado para CHAR
  expire DATETIME NOT NULL,
  type VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE phpauth_sessions (
  id INT NOT NULL AUTO_INCREMENT,
  uid INT NOT NULL,
  hash CHAR(128) NOT NULL,
  expiredate DATETIME NOT NULL,
  ip VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) DEFAULT NULL,
  agent VARCHAR(255) NOT NULL,
  cookie_crc CHAR(128) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 4. Tabelas de Negócio (Aulas, Artefactos, etc.)
CREATE TABLE aulasprivadas (
  id_aulaprivada INT NOT NULL AUTO_INCREMENT,
  id_modalidade INT NOT NULL,
  id_estudio INT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  dia DATE NOT NULL,
  estado VARCHAR(255) NOT NULL,
  cod_tipoaula INT NOT NULL,
  preco DOUBLE NOT NULL,
  id_docente INT NOT NULL,
  PRIMARY KEY (id_aulaprivada),
  CONSTRAINT AulasPrivadas_id_modalidade_fkey FOREIGN KEY (id_modalidade) REFERENCES modalidade(id_modalidade),
  CONSTRAINT AulasPrivadas_id_estudio_fkey FOREIGN KEY (id_estudio) REFERENCES estudio(id_estudio),
  CONSTRAINT aulasprivadas_cod_tipoaula_fkey FOREIGN KEY (cod_tipoaula) REFERENCES tipo_aula(cod_tipoaula),
  CONSTRAINT aulasprivadas_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES dados_docente(id_docente)
) ENGINE=InnoDB;

CREATE TABLE horario (
  id_horario INT NOT NULL AUTO_INCREMENT,
  id_modalidade INT NOT NULL,
  dia_semana VARCHAR(255) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  id_estudio INT NOT NULL,
  PRIMARY KEY (id_horario),
  CONSTRAINT horario_id_modalidade_fkey FOREIGN KEY (id_modalidade) REFERENCES modalidade(id_modalidade),
  CONSTRAINT horario_id_estudio_fkey FOREIGN KEY (id_estudio) REFERENCES estudio(id_estudio)
) ENGINE=InnoDB;

CREATE TABLE aulas (
  id_aula INT NOT NULL AUTO_INCREMENT,
  id_modalidade INT NOT NULL,
  cod_tipoaula INT NOT NULL,
  id_estudio INT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  id_aulaprivada INT,
  id_horario INT,
  PRIMARY KEY (id_aula),
  CONSTRAINT aulas_ibfk_1 FOREIGN KEY (id_modalidade) REFERENCES modalidade(id_modalidade),
  CONSTRAINT aulas_ibfk_2 FOREIGN KEY (cod_tipoaula) REFERENCES tipo_aula(cod_tipoaula),
  CONSTRAINT aulas_ibfk_3 FOREIGN KEY (id_estudio) REFERENCES estudio(id_estudio),
  CONSTRAINT aulas_id_horario_fkey FOREIGN KEY (id_horario) REFERENCES horario(id_horario),
  CONSTRAINT aulas_id_aulaprivada_fkey FOREIGN KEY (id_aulaprivada) REFERENCES aulasprivadas(id_aulaprivada)
) ENGINE=InnoDB;

CREATE TABLE artefacto (
  id_artefacto INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(255) NOT NULL,
  estado VARCHAR(255) NOT NULL,
  preco_aluguer INT NOT NULL,
  disponibilidade VARCHAR(255) NOT NULL,
  imagem TEXT NOT NULL,
  id_enceducacao INT,
  id_direcao INT,
  categoria VARCHAR(255) NOT NULL DEFAULT 'Outros',
  telefone VARCHAR(255),
  tamanho VARCHAR(255),
  id_docente INT,
  PRIMARY KEY (id_artefacto),
  CONSTRAINT artefacto_ibfk_1 FOREIGN KEY (id_direcao) REFERENCES dados_direcao(id_direcao),
  CONSTRAINT artefacto_ibfk_2 FOREIGN KEY (id_enceducacao) REFERENCES dados_aluno(id_enceducacao),
  CONSTRAINT fk_artefacto_docente FOREIGN KEY (id_docente) REFERENCES dados_docente(id_docente)
) ENGINE=InnoDB;

CREATE TABLE aluguer (
  id_aluguer INT NOT NULL AUTO_INCREMENT,
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME,
  valor INT NOT NULL,
  estado VARCHAR(255) NOT NULL,
  id_artefacto INT NOT NULL,
  id_enceducacao INT NOT NULL,
  tipo_transacao VARCHAR(255) NOT NULL DEFAULT 'Aluguer',
  PRIMARY KEY (id_aluguer),
  CONSTRAINT aluguer_ibfk_1 FOREIGN KEY (id_artefacto) REFERENCES artefacto(id_artefacto),
  CONSTRAINT aluguer_ibfk_2 FOREIGN KEY (id_enceducacao) REFERENCES dados_aluno(id_enceducacao)
) ENGINE=InnoDB;

-- 5. Tabelas de Relação e Histórico
CREATE TABLE inscricoes (
  id_inscricao INT NOT NULL AUTO_INCREMENT,
  id_enceducacao INT NOT NULL,
  id_modalidade INT NOT NULL,
  PRIMARY KEY (id_inscricao),
  CONSTRAINT incricoes_ibfk_1 FOREIGN KEY (id_enceducacao) REFERENCES dados_aluno(id_enceducacao),
  CONSTRAINT incricoes_ibfk_2 FOREIGN KEY (id_modalidade) REFERENCES modalidade(id_modalidade)
) ENGINE=InnoDB;

CREATE TABLE modalidade_docente (
  id INT NOT NULL AUTO_INCREMENT,
  id_modalidade INT NOT NULL,
  id_docente INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT modalidade_docente_ibfk_1 FOREIGN KEY (id_modalidade) REFERENCES modalidade(id_modalidade),
  CONSTRAINT modalidade_docente_ibfk_2 FOREIGN KEY (id_docente) REFERENCES dados_docente(id_docente)
) ENGINE=InnoDB;

CREATE TABLE pagamentos (
  id_pagamento INT NOT NULL AUTO_INCREMENT,
  tipo_pagamento INT NOT NULL,
  id_enceducacao INT NOT NULL,
  id_aluguer INT NOT NULL,
  PRIMARY KEY (id_pagamento),
  CONSTRAINT pagamentos_ibfk_1 FOREIGN KEY (tipo_pagamento) REFERENCES tipo_pagamento(tipo_pagamento),
  CONSTRAINT pagamentos_ibfk_2 FOREIGN KEY (id_enceducacao) REFERENCES dados_aluno(id_enceducacao),
  CONSTRAINT pagamentos_ibfk_3 FOREIGN KEY (id_aluguer) REFERENCES aluguer(id_aluguer)
) ENGINE=InnoDB;

CREATE TABLE presencas (
  id_presenca INT NOT NULL AUTO_INCREMENT,
  id_docente INT NOT NULL,
  id_enceducacao INT NOT NULL,
  id_aula INT NOT NULL,
  estado VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_presenca),
  CONSTRAINT presencas_ibfk_1 FOREIGN KEY (id_docente) REFERENCES dados_docente(id_docente),
  CONSTRAINT presencas_ibfk_3 FOREIGN KEY (id_enceducacao) REFERENCES dados_aluno(id_enceducacao),
  CONSTRAINT presencas_id_aula_fkey FOREIGN KEY (id_aula) REFERENCES aulas(id_aula)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- INSERÇÃO DE DADOS (INSERTS)
-- --------------------------------------------------------

INSERT INTO dados_direcao (ID_Direcao, NomeGestor, ApelidoGestor, Telefone, NIF) VALUES
(52, 'Vitor', 'Moreira', '913204115', 'A Definir');

INSERT INTO dados_docente (ID_Docente, Nome, Apelido, Telefone, DataNascimento, Morada, IBAN, NIF) VALUES
(32, 'Ana Luís', 'Gomes', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(33, 'Bárbara', 'de Magalhães', 'A definir', '2000-01-01', 'A definir', 'A Definir', 'A definir'),
(34, 'Diana ', 'Sá Carneiro', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(35, 'Laura', 'Domingo Aguero', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(36, 'Manu', 'Gomis', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(37, 'Maria', 'Borges', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(38, 'Maria', 'Luísa Carles', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(39, 'Natália ', 'Azevedo', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(40, 'Philipp', 'Knapp', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(41, 'Rodolfo', 'Locca', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(42, 'Edson', 'Nascimento', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(43, 'Daniela', 'Fernandes', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(44, 'Diana', 'Faria', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(45, 'Filipa', 'Tenreiro', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(46, 'Filipe', 'Narciso', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(47, 'Sara', 'Vilas Boas', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(48, 'Alexandra', 'Galvão', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(49, 'Duvan', 'Gimenez', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(50, 'Anabela', 'Santos', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir'),
(51, 'Carol', 'Corrêa', 'A definir', '2000-01-01', 'A definir', 'A definir', 'A definir');

INSERT INTO estudio (ID_Estudio, Tamanho, Alucacao) VALUES
(1, 'A definir', 120),
(2, 'A definir', 120),
(3, 'A definir', 120),
(4, 'A definir', 120),
(5, 'A definir', 120),
(6, 'A definir', 120),
(7, 'A definir', 120);

INSERT INTO modalidade (ID_Modalidade, Descricao) VALUES
(1, 'Acrodance'),
(2, 'Aula para Rapazes'),
(3, 'Ballet para Adultos'),
(4, 'Ballet Classico'),
(5, 'Body Balance'),
(6, 'Children Ballet'),
(7, 'Comercial & Fusion'),
(8, 'Competição e Repertório'),
(9, 'Dança Contemporânea'),
(10, 'Dança Contemporânea para Adultos'),
(11, 'Flexibilidade'),
(12, 'Ginástica Acrobática'),
(13, 'Hip Hop'),
(14, 'Jazz'),
(15, 'Jazz Adultos'),
(16, 'Progressing Ballet Technique e Barra de Solo'),
(17, 'Royal Academy of Dance'),
(18, 'Sevilhanas'),
(19, 'Teatro Musical');

INSERT INTO modalidade_docente (ID_Modalidade, ID_Docente) VALUES
(1, 32), (2, 33), (4, 34), (4, 35), (4, 36), (4, 37), (4, 38), (4, 39), (4, 40), (4, 41),
(5, 42), (6, 32), (6, 33), (6, 43), (6, 44), (6, 45), (6, 37), (6, 39), (7, 32), (8, 32),
(8, 33), (8, 44), (8, 42), (8, 46), (8, 35), (8, 36), (8, 37), (8, 38), (8, 39), (8, 40),
(8, 41), (8, 47), (9, 33), (9, 46), (9, 47), (10, 46), (11, 43), (12, 48), (12, 49),
(13, 50), (14, 42), (15, 42), (17, 32), (17, 33), (17, 43), (17, 44), (17, 45), (17, 37),
(17, 39), (18, 51), (19, 32);

INSERT INTO phpauth_attempts (id, ip, expiredate) VALUES
(11, '::1', '2024-01-26 17:34:15'),
(12, '::1', '2024-01-26 18:10:53'),
(13, '::1', '2024-01-26 18:13:15');

INSERT INTO phpauth_config (setting, value) VALUES
('allow_concurrent_sessions', '0'),
('attack_mitigation_time', '+30 minutes'),
('attempts_before_ban', '30'),
('attempts_before_verify', '5'),
('bcrypt_cost', '10'),
('cookie_domain', NULL),
('cookie_forget', '+30 minutes'),
('cookie_http', '1'),
('cookie_name', 'phpauth_session_cookie'),
('cookie_path', '/'),
('cookie_remember', '+1 month'),
('cookie_renew', '+5 minutes'),
('cookie_samesite', 'Strict'),
('cookie_secure', '1'),
('custom_datetime_format', 'Y-m-d H:i'),
('emailmessage_suppress_activation', '0'),
('emailmessage_suppress_reset', '0'),
('request_key_expiration', '+10 minutes'),
('site_activation_page', 'activate'),
('site_activation_page_append_code', '0'),
('site_email', 'no-reply@phpauth.cuonic.com'),
('site_key', 'pjss_1972'),
('site_language', 'pt_BR'),
('site_name', 'localhost'),
('site_password_reset_page', 'reset'),
('site_password_reset_page_append_code', '0'),
('site_timezone', 'Europe/Paris'),
('site_url', 'https://github.com/PHPAuth/PHPAuth'),
('smtp', '0'),
('smtp_auth', '1'),
('smtp_debug', '0'),
('smtp_host', 'smtp.example.com'),
('smtp_password', 'password'),
('smtp_port', '25'),
('smtp_security', NULL),
('smtp_username', 'email@example.com'),
('table_attempts', 'phpauth_attempts'),
('table_emails_banned', 'phpauth_emails_banned'),
('table_requests', 'phpauth_requests'),
('table_sessions', 'phpauth_sessions'),
('table_translations', 'phpauth_translation_dictionary'),
('table_users', 'phpauth_users'),
('translation_source', 'php'),
('uses_session', '0'),
('verify_email_max_length', '100'),
('verify_email_min_length', '5'),
('verify_password_min_length', '3');

INSERT INTO phpauth_sessions (id, uid, hash, expiredate, ip, device_id, agent, cookie_crc) VALUES
(8, 4, 'fa208dc661810c0baf6c0316d19429b0a6143470', '2024-01-24 19:18:29', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', '7b93a3366e83f891aa28b7e877aaeb3693dae278');

INSERT INTO phpauth_users (id, email, password, isactive, dt, nome, Cod_Tipo) VALUES
(32, 'agomes@gmail.com', '123456789', 1, '2026-03-01 18:40:18', 'Ana Luís Gomes', 1),
(33, 'bmagalhaes@gmail.com', '123456789', 1, '2026-03-01 18:41:37', 'Bárbara de Magalhães', 1),
(34, 'dcarneiro@gmail.com', '123456789', 1, '2026-03-01 18:42:19', 'Diana Sá Carneiro', 1),
(35, 'laguero@gmail.com', '123456789', 1, '2026-03-01 18:43:07', 'Laura Domingo Aguero', 1),
(36, 'mgomis@gmail.com', '123456789', 1, '2026-03-01 18:43:59', 'Manu Gomis', 1),
(37, 'mborges@gmail.com', '123456789', 1, '2026-03-01 18:44:30', 'Maria Borges', 1),
(38, 'mcarles@gmail.com', '123456789', 1, '2026-03-01 18:45:10', 'Maria Luísa Carles', 1),
(39, 'nazevedo@gmail.com', '123456789', 1, '2026-03-01 18:45:56', 'Natália Azevedo', 1),
(40, 'pknapp@gmail.com', '123456789', 1, '2026-03-01 18:46:44', 'Philipp Knapp', 1),
(41, 'rlocca@gmail.com', '123456789', 1, '2026-03-01 18:49:02', 'Rodolfo Locca', 1),
(42, 'enascimento@gmail.com', '123456789', 1, '2026-03-01 18:51:04', 'Edson Nascimento', 1),
(43, 'dfernandes@gmail.com', '123456789', 1, '2026-03-01 18:52:12', 'Daniela Fernandes', 1),
(44, 'dfaria@gmail.com', '123456789', 1, '2026-03-01 18:52:43', 'Diana Faria', 1),
(45, 'ftenreiro@gmail.com', '123456789', 1, '2026-03-01 18:53:24', 'Filipa Tenreiro', 1),
(46, 'fnarciso@gmail.com', '123456789', 1, '2026-03-01 18:54:27', 'Filipe Narciso', 1),
(47, 'sboas@gmail.com', '123456789', 1, '2026-03-01 18:55:01', 'Sara Vilas Boas', 1),
(48, 'agalvao@gmail.com', '123456789', 1, '2026-03-01 18:55:47', 'Alexandra Galvão', 1),
(49, 'dgimenez@gmail.com', '123456789', 1, '2026-03-01 18:56:30', 'Duvan Gimenez', 1),
(50, 'asantos@gmail.com', '123456789', 1, '2026-03-01 18:57:35', 'Anabela Santos', 1),
(51, 'ccorreia@gmail.com', '123456789', 1, '2026-03-01 18:58:36', 'Carol Corrêa', 1),
(52, 'admin@admin.com', '123456789', 1, '2026-03-01 20:55:19', 'admin', 3);

INSERT INTO tipo_aula (Cod_TipoAula, Descricao) VALUES
(1, 'Particular'),
(2, 'Duo'),
(3, 'Trio'),
(4, 'Ensemble');

INSERT INTO tipo_user (Cod_Tipo, Tipo) VALUES
(1, 'Docente'),
(2, 'Encarregado de Educação'),
(3, 'Direção');