-- App configuration (single row)
CREATE TABLE public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_name_mr text NOT NULL DEFAULT 'संजय चौधरी',
  rep_name_en text NOT NULL DEFAULT 'Sanjay Chaudhary',
  ward_mr text NOT NULL DEFAULT 'प्रभाग क्र. १२',
  ward_en text NOT NULL DEFAULT 'Ward No. 12',
  slogan_mr text NOT NULL DEFAULT 'आपल्या सेवेसाठी सदैव तत्पर',
  slogan_en text NOT NULL DEFAULT 'Always at your service',
  tagline_mr text NOT NULL DEFAULT 'तुमची तक्रार, आमची जबाबदारी',
  tagline_en text NOT NULL DEFAULT 'Your complaint, our responsibility',
  party_name_mr text NOT NULL DEFAULT 'भारतीय जनता पार्टी',
  party_name_en text NOT NULL DEFAULT 'Bharatiya Janata Party',
  photo_url text NOT NULL DEFAULT '',
  party_logo_url text NOT NULL DEFAULT '',
  app_name text NOT NULL DEFAULT 'Sanjay Chaudhary',
  app_icon_url text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '9422115394',
  whatsapp text NOT NULL DEFAULT '9422115394',
  accent_color text NOT NULL DEFAULT '#F2760A',
  admin_phone text NOT NULL DEFAULT '9422115394',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_config TO anon, authenticated;
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_config public read" ON public.app_config FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.app_config (photo_url, party_logo_url, app_icon_url) VALUES
  ('/__l5e/assets-v1/032eba13-b10f-47da-b580-75e70ce548c9/rep_speaking.jpg',
   '/__l5e/assets-v1/d6d51ae7-6dac-4f22-93e8-e38dc00db5fc/logo_bjp.png',
   '/__l5e/assets-v1/d6d51ae7-6dac-4f22-93e8-e38dc00db5fc/logo_bjp.png');

-- Complaint categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mr text NOT NULL,
  name_en text NOT NULL,
  icon text NOT NULL DEFAULT 'CircleAlert',
  message_mr text NOT NULL,
  message_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.categories (name_mr, name_en, icon, message_mr, message_en, sort_order) VALUES
 ('पाणीपुरवठा','Water Supply','Droplets','नमस्कार साहेब, मला पाणीपुरवठा संबंधित समस्या आहे.','Hello Sir, I have a water supply related problem.',1),
 ('रस्ता दुरुस्ती','Road Repair','Construction','नमस्कार साहेब, आमच्या भागातील रस्ता दुरुस्तीची गरज आहे.','Hello Sir, the road in our area needs repair.',2),
 ('गटार / स्वच्छता','Drainage / Sanitation','Trash2','नमस्कार साहेब, गटार व स्वच्छते संबंधित समस्या आहे.','Hello Sir, there is a drainage/sanitation problem.',3),
 ('वीज समस्या','Electricity','Zap','नमस्कार साहेब, वीज पुरवठ्या संबंधित समस्या आहे.','Hello Sir, there is an electricity supply problem.',4),
 ('पथदिवे','Streetlights','Lightbulb','नमस्कार साहेब, आमच्या भागातील पथदिवे बंद आहेत.','Hello Sir, the streetlights in our area are not working.',5),
 ('आरोग्य मदत','Health Help','HeartPulse','नमस्कार साहेब, मला आरोग्य विषयक मदतीची गरज आहे.','Hello Sir, I need help regarding health services.',6),
 ('शिक्षण मदत','Education Help','GraduationCap','नमस्कार साहेब, मला शिक्षण विषयक मदतीची गरज आहे.','Hello Sir, I need help regarding education.',7),
 ('उद्यान / वृक्ष','Garden / Trees','Trees','नमस्कार साहेब, उद्यान व वृक्ष संबंधित समस्या आहे.','Hello Sir, there is an issue regarding gardens/trees.',8);

-- App users (device based, no password)
CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  name text NOT NULL,
  mobile text NOT NULL,
  push_token text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.app_users TO anon, authenticated;
GRANT ALL ON public.app_users TO service_role;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_users self insert" ON public.app_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "app_users self update" ON public.app_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Complaint taps log
CREATE TABLE public.complaint_taps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  user_name text NOT NULL,
  mobile text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaint_taps TO anon, authenticated;
GRANT ALL ON public.complaint_taps TO service_role;
ALTER TABLE public.complaint_taps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "taps insert" ON public.complaint_taps FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "taps own read" ON public.complaint_taps FOR SELECT TO anon, authenticated USING (true);

-- Broadcast notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  body_mr text NOT NULL,
  body_en text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notifications TO anon, authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications public read" ON public.notifications FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.notifications (title_mr, title_en, body_mr, body_en) VALUES
 ('अ‍ॅपमध्ये स्वागत आहे','Welcome to the app','आपल्या तक्रारी थेट नगरसेवकांपर्यंत पोहोचवा.','Send your complaints directly to your representative.');

-- Gallery
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.gallery (title_mr, title_en, image_url, sort_order) VALUES
 ('जनसंपर्क','Public outreach','/__l5e/assets-v1/2da4a322-5449-4877-a5f5-ff325d52df74/rep_portrait.jpg',1),
 ('कार्यक्रम','Event','/__l5e/assets-v1/032eba13-b10f-47da-b580-75e70ce548c9/rep_speaking.jpg',2);