create or replace view current_team_members as
select distinct tm.*
from
  team_members tm
  natural join teams t
  natural join challenges c
where !c.deleted;
