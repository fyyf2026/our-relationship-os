insert into relationship_profile (
  id,
  person_a_name,
  person_b_name,
  relationship_start_date,
  last_date
) values (
  'main',
  'Fan Ye',
  'Yihang Fu',
  '2025-04-20',
  '5 days ago'
) on conflict (id) do update set
  person_a_name = excluded.person_a_name,
  person_b_name = excluded.person_b_name,
  relationship_start_date = excluded.relationship_start_date,
  last_date = excluded.last_date;

insert into important_dates (
  id, title, date, description, status, visibility, created_by, last_edited_by
) values
  ('date-first-anniversary', 'First Anniversary', '2026-06-30', 'Our first anniversary together.', 'Upcoming', 'shared', 'Fan Ye', 'Fan Ye'),
  ('date-dinner', 'Dinner Date', '2026-06-27', 'Reservation pending', 'Pending', 'shared', 'Yihang Fu', 'Yihang Fu'),
  ('date-trip', 'Trip Planning', '2026-07-15', 'Need to book hotel', 'Pending', 'shared', 'Fan Ye', 'Fan Ye'),
  ('date-exam', 'Yihang''s Exam Week', '2026-08-02', 'August 2 - August 8. Be extra supportive', 'Upcoming', 'shared', 'Yihang Fu', 'Yihang Fu')
on conflict (id) do nothing;

insert into shared_notes (
  id, owner_id, author_name, content, visibility
) values
  ('note-a-1', 'fan_ye', 'Fan Ye', 'Remember to call me after work', 'visible_to_partner'),
  ('note-a-2', 'fan_ye', 'Fan Ye', 'Choose a restaurant for Friday', 'visible_to_partner'),
  ('note-a-3', 'fan_ye', 'Fan Ye', 'Send me the travel dates', 'visible_to_partner'),
  ('note-b-1', 'yihang_fu', 'Yihang Fu', 'I''ll pick you up at 6 PM', 'visible_to_partner'),
  ('note-b-2', 'yihang_fu', 'Yihang Fu', 'Let''s watch a movie this weekend', 'visible_to_partner'),
  ('note-b-3', 'yihang_fu', 'Yihang Fu', 'I saved the restaurant list', 'visible_to_partner')
on conflict (id) do nothing;

insert into conflict_entries (
  id, date, topic, duration, status, resolution, reward_penalty, visibility, last_edited_by
) values
  ('conflict-late-reply', 'June 18, 2026', 'Late reply', '6 hours', 'Resolved', 'Both apologized', 'Yihang buys milk tea', 'shared', 'Yihang Fu'),
  ('conflict-travel', 'June 10, 2026', 'Travel planning', '1 day', 'Resolved', 'Fan Ye explains feelings first', 'Movie night', 'shared', 'Fan Ye'),
  ('conflict-misunderstanding', 'May 28, 2026', 'Misunderstanding', '3 hours', 'Resolved', 'No blame, better communication', 'Hug required', 'shared', 'Fan Ye')
on conflict (id) do nothing;

insert into future_vision_items (
  id, category, title, description, status, visibility, last_edited_by
) values
  ('future-travel-iceland', 'Travel Dreams', 'Iceland', 'See the northern lights together.', 'Planned', 'shared', 'Fan Ye'),
  ('future-travel-japan', 'Travel Dreams', 'Japan Spring Trip', 'Cherry blossoms and quiet mornings.', 'Planned', 'shared', 'Yihang Fu'),
  ('future-travel-xinjiang', 'Travel Dreams', 'Xinjiang', 'Long roads and open skies.', 'Planned', 'shared', 'Fan Ye'),
  ('future-life-home', 'Life Plans', 'Buy a Home', 'Build a cozy shared space.', 'Planned', 'shared', 'Yihang Fu'),
  ('future-life-move-in', 'Life Plans', 'Move in together', 'A slower daily rhythm in one place.', 'In Progress', 'shared', 'Fan Ye'),
  ('future-bucket-northern-lights', 'Couple Bucket List', 'Northern Lights', 'Stand somewhere quiet and look up.', 'Planned', 'shared', 'Fan Ye')
on conflict (id) do nothing;

insert into gratitude_items (
  id, owner_id, author_name, message, visibility
) values
  ('gratitude-1', 'fan_ye', 'Fan Ye', 'Thank you for listening to me even when I was emotional.', 'shared'),
  ('gratitude-2', 'yihang_fu', 'Yihang Fu', 'Thank you for waiting for me after work.', 'shared'),
  ('gratitude-3', 'fan_ye', 'Fan Ye', 'Thank you for making me laugh today.', 'shared')
on conflict (id) do nothing;

insert into wishes (
  id, wish_type, owner_id, owner_name, title, description, category, priority, unlock_date, status, visibility
) values
  ('gift-pearl-earrings', 'gift_hint', 'fan_ye', 'Fan Ye', 'Pearl Earrings', 'Simple, elegant jewelry, not too flashy.', 'Jewelry', 'High', null, null, 'visible_to_partner'),
  ('gift-matcha-cake', 'gift_hint', 'yihang_fu', 'Yihang Fu', 'Matcha Cake', 'Soft matcha dessert or ice cream.', 'Food', 'Medium', null, null, 'visible_to_partner'),
  ('gift-perfume', 'gift_hint', 'fan_ye', 'Fan Ye', 'Perfume', 'Clean and subtle scent.', 'Beauty', 'Medium', null, null, 'visible_to_partner'),
  ('secret-beach-day', 'secret_wish', 'fan_ye', 'Fan Ye', 'Beach day note', 'Let''s go to the beach together and stay until sunset.', null, null, '2026-07-01', null, 'private_until_unlock'),
  ('secret-surprise-message', 'secret_wish', 'yihang_fu', 'Yihang Fu', 'A surprise message', 'A private note for when the time feels right.', null, null, '2026-07-15', null, 'private_until_unlock'),
  ('shared-iceland', 'shared_dream', null, 'Fan Ye', 'Iceland', 'See the northern lights together.', null, null, null, 'Planned', 'shared'),
  ('shared-japan-spring', 'shared_dream', null, 'Yihang Fu', 'Japan Spring Trip', 'Cherry blossoms and quiet mornings.', null, null, null, 'Planned', 'shared'),
  ('shared-buy-home', 'shared_dream', null, 'Fan Ye', 'Buy a Home', 'Build a cozy shared space.', null, null, null, 'In Progress', 'shared')
on conflict (id) do nothing;

insert into memory_photos (
  id, owner_id, uploaded_by, image_url, caption, visibility
) values
  ('memory-travel', 'fan_ye', 'Fan Ye', '', 'Travel', 'shared'),
  ('memory-coffee', 'yihang_fu', 'Yihang Fu', '', 'Coffee', 'shared'),
  ('memory-sunset', 'fan_ye', 'Fan Ye', '', 'Sunset', 'shared')
on conflict (id) do nothing;

insert into footprints (
  id, city, state, label, note, date_visited, owner_id, added_by, visibility
) values
  ('footprint-new-haven', 'New Haven', 'CT', 'New Haven, CT', 'Quiet walks and coffee between busy days.', '2026-03-22', 'fan_ye', 'Fan Ye', 'shared'),
  ('footprint-houston', 'Houston', 'TX', 'Houston, TX', 'A trip that made long distance feel smaller.', '2026-05-18', 'yihang_fu', 'Yihang Fu', 'shared'),
  ('footprint-los-angeles', 'Los Angeles', 'CA', 'Los Angeles, CA', 'Sunset, photos, and one very long dinner.', '2026-06-08', 'fan_ye', 'Fan Ye', 'shared'),
  ('footprint-new-york', 'New York', 'NY', 'New York, NY', 'A weekend of trains, museums, and small promises.', '2026-06-16', 'yihang_fu', 'Yihang Fu', 'shared')
on conflict (id) do nothing;

insert into ai_coach_metrics (
  id, metric_name, metric_value, weekly_insight
) values
  ('communication', 'communication', 82, 'You both seem happiest when plans are clear and reassurance is explicit. Try one intentional check-in this weekend.'),
  ('quality_time', 'quality_time', 76, 'You both seem happiest when plans are clear and reassurance is explicit. Try one intentional check-in this weekend.'),
  ('conflict_recovery', 'conflict_recovery', 91, 'You both seem happiest when plans are clear and reassurance is explicit. Try one intentional check-in this weekend.'),
  ('emotional_support', 'emotional_support', 88, 'You both seem happiest when plans are clear and reassurance is explicit. Try one intentional check-in this weekend.')
on conflict (id) do update set
  metric_value = excluded.metric_value,
  weekly_insight = excluded.weekly_insight;
