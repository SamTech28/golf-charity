begin;

insert into public.charities (name, slug, short_description, description, tags, is_featured, cover_image_url)
values
  (
    'Children’s Health Fund',
    'childrens-health-fund',
    'Emergency care and long-term support for children who need it most.',
    'We fund frontline pediatric care, long-term recovery programs, and family support initiatives.',
    array['health','children'],
    true,
    'https://images.unsplash.com/photo-1576765607924-3f7b8410f6b6?auto=format&fit=crop&w=1400&q=80'
  ),
  (
    'Community Food Network',
    'community-food-network',
    'Local food security programs powered by consistent monthly giving.',
    'We partner with community kitchens and last-mile delivery teams to reduce hunger.',
    array['food','community'],
    false,
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80'
  ),
  (
    'Clean Water Initiative',
    'clean-water-initiative',
    'Water access and hygiene for under-resourced communities.',
    'We support borewells, filtration systems, and long-term maintenance programs.',
    array['water','infrastructure'],
    true,
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=80'
  );

commit;

