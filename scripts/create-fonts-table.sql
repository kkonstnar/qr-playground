-- Create fonts table if it doesn't exist
CREATE TABLE IF NOT EXISTS fonts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    weights JSONB NOT NULL DEFAULT '["400"]'::jsonb,
    default_text VARCHAR(255) NOT NULL DEFAULT 'Logo Text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_fonts_name ON fonts(name);

-- Insert more fonts if table is empty or has less than 20 fonts
INSERT INTO fonts (name, weights, default_text) 
SELECT * FROM (VALUES 
    ('Inter', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Roboto', '["100","300","400","500","700","900"]'::jsonb, 'Brand X'),
    ('Open Sans', '["300","400","500","600","700","800"]'::jsonb, 'Brand X'),
    ('Lato', '["100","300","400","700","900"]'::jsonb, 'Brand X'),
    ('Montserrat', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Poppins', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Nunito', '["200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Source Sans Pro', '["200","300","400","600","700","900"]'::jsonb, 'Brand X'),
    ('Raleway', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Ubuntu', '["300","400","500","700"]'::jsonb, 'Brand X'),
    ('Playfair Display', '["400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Oswald', '["200","300","400","500","600","700"]'::jsonb, 'Brand X'),
    ('Merriweather', '["300","400","700","900"]'::jsonb, 'Brand X'),
    ('PT Sans', '["400","700"]'::jsonb, 'Brand X'),
    ('Rubik', '["300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Work Sans', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Fira Sans', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Libre Baskerville', '["400","700"]'::jsonb, 'Brand X'),
    ('Crimson Text', '["400","600","700"]'::jsonb, 'Brand X'),
    ('Dosis', '["200","300","400","500","600","700","800"]'::jsonb, 'Brand X'),
    ('Quicksand', '["300","400","500","600","700"]'::jsonb, 'Brand X'),
    ('Cabin', '["400","500","600","700"]'::jsonb, 'Brand X'),
    ('Bitter', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Arimo', '["400","500","600","700"]'::jsonb, 'Brand X'),
    ('Karla', '["200","300","400","500","600","700","800"]'::jsonb, 'Brand X'),
    ('Titillium Web', '["200","300","400","600","700","900"]'::jsonb, 'Brand X'),
    ('Muli', '["200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Libre Franklin', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Hind', '["300","400","500","600","700"]'::jsonb, 'Brand X'),
    ('Oxygen', '["300","400","700"]'::jsonb, 'Brand X'),
    ('Noto Sans', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Dancing Script', '["400","500","600","700"]'::jsonb, 'Brand X'),
    ('Pacifico', '["400"]'::jsonb, 'Brand X'),
    ('Lobster', '["400"]'::jsonb, 'Brand X'),
    ('Great Vibes', '["400"]'::jsonb, 'Brand X'),
    ('Amatic SC', '["400","700"]'::jsonb, 'Brand X'),
    ('Righteous', '["400"]'::jsonb, 'Brand X'),
    ('Fredoka One', '["400"]'::jsonb, 'Brand X'),
    ('Bangers', '["400"]'::jsonb, 'Brand X'),
    ('Creepster', '["400"]'::jsonb, 'Brand X'),
    ('Orbitron', '["400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Exo 2', '["100","200","300","400","500","600","700","800","900"]'::jsonb, 'Brand X'),
    ('Russo One', '["400"]'::jsonb, 'Brand X'),
    ('Bebas Neue', '["400"]'::jsonb, 'Brand X'),
    ('Anton', '["400"]'::jsonb, 'Brand X'),
    ('Fjalla One', '["400"]'::jsonb, 'Brand X'),
    ('Alfa Slab One', '["400"]'::jsonb, 'Brand X'),
    ('Bungee', '["400"]'::jsonb, 'Brand X'),
    ('Permanent Marker', '["400"]'::jsonb, 'Brand X'),
    ('Kalam', '["300","400","700"]'::jsonb, 'Brand X'),
    ('Shadows Into Light', '["400"]'::jsonb, 'Brand X')
) AS v(name, weights, default_text)
WHERE NOT EXISTS (SELECT 1 FROM fonts WHERE name = v.name);
