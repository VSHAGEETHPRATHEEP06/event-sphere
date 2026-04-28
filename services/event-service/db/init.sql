-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Seed categories
INSERT INTO categories (name) VALUES
    ('Music & Concerts'),
    ('Sports'),
    ('Technology'),
    ('Theater & Arts'),
    ('Conference'),
    ('Festival')
ON CONFLICT (name) DO NOTHING;

-- Seed sample events (Sri Lankan context)
INSERT INTO events (title, description, venue, category_id, event_date, event_time, total_seats, available_seats, price, image_url, status) VALUES
(
    'Colombo Music Festival 2026',
    'The biggest music festival in Sri Lanka featuring top local and international artists. Experience an unforgettable night of live performances, food stalls, and entertainment.',
    'Galle Face Green, Colombo',
    1,
    '2026-06-15',
    '18:00',
    500,
    500,
    2500.00,
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    'upcoming'
),
(
    'Sri Lanka vs Australia - T20 Cricket',
    'Exciting T20 cricket match between Sri Lanka and Australia. Watch the thrilling contest live at the iconic R. Premadasa Stadium.',
    'R. Premadasa Stadium, Colombo',
    2,
    '2026-07-20',
    '15:00',
    350,
    350,
    3500.00,
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    'upcoming'
),
(
    'TechConf Sri Lanka 2026',
    'Annual technology conference bringing together developers, entrepreneurs, and tech enthusiasts. Workshops on AI, Cloud Computing, and Web Development.',
    'BMICH, Colombo',
    3,
    '2026-08-10',
    '09:00',
    200,
    200,
    1500.00,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'upcoming'
),
(
    'Kandy Esala Perahera Special Show',
    'Witness the magnificent cultural pageant of the Temple of the Tooth. Special reserved seating for an extraordinary view of the grand procession.',
    'Temple of the Tooth, Kandy',
    4,
    '2026-08-05',
    '19:00',
    300,
    300,
    2000.00,
    'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800',
    'upcoming'
),
(
    'Galle Literary Festival 2026',
    'A celebration of literature and ideas in the historic Galle Fort. Featuring renowned authors, poets, and storytellers from around the world.',
    'Galle Fort, Galle',
    5,
    '2026-09-12',
    '10:00',
    150,
    150,
    1000.00,
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    'upcoming'
),
(
    'Vesak Festival Light Show',
    'Grand Vesak celebration with stunning light displays, lantern competitions, and cultural performances. A night of spiritual and visual splendor.',
    'Viharamahadevi Park, Colombo',
    6,
    '2026-05-12',
    '17:00',
    400,
    400,
    500.00,
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'upcoming'
);
