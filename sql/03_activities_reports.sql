drop table reports;
drop table activities;

create table activities (
  activityid int unsigned auto_increment primary key,
  shortdesc varchar(50),
  longdesc text,
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

insert into activities (shortdesc, longdesc, pointvalue) values
("15 minutes of exercise", "Click once for each 15 minutes of exercise you do", 5),
("7 hours of sleep", "Click here if you slept at least 7 hours", 1),
("5+ servings of fruits an vegetables", "5 points if you eat five or more servings of fruits and vegetables (1 serving = 1/2 cup fruit, 1/2 cup cooked vegetables or 1 cup raw vegetables)", 5);