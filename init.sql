SET search_path TO public;

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email varchar(150) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    full_name varchar(150) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS roles (
    id integer PRIMARY KEY,
    name varchar(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id uuid NOT NULL,
    role_id integer NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS forms (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title varchar(200) NOT NULL,
    description varchar(255) NOT NULL,
    form_type varchar(20) NOT NULL,
    status varchar(20) NOT NULL,
    owner_id uuid NOT NULL,
    cloned_from uuid,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    banner_image_url varchar(500),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id uuid NOT NULL,
    question_text varchar(255) NOT NULL,
    question_type varchar(30) NOT NULL,
    score numeric(5,2) NOT NULL,
    required boolean NOT NULL DEFAULT true,
    image_url varchar(500),
    FOREIGN KEY (form_id) REFERENCES forms(id)
);

CREATE TABLE IF NOT EXISTS question_options (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id uuid NOT NULL,
    option_text varchar(255) NOT NULL,
    is_correct boolean NOT NULL DEFAULT false,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS invitations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id uuid NOT NULL,
    token varchar(255) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    max_attempts bigint NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (form_id) REFERENCES forms(id)
);

CREATE TABLE IF NOT EXISTS responses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id uuid NOT NULL,
    user_id uuid NOT NULL,
    invitation_id uuid NOT NULL,
    started_at timestamptz NOT NULL DEFAULT current_timestamp,
    finished_at timestamptz,
    FOREIGN KEY (form_id) REFERENCES forms(id)
);

CREATE TABLE IF NOT EXISTS response_details (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_text varchar(255),
    selected_option_id uuid,
    FOREIGN KEY (response_id) REFERENCES responses(id)
);

CREATE TABLE IF NOT EXISTS evaluations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id uuid NOT NULL,
    total_score numeric(6,2) NOT NULL,
    max_score numeric(6,2) NOT NULL,
    passed boolean NOT NULL,
    evaluated_at timestamptz NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (response_id) REFERENCES responses(id)
);

CREATE TABLE IF NOT EXISTS scores (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    form_id uuid NOT NULL,
    score numeric(6,2) NOT NULL,
    attempt bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    action varchar(100) NOT NULL,
    entity varchar(100) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
