
-- updates
CREATE TABLE public.updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  body_mr text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  category_mr text NOT NULL DEFAULT '',
  category_en text NOT NULL DEFAULT '',
  is_pinned boolean NOT NULL DEFAULT false,
  is_important boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  publish_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.updates TO anon, authenticated;
GRANT ALL ON public.updates TO service_role;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "updates public read" ON public.updates FOR SELECT TO anon, authenticated USING (is_archived = false AND publish_at <= now());

-- development works
CREATE TABLE public.works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  desc_mr text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Hammer',
  status_mr text NOT NULL DEFAULT '',
  status_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.works TO anon, authenticated;
GRANT ALL ON public.works TO service_role;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "works public read" ON public.works FOR SELECT TO anon, authenticated USING (true);

-- government schemes
CREATE TABLE public.schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mr text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  category_mr text NOT NULL DEFAULT '',
  category_en text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  banner_url text NOT NULL DEFAULT '',
  desc_mr text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  eligibility_mr text NOT NULL DEFAULT '',
  eligibility_en text NOT NULL DEFAULT '',
  documents_mr text NOT NULL DEFAULT '',
  documents_en text NOT NULL DEFAULT '',
  benefits_mr text NOT NULL DEFAULT '',
  benefits_en text NOT NULL DEFAULT '',
  last_date text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  is_new boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schemes TO anon, authenticated;
GRANT ALL ON public.schemes TO service_role;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schemes public read" ON public.schemes FOR SELECT TO anon, authenticated USING (is_active = true);

-- admin users (server-only access)
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_users TO service_role;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_users (mobile, name, role) VALUES ('9422115394', 'Sanjay Chaudhary', 'super_admin');

-- gallery media type
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'photo';
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '';

-- office details
ALTER TABLE public.app_config ADD COLUMN IF NOT EXISTS office_address_mr text NOT NULL DEFAULT '';
ALTER TABLE public.app_config ADD COLUMN IF NOT EXISTS office_address_en text NOT NULL DEFAULT '';
ALTER TABLE public.app_config ADD COLUMN IF NOT EXISTS office_map_url text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER updates_set_updated_at BEFORE UPDATE ON public.updates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER works_set_updated_at BEFORE UPDATE ON public.works FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER schemes_set_updated_at BEFORE UPDATE ON public.schemes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- seed content
INSERT INTO public.updates (title_mr, title_en, body_mr, body_en, category_mr, category_en, is_important, is_pinned) VALUES
('उद्या पाणीपुरवठा बंद', 'Water supply shutdown tomorrow', 'उद्या सकाळी १० ते ५ वाजेपर्यंत प्रभागात पाणीपुरवठा बंद राहील. कृपया पाणी साठवून ठेवा.', 'Water supply will remain shut from 10 AM to 5 PM tomorrow. Please store water in advance.', 'पाणी', 'Water', true, true),
('नवीन रस्ता उद्घाटन', 'New road inauguration', 'प्रभागातील नवीन काँक्रीट रस्त्याचे उद्घाटन रविवारी सकाळी ९ वाजता होणार आहे.', 'The new concrete road will be inaugurated on Sunday at 9 AM.', 'विकासकामे', 'Development', false, false),
('स्वच्छता अभियान', 'Cleanliness drive', 'शनिवारी सकाळी ७ वाजता स्वच्छता अभियान. सर्व नागरिकांनी सहभागी व्हावे.', 'Cleanliness drive on Saturday at 7 AM. All citizens are welcome to join.', 'स्वच्छता', 'Sanitation', false, false),
('मोफत आरोग्य शिबीर', 'Free health camp', 'रविवारी सकाळी १० ते दुपारी २ पर्यंत मोफत आरोग्य तपासणी शिबीर.', 'Free health check-up camp on Sunday from 10 AM to 2 PM.', 'आरोग्य', 'Health', false, false);

INSERT INTO public.works (title_mr, title_en, desc_mr, desc_en, icon, status_mr, status_en, sort_order) VALUES
('रस्ते', 'Roads', 'नवीन काँक्रीट रस्ते व दुरुस्ती', 'New concrete roads and repairs', 'Route', 'सुरू', 'Ongoing', 1),
('पाणीपुरवठा', 'Water supply', 'नवीन जलवाहिनी व टाकी दुरुस्ती', 'New pipelines and tank repairs', 'Droplets', 'पूर्ण', 'Completed', 2),
('पथदिवे', 'Street lights', 'एलईडी पथदिवे बसवणे', 'LED street light installation', 'Lightbulb', 'सुरू', 'Ongoing', 3),
('गटार', 'Drainage', 'गटार सफाई व बांधकाम', 'Drainage cleaning and construction', 'Waves', 'सुरू', 'Ongoing', 4),
('उद्यान', 'Garden', 'उद्यान सुशोभीकरण', 'Garden beautification', 'Trees', 'पूर्ण', 'Completed', 5),
('शाळा', 'School', 'शाळा डिजिटल वर्ग', 'Digital classrooms in schools', 'GraduationCap', 'सुरू', 'Ongoing', 6),
('आरोग्य', 'Health', 'आरोग्य केंद्र सुविधा', 'Health centre facilities', 'HeartPulse', 'सुरू', 'Ongoing', 7);

INSERT INTO public.schemes (name_mr, name_en, category_mr, category_en, desc_mr, desc_en, eligibility_mr, eligibility_en, documents_mr, documents_en, benefits_mr, benefits_en, website_url, is_featured, is_new, sort_order) VALUES
('पीएम किसान सन्मान निधी', 'PM Kisan Samman Nidhi', 'शेती', 'Agriculture', 'शेतकऱ्यांना वार्षिक ६००० रुपये थेट खात्यात.', 'Rs 6000 per year directly to farmers bank accounts.', 'जमीनधारक शेतकरी कुटुंब', 'Land-holding farmer families', 'आधार कार्ड, ७/१२ उतारा, बँक पासबुक', 'Aadhaar, land record, bank passbook', 'वर्षाला ३ हप्त्यांमध्ये ६००० रुपये', 'Rs 6000 in three instalments a year', 'https://pmkisan.gov.in', true, false, 1),
('लाडकी बहीण योजना', 'Ladki Bahin Yojana', 'महिला', 'Women', 'पात्र महिलांना दरमहा आर्थिक मदत.', 'Monthly financial assistance for eligible women.', '२१ ते ६५ वयोगटातील महाराष्ट्रातील महिला', 'Women of Maharashtra aged 21 to 65', 'आधार कार्ड, रहिवासी दाखला, बँक पासबुक', 'Aadhaar, domicile certificate, bank passbook', 'दरमहा आर्थिक लाभ', 'Monthly financial benefit', 'https://ladakibahin.maharashtra.gov.in', true, true, 2),
('आयुष्मान भारत', 'Ayushman Bharat', 'आरोग्य', 'Health', 'प्रति कुटुंब ५ लाखांपर्यंत मोफत उपचार.', 'Free treatment up to Rs 5 lakh per family.', 'पात्र यादीतील कुटुंबे', 'Families in the eligible list', 'आधार कार्ड, रेशन कार्ड', 'Aadhaar, ration card', 'मोफत रुग्णालय उपचार', 'Cashless hospital treatment', 'https://pmjay.gov.in', false, false, 3),
('पीएम आवास योजना', 'PM Awas Yojana', 'घरकुल', 'Housing', 'घरकुल बांधकामासाठी अनुदान.', 'Subsidy for building a home.', 'बेघर व कच्चे घर असलेली कुटुंबे', 'Homeless families or those with kutcha houses', 'आधार कार्ड, उत्पन्न दाखला', 'Aadhaar, income certificate', 'घर बांधणीसाठी आर्थिक मदत', 'Financial help to build a house', 'https://pmaymis.gov.in', false, false, 4),
('महाडीबीटी शिष्यवृत्ती', 'MahaDBT Scholarship', 'विद्यार्थी', 'Students', 'विद्यार्थ्यांसाठी शिष्यवृत्ती पोर्टल.', 'Scholarship portal for students.', 'महाराष्ट्रातील विद्यार्थी', 'Students of Maharashtra', 'आधार, गुणपत्रिका, उत्पन्न दाखला', 'Aadhaar, marksheet, income certificate', 'शिक्षण शुल्क व निर्वाह भत्ता', 'Tuition fee and maintenance allowance', 'https://mahadbt.maharashtra.gov.in', false, true, 5),
('उत्पन्न दाखला', 'Income Certificate', 'दाखले', 'Certificates', 'आपले सरकार पोर्टलवरून उत्पन्न दाखला.', 'Apply for an income certificate on Aaple Sarkar.', 'सर्व नागरिक', 'All citizens', 'आधार, रहिवासी पुरावा', 'Aadhaar, address proof', 'शासकीय योजनांसाठी आवश्यक दाखला', 'Certificate needed for government schemes', 'https://aaplesarkar.mahaonline.gov.in', false, false, 6);
