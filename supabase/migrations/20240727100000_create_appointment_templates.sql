CREATE TABLE appointment_templates (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    duration integer NOT NULL,
    location text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY appointment_templates
    ADD CONSTRAINT appointment_templates_pkey PRIMARY KEY (id);

