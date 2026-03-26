create unique index if not exists leads_booking_slot_unique
on public.leads (preferred_date, preferred_time)
where lead_type = 'booking'
  and status in ('scheduled', 'confirmed')
  and preferred_date is not null
  and preferred_time <> '';
