drop table reports;
drop table activities;

create table activities (
  activityid int unsigned primary key,
  displayorder int unsigned,
  shortdesc varchar(50),
  longdesc text,
  url text,
  pointvalue smallint,
  maxperweek tinyint unsigned default 0
) engine=innodb;

create table reports (
  reportid int unsigned auto_increment primary key,
  userid int unsigned,
  challengeid int unsigned,
  activityid int unsigned,
  units int,
  deleted boolean default false,
  reportdttm timestamp,
  constraint foreign key (userid) references users (userid),
  constraint foreign key (challengeid) references challenges (challengeid),
  constraint foreign key (activityid) references activities (activityid)
) engine=innodb;

insert into activities (
  activityid,
  displayorder,
  pointvalue,
  maxperweek,
  shortdesc,
  longdesc,
  url
) values
(1, 1, 5, 0, "15 minutes of exercise",
"Click once for each 15 minutes of exercise you do.", null),
(2, 2, 5, 7, "5 servings of fruit/veg",
"Click once for each day you eat five servings of fruits and vegetables. One 
serving is 1/2 cup fruit, 1/2 cup cooked vegetables or 1 cup raw vegetables.",
"http://www.cdc.gov/nutrition/everyone/fruitsvegetables/cup.html"),
(3, 3, 2, 0, "Be Healthy Now event",
"Click once for each Be Healthy Now exercise class, walk, hike, cooking class 
or activity you attend.", null),
(4, 4, 1, 7, "7+ hours restful sleep",
"Click once for each night you got seven or more hours of restful sleep.",
"http://www.nhlbi.nih.gov/sites/www.nhlbi.nih.gov/files/nhlbisleepinfographic.pdf"),
(5, 5, 1, 0, "Quality time w/friends",
"Click once for each time you spend quality time connecting with a good friend, 
family member, or spouse.",
"http://www.mayoclinic.org/healthy-living/stress-management/in-depth/social-support/art-20044445"),
(6, 6, 1, 0, "Mindful activity",
"Click once for each time you spend ten minutes or more in prayer, meditation 
or mindful activity.",
"https://www.psychologytoday.com/blog/heart-and-soul-healing/201303/dr-herbert-benson-s-relaxation-response"),
(7, 7, 1, 0, "Physical activity choice",
"Click once for each time you made a choice to increase everyday physical 
activity, such as taking the stairs instead of the elevator, parking further 
away from your destination, or walking instead of driving to an activity.",
"http://www.nia.nih.gov/health/publication/exercise-physical-activity/chapter-3-go"),
(8, 8, 1, 0, "Choose water over soda",
"Click once for each time you chose to drink water instead of soda, fruit 
drinks, etc.",
"http://www.cdc.gov/healthyweight/healthy_eating/drinks.html");
