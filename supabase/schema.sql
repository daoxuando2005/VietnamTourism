-- ==========================================
-- Supabase Schema & Seed Data Migration
-- Generated at: 2026-06-14T11:40:24.562Z
-- ==========================================

-- Clean existing tables (optional)
DROP TRIGGER IF EXISTS on_review_changed ON public.reviews;
DROP TRIGGER IF EXISTS on_favorite_changed ON public.favorites;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP TABLE IF EXISTS public.feed_activities;
DROP TABLE IF EXISTS public.favorites;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.destinations;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.provinces;

-- 1. Create provinces table
CREATE TABLE public.provinces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  description TEXT,
  map_x INTEGER,
  map_y INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to provinces" ON public.provinces FOR SELECT USING (true);

-- 2. Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- References auth.users(id) in live db
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  birth_date TEXT,
  phone_number TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- 3. Create destinations table
CREATE TABLE public.destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  province_id TEXT REFERENCES public.provinces(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  rating DOUBLE PRECISION DEFAULT 0.0,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to destinations" ON public.destinations FOR SELECT USING (true);

-- 4. Create reviews table
CREATE TABLE public.reviews (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow users to insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update their own reviews" ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Allow users to delete their own reviews" ON public.reviews FOR DELETE USING (true);

-- 5. Create favorites table
CREATE TABLE public.favorites (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, destination_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to favorites" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "Allow users to insert favorites" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to delete favorites" ON public.favorites FOR DELETE USING (true);

-- 6. Create feed_activities table
CREATE TABLE public.feed_activities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('review', 'favorite')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  source_id TEXT NOT NULL,
  rating INTEGER,
  review_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feed_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to feed_activities" ON public.feed_activities FOR SELECT USING (true);


-- ==========================================
-- Triggers configuration
-- ==========================================

-- Trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'displayName', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatarUrl', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
    'Explorer of Vietnam.'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for reviews feed activities
CREATE OR REPLACE FUNCTION public.handle_review_feed_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.feed_activities (id, type, user_id, destination_id, source_id, rating, review_content, created_at)
    VALUES ('act-rev-' || NEW.id, 'review', NEW.user_id, NEW.destination_id, NEW.id, NEW.rating, NEW.content, NEW.created_at);
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.feed_activities
    SET rating = NEW.rating, review_content = NEW.content
    WHERE source_id = NEW.id;
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.feed_activities WHERE source_id = OLD.id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.handle_review_feed_activity();

-- Trigger for favorites feed activities
CREATE OR REPLACE FUNCTION public.handle_favorite_feed_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.feed_activities (id, type, user_id, destination_id, source_id, created_at)
    VALUES ('act-fav-' || NEW.id, 'favorite', NEW.user_id, NEW.destination_id, NEW.id, NEW.created_at);
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.feed_activities WHERE source_id = OLD.id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_favorite_changed
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE PROCEDURE public.handle_favorite_feed_activity();


-- ==========================================
-- Seeding Mock Data
-- ==========================================

-- Seeding Provinces
INSERT INTO public.provinces (id, name, slug, region, description, map_x, map_y) VALUES
('hanoi', 'Hanoi', 'hanoi', 'north', 'The thousand-year-old capital of Vietnam, famous for the Old Quarter, Hoan Kiem Lake, and rich street food culture.', 52, 22),
('quang-ninh', 'Quang Ninh', 'quang-ninh', 'north', 'A mining and tourism giant, home to the UNESCO-listed Ha Long Bay, Yen Tu sacred peak, and pristine Co To island.', 58, 14),
('lao-cai', 'Lao Cai', 'lao-cai', 'north', 'Famous for Sapa''s misty terraced hills, Fansipan peak (the roof of Indochina), and colorful ethnic markets.', 42, 10),
('ninh-binh', 'Ninh Binh', 'ninh-binh', 'north', 'Known as Ha Long Bay on land, featuring the Trang An Scenic Landscape, Tam Coc caves, and massive Bai Dinh pagoda.', 50, 28),
('ha-giang', 'Ha Giang', 'ha-giang', 'north', 'The northernmost frontier, legendary for the Dong Van Karst Plateau, Ma Pi Leng Pass, and authentic ethnic minority culture.', 38, 6),
('cao-bang', 'Cao Bang', 'cao-bang', 'north', 'A border province in the north, home to the majestic Ban Gioc Waterfall, Pac Bo Cave, and dramatic mountain scenery.', 46, 5),
('lang-son', 'Lang Son', 'lang-son', 'north', 'A mountainous border gate province famous for Mau Son peak, Tan Thanh border market, and historic caves.', 54, 12),
('bac-kan', 'Bac Kan', 'bac-kan', 'north', 'A mountainous northern province home to Ba Be National Park and the magnificent freshwater Ba Be Lake.', 46, 8),
('tuyen-quang', 'Tuyen Quang', 'tuyen-quang', 'north', 'A historic revolutionary base, known for Na Hang lake, green mountains, and rich forest ecosystems.', 44, 12),
('yen-bai', 'Yen Bai', 'yen-bai', 'north', 'A northern mountain province featuring the breathtaking Mu Cang Chai terraced rice fields and Thac Ba Lake.', 40, 14),
('thai-nguyen', 'Thai Nguyen', 'thai-nguyen', 'north', 'The capital of Vietnamese green tea, boasting beautiful rolling tea hills, Nui Coc lake, and museum heritage.', 48, 16),
('phu-tho', 'Phu Tho', 'phu-tho', 'north', 'The ancestral land of Vietnam, home to the Hung Kings temple and traditional local folk heritage.', 45, 18),
('vinh-phuc', 'Vinh Phuc', 'vinh-phuc', 'north', 'Home to Tam Dao misty hill station, Tay Thien zen pagoda, and beautiful northern resort landscapes.', 48, 20),
('bac-giang', 'Bac Giang', 'bac-giang', 'north', 'A northern province rich in historic pagodas, vast lychee orchards, and traditional folk villages.', 54, 18),
('bac-ninh', 'Bac Ninh', 'bac-ninh', 'north', 'The cradle of Quan Ho folk singing, featuring historic temples, ancient pagodas, and traditional craft villages.', 52, 20),
('hung-yen', 'Hung Yen', 'hung-yen', 'north', 'Famous for Pho Hien historical port town relics, sweet longan fruit orchards, and traditional architectures.', 52, 24),
('hai-duong', 'Hai Duong', 'hai-duong', 'north', 'A northern agricultural and industrial province, famous for Kiep Bac temple and green bean cake.', 55, 22),
('hai-phong', 'Hai Phong', 'hai-phong', 'north', 'The major port city of the north, and a key gateway to Cat Ba Island and Lan Ha Bay.', 57, 21),
('thai-binh', 'Thai Binh', 'thai-binh', 'north', 'A fertile northern agricultural delta province, known for traditional water puppetry and local beaches.', 54, 26),
('ha-nam', 'Ha Nam', 'ha-nam', 'north', 'A peaceful northern province, home to the massive Tam Chuc Pagoda complex, the largest in the world.', 50, 25),
('nam-dinh', 'Nam Dinh', 'nam-dinh', 'north', 'A northern province rich in historic Catholic churches, Tran Temple relic, and Vieng spring market.', 52, 28),
('hoa-binh', 'Hoa Binh', 'hoa-binh', 'north', 'A gateway to the northwest, famous for Muong ethnic culture, Mai Chau Valley, and the Hoa Binh Hydroelectric Dam.', 45, 24),
('son-la', 'Son La', 'son-la', 'north', 'A mountainous province famous for Moc Chau tea plateau, dairy farms, and the historic Son La prison.', 34, 18),
('dien-bien', 'Dien Bien', 'dien-bien', 'north', 'Famous for the historic Dien Bien Phu battlefield victory and majestic northern mountain landscapes.', 28, 14),
('lai-chau', 'Lai Chau', 'lai-chau', 'north', 'A mountainous northern province known for majestic peaks like Pusilung and colorful ethnic cultures.', 32, 10),
('thua-thien-hue', 'Thua Thien Hue', 'thua-thien-hue', 'central', 'The imperial heart of Vietnam, home to the royal Citadel, royal tombs, and romantic Perfume River.', 54, 40),
('da-nang', 'Da Nang', 'da-nang', 'central', 'A dynamic coastal city in central Vietnam, famous for the Golden Bridge, Marble Mountains, and long sandy beaches.', 58, 46),
('quang-nam', 'Quang Nam', 'quang-nam', 'central', 'Famous for the beautifully preserved Hoi An Ancient Town, My Son Cham Sanctuary, and clean beaches.', 56, 48),
('khanh-hoa', 'Khanh Hoa', 'khanh-hoa', 'central', 'Home to Nha Trang Bay, one of the world''s most beautiful bays, famous for sandy beaches and island resorts.', 60, 58),
('quang-binh', 'Quang Binh', 'quang-binh', 'central', 'Home to Phong Nha - Ke Bang national park, containing the world''s largest caves like Son Doong.', 50, 36),
('lam-dong', 'Lam Dong', 'lam-dong', 'central', 'A highland province famous for Da Lat city''s cool climate, pine forests, lakes, and flower valleys.', 56, 66),
('thanh-hoa', 'Thanh Hoa', 'thanh-hoa', 'central', 'A large province containing Sam Son beach, Ben En national park, and Ho Dynasty Citadel heritage.', 46, 30),
('nghe-an', 'Nghe An', 'nghe-an', 'central', 'The largest province in Vietnam, birth place of President Ho Chi Minh, featuring Cua Lo beach.', 44, 33),
('ha-tinh', 'Ha Tinh', 'ha-tinh', 'central', 'A land of historical significance and scenic spots like Thien Cam Beach and Ke Go Lake.', 47, 35),
('quang-tri', 'Quang Tri', 'quang-tri', 'central', 'A province rich in history, featuring the Vietnam War DMZ, Vinh Moc tunnels, and Hien Luong bridge.', 52, 38),
('quang-ngai', 'Quang Ngai', 'quang-ngai', 'central', 'A coastal province home to Ly Son volcanic island, known for garlic farms and pristine volcanic cliffs.', 58, 51),
('binh-dinh', 'Binh Dinh', 'binh-dinh', 'central', 'A central coastal province known for Cham towers, martial arts tradition, and beautiful Quy Nhon beaches.', 60, 54),
('phu-yen', 'Phu Yen', 'phu-yen', 'central', 'A central coastal province famous for Ghenh Da Dia basalt columns and peaceful pristine bays.', 61, 56),
('ninh-thuan', 'Ninh Thuan', 'ninh-thuan', 'central', 'A sunny land of Champa culture, vineyards, sheep farms, and Vinh Hy beautiful bay.', 59, 62),
('binh-thuan', 'Binh Thuan', 'binh-thuan', 'central', 'Famous for Mui Ne''s red and white sand dunes, dragon fruit, and windy beaches for kiteboarding.', 57, 65),
('kon-tum', 'Kon Tum', 'kon-tum', 'central', 'A northern highland province featuring historic wooden churches and traditional ethnic Rong houses.', 52, 52),
('gia-lai', 'Gia Lai', 'gia-lai', 'central', 'A Central Highlands province featuring To Nung Lake, vast coffee farms, and indigenous culture.', 53, 55),
('dak-lak', 'Dak Lak', 'dak-lak', 'central', 'The coffee capital of Vietnam in the Central Highlands, known for Yok Don National Park and elephant culture.', 54, 59),
('dak-nong', 'Dak Nong', 'dak-nong', 'central', 'A highland province boasting dramatic waterfalls, volcanic caves, and vast tea and coffee plantations.', 53, 62),
('ho-chi-minh', 'Ho Chi Minh City', 'ho-chi-minh', 'south', 'The bustling economic engine of Vietnam, featuring colonial architecture and vibrant city life.', 54, 82),
('kien-giang', 'Kien Giang', 'kien-giang', 'south', 'Famous for Phu Quoc island paradise, Ha Tien border town, and rich coastal biodiversity.', 36, 88),
('can-tho', 'Can Tho', 'can-tho', 'south', 'The heart of the Mekong Delta, famous for Cai Rang Floating Market and Ninh Kieu Wharf.', 48, 78),
('ba-ria-vung-tau', 'Ba Ria - Vung Tau', 'ba-ria-vung-tau', 'south', 'A coastal gateway in the south, known for sandy beaches, ocean resorts, and offshore oil industries.', 58, 80),
('an-giang', 'An Giang', 'an-giang', 'south', 'A southwestern province in the Mekong Delta, famous for Ba Chua Xu Temple and Tra Su Cajuput Forest.', 42, 84),
('binh-phuoc', 'Binh Phuoc', 'binh-phuoc', 'south', 'A southern border province known for rubber plantations, cashew nuts, and Bu Gia Map National Park.', 51, 72),
('tay-ninh', 'Tay Ninh', 'tay-ninh', 'south', 'Home to Ba Den Mountain, Cao Dai Holy See, and the southern revolutionary base.', 48, 75),
('binh-duong', 'Binh Duong', 'binh-duong', 'south', 'An industrial hub near HCMC, also famous for Lai Thieu fruit orchards and ceramic craft villages.', 52, 76),
('dong-nai', 'Dong Nai', 'dong-nai', 'south', 'A large industrial province bordering HCMC, home to Nam Cat Tien National Park and diverse eco-tourism.', 56, 77),
('long-an', 'Long An', 'long-an', 'south', 'A peaceful gateway between HCMC and the Mekong Delta, known for Tan Lap floating village.', 50, 83),
('tien-giang', 'Tien Giang', 'tien-giang', 'south', 'Famous for Vinh Trang pagoda, Thoi Son islet, and rich tropical fruit orchards.', 48, 84),
('ben-tre', 'Ben Tre', 'ben-tre', 'south', 'The coconut capital of Vietnam, boasting lush fruit orchards and peaceful canal-lined villages.', 50, 86),
('tra-vinh', 'Tra Vinh', 'tra-vinh', 'south', 'A quiet delta province with a high Khmer population, hundreds of ancient trees, and unique pagodas.', 49, 88),
('vinh-long', 'Vinh Long', 'vinh-long', 'south', 'An agricultural delta land famous for clay houses, pottery villages, and fruit orchards.', 47, 86),
('dong-thap', 'Dong Thap', 'dong-thap', 'south', 'Famous for Sa Dec flower village, pink lotus fields, and rich bird sanctuaries in Tram Chim.', 44, 83),
('hau-giang', 'Hau Giang', 'hau-giang', 'south', 'A quiet delta province characterized by vast rice fields, fruit orchards, and Lung Ngoc Hoang reserve.', 45, 88),
('soc-trang', 'Soc Trang', 'soc-trang', 'south', 'Known for Khmer pagodas, floating markets, and the vibrant Ok Om Bok festival.', 46, 90),
('bac-lieu', 'Bac Lieu', 'bac-lieu', 'south', 'A delta province famous for Don Ca Tai Tu music, wind farms, and the legend of the Bac Lieu Playboy.', 44, 92),
('ca-mau', 'Ca Mau', 'ca-mau', 'south', 'The southernmost province of Vietnam, featuring extensive mangrove forests and Cape Ca Mau.', 40, 94);

-- Seeding Destinations
INSERT INTO public.destinations (id, name, slug, province_id, description, rating, image, category, latitude, longitude) VALUES
('dest-halong', 'Ha Long Bay', 'ha-long-bay', 'quang-ninh', 'A spectacular landscape of thousands of limestone karsts and isles rising out of the emerald water of the Gulf of Tonkin.', 4.9, 'https://images.unsplash.com/photo-1559592413-7cec4d0c213c?auto=format&fit=crop&w=800&q=80', 'Nature', 20.9101, 107.1839),
('dest-hoian', 'Hoi An Ancient Town', 'hoi-an', 'quang-nam', 'An exceptionally well-preserved example of a Southeast Asian trading port from the 15th to the 19th century, famous for its lantern-lit streets.', 4.8, 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', 'Cultural', 15.8801, 108.338),
('dest-phongnha', 'Phong Nha - Ke Bang National Park', 'phong-nha', 'quang-binh', 'Home to some of the world''s largest wet and dry caves, including Son Doong and Paradise Cave, nestled in one of the oldest karst zones in Asia.', 4.9, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', 'Nature', 17.5912, 106.2847),
('dest-trangan', 'Trang An Landscape Complex', 'trang-an', 'ninh-binh', 'A stunning landscape of limestone karst peaks permeated with valleys, many of them partly submerged and surrounded by steep, vertical cliffs.', 4.9, 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', 'Nature', 20.2541, 105.9082),
('dest-sapa', 'Sapa Town', 'sapa', 'lao-cai', 'A beautiful mountain town overlooking cascading rice terraces and Muong Hoa Valley, situated close to the highest peak in Indochina, Fansipan.', 4.8, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', 'Mountain', 22.3364, 103.8438),
('dest-hue', 'Imperial City of Hue', 'hue', 'thua-thien-hue', 'The former capital of Vietnam during the Nguyen Dynasty, representing the royal court, temples, and imperial tombs along the Perfume River.', 4.6, 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', 'Historical', 16.4674, 107.5786),
('dest-phuquoc', 'Phu Quoc Island', 'phu-quoc', 'kien-giang', 'A tropical paradise in the Gulf of Thailand, known for its pristine white-sand beaches, coconut trees, local fish sauce, and premium resorts.', 4.8, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Beach', 10.2899, 103.984),
('dest-danang', 'Ba Na Hills & Golden Bridge', 'da-nang', 'da-nang', 'A coastal city famous for its sandy beaches and the iconic Golden Bridge held by two giant stone hands in the Ba Na Hills retreat.', 4.7, 'https://images.unsplash.com/photo-1583417319070-4a432dbff03e?auto=format&fit=crop&w=800&q=80', 'Mountain', 15.9984, 107.9964),
('dest-cuchi', 'Cu Chi Tunnels', 'cu-chi-tunnels', 'ho-chi-minh', 'An immense network of underground tunnels that served as a military base of operations during the Vietnam War, illustrating history and resilience.', 4.5, 'https://images.unsplash.com/photo-1583417319070-4a432dbff03e?auto=format&fit=crop&w=800&q=80', 'Historical', 11.1419, 106.4633),
('dest-dalat', 'Da Lat City', 'da-lat', 'lam-dong', 'Nicknamed the ''City of Eternal Spring'', Da Lat is a misty highland escape known for French colonial villas, pine forests, and flower farms.', 4.6, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', 'Mountain', 11.9404, 108.4583),
('dest-nhatrang', 'Nha Trang Beach', 'nha-trang', 'khanh-hoa', 'A vibrant beach city known for its beautiful bay, sandy beaches, marine reserves, scuba diving sites, and offshore amusement park.', 4.5, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Beach', 12.2388, 109.1967),
('dest-muine', 'Mui Ne Sand Dunes', 'mui-ne', 'binh-thuan', 'Famous for its vast Sahara-like white and red sand dunes, fairy stream, kiteboarding, and local fishing villages.', 4.4, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Nature', 10.9333, 108.2833),
('dest-cairang', 'Cai Rang Floating Market', 'cai-rang', 'can-tho', 'The largest floating market in the Mekong Delta, where hundreds of boats gather daily at dawn to trade local fruits, vegetables, and goods.', 4.6, 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', 'Cultural', 9.9996, 105.7423),
('dest-bangioc', 'Ban Gioc Waterfall', 'ban-gioc', 'cao-bang', 'One of the most majestic waterfalls in Southeast Asia, straddling the border between Vietnam and China amidst lush green karst scenery.', 4.9, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', 'Nature', 22.8631, 106.7229),
('dest-myson', 'My Son Sanctuary', 'my-son', 'quang-nam', 'A cluster of partially ruined Hindu temples constructed by the kings of Champa between the 4th and the 14th century, tucked in a lush valley.', 4.5, 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', 'Historical', 15.7642, 108.1242),
('dest-hagiang', 'Ha Giang Loop & Ma Pi Leng Pass', 'ha-giang', 'ha-giang', 'The legendary northern loop offering spectacular views of towering limestone peaks, deep canyons, and traditional ethnic minority culture.', 4.9, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', 'Mountain', 22.8164, 104.9961),
('dest-condao', 'Con Dao Islands', 'con-dao', 'ba-ria-vung-tau', 'An archipelago of 16 mountainous islands known for beautiful beaches, coral reefs, turtle nesting grounds, and its somber historical prison history.', 4.8, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Beach', 8.6811, 106.6086),
('dest-hoankiem', 'Hoan Kiem Lake & Hanoi Old Quarter', 'hanoi-old-quarter', 'hanoi', 'The beating heart of Hanoi, featuring the legendary Turtle Tower and bustling historical streets selling traditional crafts and street food.', 4.7, 'https://images.unsplash.com/photo-1583417319070-4a432dbff03e?auto=format&fit=crop&w=800&q=80', 'City', 21.0285, 105.8522),
('dest-fansipan', 'Fansipan Peak', 'fansipan', 'lao-cai', 'Known as ''The Roof of Indochina'', the highest peak in Vietnam (3,143m) offering panoramic mountain views, accessible by trekking or cable car.', 4.8, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', 'Mountain', 22.3033, 103.7747),
('dest-babe', 'Ba Be Lake', 'ba-be-lake', 'bac-kan', 'The largest natural freshwater lake in Vietnam, surrounded by high limestone mountains, thick forests, and ethnic Tay houses on stilts.', 4.7, 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', 'Nature', 22.4131, 105.6189);

-- Seeding Mock Users Profiles
INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, follower_count, following_count) VALUES
('00000000-0000-0000-0000-000000000001', 'traveler_vn', 'Nguyen Van A', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Avid traveler exploring every corner of beautiful Vietnam.', 124, 89),
('00000000-0000-0000-0000-000000000002', 'vietnam_explorer', 'Le Thi B', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Nature lover and photographer based in Da Nang.', 342, 156),
('00000000-0000-0000-0000-000000000003', 'city_wanderer', 'Tran Minh C', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Coffee shop hopper and urban photographer in HCMC.', 78, 110);

-- Seeding Mock Reviews
INSERT INTO public.reviews (id, destination_id, user_id, rating, title, content, created_at) VALUES
('rev-1', 'dest-halong', '00000000-0000-0000-0000-000000000001', 5, 'Unbelievable cruise!', 'An incredible overnight cruise around the limestone islands. Breathtaking views at sunset!', '2026-06-10T14:00:00Z'),
('rev-2', 'dest-hoian', '00000000-0000-0000-0000-000000000002', 5, 'Lantern magic', 'Walking through the ancient town at night with lanterns lit everywhere was absolutely magical.', '2026-06-12T09:30:00Z'),
('rev-3', 'dest-halong', '00000000-0000-0000-0000-000000000002', 4, 'Stunning but crowded', 'Loved the scenery, but there were many tourist boats. Still a must-see in Vietnam!', '2026-06-13T16:45:00Z'),
('rev-4', 'dest-sapa', '00000000-0000-0000-0000-000000000001', 5, 'Beautiful terraces', 'Trekking through the Sapa rice terraces was a highlight of my trip. The homestay hospitality was wonderful.', '2026-06-14T11:20:00Z'),
('rev-5', 'dest-phuquoc', '00000000-0000-0000-0000-000000000003', 4, 'Relaxing beaches', 'Great resort experience, pristine white sand beaches, and excellent seafood at the night market.', '2026-06-14T15:10:00Z');

-- Seeding Mock Favorites
INSERT INTO public.favorites (id, user_id, destination_id, created_at) VALUES
('fav-1', '00000000-0000-0000-0000-000000000001', 'dest-halong', '2026-06-11T12:00:00Z'),
('fav-2', '00000000-0000-0000-0000-000000000001', 'dest-sapa', '2026-06-12T15:00:00Z'),
('fav-3', '00000000-0000-0000-0000-000000000002', 'dest-hoian', '2026-06-13T08:00:00Z'),
('fav-4', '00000000-0000-0000-0000-000000000003', 'dest-phuquoc', '2026-06-14T09:00:00Z');
