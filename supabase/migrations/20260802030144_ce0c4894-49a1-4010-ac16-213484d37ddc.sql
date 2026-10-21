GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT ALL ON public.media_assets TO service_role;

UPDATE public.app_config
SET party_logo_url = '/branding/bjp-lotus.png',
    app_icon_url = '/branding/bjp-lotus.png',
    updated_at = now();

DELETE FROM public.gallery;
INSERT INTO public.gallery (title_mr, title_en, image_url, video_url, media_type, sort_order) VALUES
('नागरिकांशी थेट संवाद', 'Direct dialogue with citizens', '/gallery/citizen-outreach.webp', '', 'photo', 1),
('पुल परिसराची पाहणी', 'Bridge area inspection', '/gallery/bridge-visit.webp', '', 'photo', 2),
('विकासकामाचे विधिवत पूजन', 'Community development ceremony', '/gallery/community-ritual.webp', '', 'photo', 3),
('स्थानिक नागरिकांसोबत भेट', 'Meeting with local residents', '/gallery/community-gathering.webp', '', 'photo', 4),
('नवीन कामाचे भूमिपूजन', 'Groundbreaking for new work', '/gallery/groundbreaking.webp', '', 'photo', 5),
('विकासकामांची प्रत्यक्ष पाहणी', 'On-site development review', '/gallery/work-inspection.webp', '', 'photo', 6),
('नागरिकांना अभिवादन', 'Greeting ward residents', '/gallery/public-greeting.webp', '', 'photo', 7),
('जनतेशी संवाद', 'Public address and outreach', '/gallery/public-address.webp', '', 'photo', 8);