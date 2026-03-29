-- Flowstate IR — Seed Data: Funds & Decision Makers
-- Supply Chain, Warehousing/Industrial RE, E-Commerce Tech

-- ─────────────────────────────────────────
-- Supply Chain Funds
-- ─────────────────────────────────────────
insert into public.funds (id, name, hq, check_min, check_max, aum, category, stages, about, color, color_bg, portfolio, website, activity_status, activity_note)
values
(
  '11111111-0001-0001-0001-000000000001',
  'Dynamo Ventures', 'Chattanooga, TN, USA',
  250000, 1500000, '$54M (Fund III)',
  'supply-chain', array['seed','pre-seed'],
  'Dynamo Ventures backs founders rebuilding supply chain infrastructure. Fund III focuses on freight visibility, warehousing automation, and last-mile logistics.',
  '#10B981', '#D1FAE5',
  array['Gatik','Stord','sennder','Steam Logistics'],
  'https://dynamo.vc', 'hot', 'Just led $8M seed into Flexe competitor — very active in warehouse-tech'
),
(
  '11111111-0001-0001-0001-000000000002',
  'Ironspring Ventures', 'Austin, TX, USA',
  2000000, 4000000, '$160M+ (Fund I+II)',
  'supply-chain', array['post-seed','series-a'],
  'Ironspring backs B2B software transforming industrial supply chains. Thesis: digitizing freight, manufacturing, and distribution.',
  '#6366F1', '#EEF2FF',
  array['Hadrian','Veho','Optimal Dynamics','GoodShip'],
  'https://ironspringventures.com', 'warm', 'Portfolio company Veho just raised $125M Series C'
),
(
  '11111111-0001-0001-0001-000000000003',
  'Construct Capital', 'Washington D.C., USA',
  1000000, 10000000, '~$300M',
  'supply-chain', array['seed','series-a'],
  'Construct Capital invests in tech rebuilding critical infrastructure — logistics, manufacturing, energy, and defense.',
  '#F59E0B', '#FEF3C7',
  array['Hadrian','Veho','Machina Labs','Sarcos'],
  'https://constructcap.com', 'hot', 'Announced new $150M fund focused on hard-tech supply chain'
),
(
  '11111111-0001-0001-0001-000000000004',
  'Schematic Ventures', 'San Francisco, CA, USA',
  500000, 3000000, '~$60M',
  'supply-chain', array['seed','series-a'],
  'Schematic backs technology transforming physical supply chains: freight, warehousing, manufacturing, and trade.',
  '#EC4899', '#FCE7F3',
  array['Flexport','project44','Stord','Transfix'],
  'https://schematic.vc', null, null
),
(
  '11111111-0001-0001-0001-000000000005',
  'Eclipse Ventures', 'Palo Alto, CA, USA',
  5000000, 30000000, '~$1.5B',
  'supply-chain', array['seed','early','late'],
  'Eclipse backs frontier tech companies rebuilding physical industries. Investments span robotics, autonomous systems, and supply chain automation.',
  '#8B5CF6', '#EDE9FE',
  array['Symbotic','Resilience','Planet','Nuro'],
  'https://eclipse.vc', 'warm', 'Partner spoke at Manifest 2024 on autonomous supply chains'
),
(
  '11111111-0001-0001-0001-000000000006',
  '8VC', 'San Francisco, CA, USA',
  5000000, 50000000, '$4B+',
  'supply-chain', array['early','growth'],
  '8VC is a technology-focused venture fund that invests across healthcare, supply chain, defense, and enterprise software.',
  '#0EA5E9', '#E0F2FE',
  array['Palantir','Joby Aviation','Andela','Relativity Space'],
  'https://8vc.com', null, null
),
(
  '11111111-0001-0001-0001-000000000007',
  'Fontinalis Partners', 'Detroit, MI, USA',
  2000000, 15000000, '~$250M',
  'supply-chain', array['early','growth'],
  'Fontinalis Partners invests in next-generation mobility and supply chain solutions, with a focus on connected infrastructure.',
  '#14B8A6', '#CCFBF1',
  array['HERE Technologies','KeepTruckin','FlixBus','Locus Robotics'],
  'https://fontinalis.com', null, null
),
(
  '11111111-0001-0001-0001-000000000008',
  'Plug and Play Tech Center', 'Sunnyvale, CA, USA',
  50000, 500000, '$45.5M',
  'supply-chain', array['seed','series-a'],
  'Plug and Play accelerates startups through corporate partnerships and invests in supply chain, fintech, health, and sustainability.',
  '#F97316', '#FED7AA',
  array['Truebill','Honey','Life360','2,200+ startups'],
  'https://plugandplaytechcenter.com', null, null
),
(
  '11111111-0001-0001-0001-000000000009',
  'Andreessen Horowitz (a16z)', 'Menlo Park, CA, USA',
  500000, 500000000, '$42B+',
  'supply-chain', array['seed','growth'],
  'a16z is a multi-stage VC firm backing bold entrepreneurs. Supply chain practice focuses on logistics automation and commerce infrastructure.',
  '#1D4ED8', '#DBEAFE',
  array['Flexport ($935M)','Convoy','Instacart','Lyft'],
  'https://a16z.com', 'hot', 'Just closed $7.2B Fund IX — actively looking for supply chain deals'
);

-- ─────────────────────────────────────────
-- E-Commerce / D2C Funds
-- ─────────────────────────────────────────
insert into public.funds (id, name, hq, check_min, check_max, aum, category, stages, about, color, color_bg, portfolio, website, activity_status, activity_note)
values
(
  '22222222-0002-0002-0002-000000000001',
  'Bessemer Venture Partners', 'San Francisco, CA, USA',
  1000000, 50000000, '$20B+',
  'ecommerce', array['seed','series-a','growth'],
  'Bessemer is a global multi-stage VC firm with a strong e-commerce and consumer portfolio.',
  '#7C3AED', '#EDE9FE',
  array['Shopify','Yelp','LinkedIn','Twilio'],
  'https://bvp.com', 'warm', 'New partner hired specifically for emerging markets e-commerce'
),
(
  '22222222-0002-0002-0002-000000000002',
  'Sequoia Capital', 'Menlo Park, CA, USA',
  1000000, 100000000, '$85B+',
  'ecommerce', array['seed','series-a','growth'],
  'Sequoia backs the daring few who build legendary companies from idea to IPO.',
  '#DC2626', '#FEE2E2',
  array['Apple','Google','Airbnb','DoorDash'],
  'https://sequoiacap.com', null, null
),
(
  '22222222-0002-0002-0002-000000000003',
  'Tiger Global Management', 'New York, NY, USA',
  5000000, 200000000, '$50B+',
  'ecommerce', array['series-a','growth'],
  'Tiger Global invests in internet, software, and emerging market consumer businesses globally.',
  '#B45309', '#FEF3C7',
  array['Flipkart','JD.com','Ola','Nubank'],
  'https://tigerglobal.com', 'hot', 'Doubling down on Southeast Asia e-commerce after Shopee success'
),
(
  '22222222-0002-0002-0002-000000000004',
  'Accel', 'Palo Alto, CA, USA',
  500000, 30000000, '$14B+',
  'ecommerce', array['seed','series-a','growth'],
  'Accel invests in people and technology that disrupts industries. Strong emerging markets presence.',
  '#059669', '#D1FAE5',
  array['Flipkart','Swiggy','Myntra','Urban Company'],
  'https://accel.com', 'warm', 'Accel India fund actively looking at Bangladesh market entry plays'
),
(
  '22222222-0002-0002-0002-000000000005',
  'Lightspeed Venture Partners', 'Menlo Park, CA, USA',
  500000, 50000000, '$25B+',
  'ecommerce', array['seed','series-a','growth'],
  'Lightspeed backs disruptive companies across consumer, enterprise, and technology sectors globally.',
  '#0284C7', '#E0F2FE',
  array['Snapchat','Affirm','OYO','Udaan'],
  'https://lsvp.com', null, null
);

-- ─────────────────────────────────────────
-- Warehousing / Industrial RE Funds
-- ─────────────────────────────────────────
insert into public.funds (id, name, hq, check_min, check_max, aum, category, stages, about, color, color_bg, portfolio, website, activity_status, activity_note)
values
(
  '33333333-0003-0003-0003-000000000001',
  'Prologis Ventures', 'San Francisco, CA, USA',
  1000000, 20000000, '$2B+',
  'warehousing', array['series-a','growth'],
  'Prologis Ventures is the corporate VC arm of Prologis, the world's largest industrial REIT. Backs startups modernizing warehouse operations.',
  '#0369A1', '#E0F2FE',
  array['Stord','Bowery Farming','Locus Robotics','Dexterity'],
  'https://prologis.com/ventures', 'hot', 'Deployed $200M into warehouse automation last quarter'
),
(
  '33333333-0003-0003-0003-000000000002',
  'GLP Capital Partners', 'Singapore',
  2000000, 30000000, '$120B AUM',
  'warehousing', array['series-a','growth'],
  'GLP is the largest warehouse network in Asia. GLP Capital Partners backs tech enabling smart logistics real estate.',
  '#4F46E5', '#EEF2FF',
  array['Lazada','Cainiao','Ninja Van','Anchanto'],
  'https://glp.com', 'hot', 'Opening $500M SEA logistics tech fund — Bangladesh in scope'
),
(
  '33333333-0003-0003-0003-000000000003',
  'CBRE Ventures', 'Los Angeles, CA, USA',
  1000000, 15000000, '$200M',
  'warehousing', array['seed','series-a'],
  'CBRE Ventures invests in proptech and supply chain tech with a focus on industrial real estate applications.',
  '#BE185D', '#FCE7F3',
  array['Liftit','Flexe','Stord','project44'],
  'https://cbreventures.com', 'warm', 'Portfolio Flexe raised $200M — watching warehouse-tech closely'
),
(
  '33333333-0003-0003-0003-000000000004',
  'Lineage Ventures', 'Novi, MI, USA',
  500000, 10000000, '$100M',
  'warehousing', array['seed','series-a'],
  'Lineage Ventures is the strategic investment arm of Lineage Logistics, the world''s largest temperature-controlled warehouse operator.',
  '#D97706', '#FEF3C7',
  array['Cold Chain Technologies','Turvo','TemperPack','Minnow'],
  'https://lineagelogistics.com', null, null
),
(
  '33333333-0003-0003-0003-000000000005',
  'Blackhorn Ventures', 'Denver, CO, USA',
  500000, 5000000, '$140M',
  'warehousing', array['seed','series-a'],
  'Blackhorn invests in capital-efficient B2B companies transforming industrial operations through hardware + software.',
  '#374151', '#F3F4F6',
  array['Outrider','Samsara','Aeva','Outrider'],
  'https://blackhorn.vc', null, null
);

-- ─────────────────────────────────────────
-- Decision Makers — Dynamo Ventures
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-dynamo-001', '11111111-0001-0001-0001-000000000001',
  'Santosh Sankar', 'General Partner',
  'santosh@dynamo.vc', 'https://linkedin.com/in/santoshsankar',
  'Santosh co-founded Dynamo Ventures after spending a decade operating in supply chain tech. He led deals in Gatik, Stord, and sennder.',
  'SS', '#2563EB'
),
(
  'dm-dynamo-002', '11111111-0001-0001-0001-000000000001',
  'Blythe Lollar', 'General Partner',
  'blythe@dynamo.vc', 'https://linkedin.com/in/blythe-lollar',
  'Blythe leads Dynamo''s Southeast portfolio with a focus on warehousing automation and cold-chain logistics.',
  'BL', '#059669'
),
(
  'dm-dynamo-003', '11111111-0001-0001-0001-000000000001',
  'Marcus Owens', 'Principal',
  'marcus@dynamo.vc', 'https://linkedin.com/in/marcusowens',
  'Marcus sources seed deals in freight visibility and last-mile logistics across North America and Asia.',
  'MO', '#7C3AED'
);

-- ─────────────────────────────────────────
-- Decision Makers — Ironspring
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-iron-001', '11111111-0001-0001-0001-000000000002',
  'Tiffany Luck', 'General Partner',
  'tiffany@ironspringventures.com', 'https://linkedin.com/in/tiffanyluck',
  'Tiffany focuses on supply chain software, industrial automation, and freight-tech. Board member at Hadrian and Optimal Dynamics.',
  'TF', '#DC2626'
),
(
  'dm-iron-002', '11111111-0001-0001-0001-000000000002',
  'Phil Jaeken', 'General Partner',
  'phil@ironspringventures.com', 'https://linkedin.com/in/philjaeken',
  'Phil leads Ironspring''s B2B enterprise investments. Former operator at XPO Logistics and McKinsey supply chain practice.',
  'PJ', '#D97706'
),
(
  'dm-iron-003', '11111111-0001-0001-0001-000000000002',
  'Alex Barton', 'Principal',
  'alex@ironspringventures.com', 'https://linkedin.com/in/alexbarton',
  'Alex sources deals in warehouse management systems, freight brokerage, and supply chain visibility.',
  'AB', '#0284C7'
);

-- ─────────────────────────────────────────
-- Decision Makers — Construct Capital
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-construct-001', '11111111-0001-0001-0001-000000000003',
  'Rachael Horwitz', 'General Partner',
  'rachael@constructcap.com', 'https://linkedin.com/in/rachaelhorwitz',
  'Rachael focuses on hard-tech and defense supply chains. Former comms VP at Facebook and Stripe.',
  'RH', '#7C3AED'
),
(
  'dm-construct-002', '11111111-0001-0001-0001-000000000003',
  'David Gonsalves', 'General Partner',
  'david@constructcap.com', 'https://linkedin.com/in/davidgonsalves',
  'David leads manufacturing and industrial investments. Former investor at Founders Fund.',
  'DG', '#059669'
);

-- ─────────────────────────────────────────
-- Decision Makers — Schematic
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-schematic-001', '11111111-0001-0001-0001-000000000004',
  'Jake Cohen', 'Founding Partner',
  'jake@schematic.vc', 'https://linkedin.com/in/jakecohen',
  'Jake led supply chain investments at Scale Venture Partners before founding Schematic. Board at Flexport and Transfix.',
  'JC', '#0EA5E9'
),
(
  'dm-schematic-002', '11111111-0001-0001-0001-000000000004',
  'Priya Shah', 'Partner',
  'priya@schematic.vc', 'https://linkedin.com/in/priyashah',
  'Priya focuses on trade tech, customs automation, and cross-border commerce. Previously at Flexport.',
  'PS', '#EC4899'
);

-- ─────────────────────────────────────────
-- Decision Makers — Eclipse
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-eclipse-001', '11111111-0001-0001-0001-000000000005',
  'Lior Susan', 'Founding Partner',
  'lior@eclipse.vc', 'https://linkedin.com/in/liorsusa',
  'Lior focuses on deep tech — robotics, autonomy, and industrial AI. Board member at Symbotic.',
  'LS', '#6366F1'
),
(
  'dm-eclipse-002', '11111111-0001-0001-0001-000000000005',
  'Pierre Lamond', 'Partner',
  'pierre@eclipse.vc', 'https://linkedin.com/in/pierrelamond',
  'Pierre is a legendary Silicon Valley investor. Focus on frontier technology and hard-tech supply chain.',
  'PL', '#14B8A6'
);

-- ─────────────────────────────────────────
-- Decision Makers — GLP Capital
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-glp-001', '33333333-0003-0003-0003-000000000002',
  'Ming Mei', 'Co-CEO & Managing Partner',
  'ming.mei@glp.com', 'https://linkedin.com/in/mingmeiglp',
  'Ming co-founded GLP and oversees the $120B AUM logistics real estate business. Focus on Asia Pacific emerging markets.',
  'MM', '#4F46E5'
),
(
  'dm-glp-002', '33333333-0003-0003-0003-000000000002',
  'Teresa Lim', 'Investment Director, SEA',
  'teresa.lim@glp.com', 'https://linkedin.com/in/teresalim',
  'Teresa leads GLP''s Southeast Asia tech investments. Former McKinsey and Grab. Focus: Bangladesh, Vietnam, Philippines.',
  'TL', '#BE185D'
),
(
  'dm-glp-003', '33333333-0003-0003-0003-000000000002',
  'Kevin Siow', 'VP Investments',
  'kevin.siow@glp.com', 'https://linkedin.com/in/kevinsiow',
  'Kevin focuses on warehouse automation and last-mile logistics tech across Asia.',
  'KS', '#0369A1'
);

-- ─────────────────────────────────────────
-- Decision Makers — Prologis Ventures
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-prologis-001', '33333333-0003-0003-0003-000000000001',
  'Jennifer Kaehms', 'VP Ventures',
  'jennifer.kaehms@prologis.com', 'https://linkedin.com/in/jenniferkaehms',
  'Jennifer leads Prologis Ventures'' global investment strategy. Focus on warehouse robotics, WMS, and climate tech.',
  'JK', '#0369A1'
),
(
  'dm-prologis-002', '33333333-0003-0003-0003-000000000001',
  'Ben Conwell', 'SVP, Emerging Tech',
  'ben.conwell@prologis.com', 'https://linkedin.com/in/benconwell',
  'Ben sources deals in cold chain, autonomous vehicles, and warehouse-as-a-service platforms.',
  'BC', '#059669'
);

-- ─────────────────────────────────────────
-- Decision Makers — Accel
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-accel-001', '22222222-0002-0002-0002-000000000004',
  'Subrata Mitra', 'Partner, Accel India',
  'subrata@accel.com', 'https://linkedin.com/in/subratamitra',
  'Subrata focuses on consumer internet, e-commerce, and supply chain in South Asia. Board at Flipkart and Swiggy.',
  'SM', '#059669'
),
(
  'dm-accel-002', '22222222-0002-0002-0002-000000000004',
  'Anand Daniel', 'Partner',
  'anand@accel.com', 'https://linkedin.com/in/anand-daniel',
  'Anand invests in B2B SaaS, logistics, and fintech across India and Southeast Asia.',
  'AD', '#7C3AED'
);

-- ─────────────────────────────────────────
-- Decision Makers — Tiger Global
-- ─────────────────────────────────────────
insert into public.decision_makers (id, fund_id, name, role, email, linkedin, bio, initials, avatar_color)
values
(
  'dm-tiger-001', '22222222-0002-0002-0002-000000000003',
  'Scott Shleifer', 'Partner',
  'scott@tigerglobal.com', 'https://linkedin.com/in/scottshleifer',
  'Scott co-founded Tiger Global and leads private equity investments in emerging market internet and e-commerce.',
  'SS', '#B45309'
),
(
  'dm-tiger-002', '22222222-0002-0002-0002-000000000003',
  'Griffin Schroeder', 'Partner',
  'griffin@tigerglobal.com', 'https://linkedin.com/in/griffinschroeder',
  'Griffin focuses on Southeast Asia and South Asia consumer internet, logistics, and e-commerce platforms.',
  'GS', '#DC2626'
);
