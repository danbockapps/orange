create table if not exists users (
  userid int unsigned auto_increment primary key,
  fbid varchar(128),
  email varchar(100),
  password varchar(9999),
  akey varchar(32),
  activated boolean default false,
  fname varchar(50),
  lname varchar(50),
  admin boolean default false,
  age tinyint unsigned,
  sex varchar(1),
  heightinches tinyint unsigned,
  dateuseradded timestamp default current_timestamp,
  constraint unique (email),
  constraint unique (akey)
) engine=innodb;

create table if not exists challenges (
  challengeid int unsigned auto_increment primary key,
  regstartdttm datetime,
  regenddttm datetime,
  startdttm datetime,
  enddttm datetime,
  deleted boolean default false
) engine=innodb;

create table if not exists surveys (
  surveyid int unsigned auto_increment primary key,
  challengeid int unsigned,
  userid int unsigned,
  weight smallint unsigned,
  zip varchar(10),
  activitylevel tinyint unsigned, /* valid values: 1, 2, 3 */
  exercisemins tinyint unsigned,  /* valid values: 1, 2, 3, 4 */
  exercisetypes text,
  fruits tinyint unsigned,        /* valid values: 1, 2, 3, 4 */
  datesurveyadded timestamp default current_timestamp,
  constraint foreign key (challengeid) references challenges (challengeid),
  constraint foreign key (userid) references users (userid)
) engine=innodb;

create table if not exists teams (
  teamid int unsigned auto_increment primary key,
  challengeid int unsigned,
  teamname varchar(30),
  joincode varchar(6),
  dateteamadded datetime,
  constraint foreign key (challengeid) references challenges (challengeid),
  constraint unique(joincode)
) engine=innodb;

create table if not exists team_members (
  teamid int unsigned,
  userid int unsigned,
  captain boolean,
  dateuserteamadded datetime,
  constraint primary key (teamid, userid),
  constraint foreign key (teamid) references teams (teamid),
  constraint foreign key (userid) references users (userid)
) engine=innodb;

create table if not exists activities (
  activityid int unsigned auto_increment primary key
) engine=innodb;

create table if not exists reports (
  reportid int unsigned auto_increment primary key,
  userid int unsigned,
  activityid int unsigned,
  units int,
  constraint foreign key (userid) references users (userid),
  constraint foreign key (activityid) references activities (activityid)
) engine=innodb;
