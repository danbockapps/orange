create table if not exists users (
  userid int unsigned auto_increment primary key,
  password varchar(9999),
  activation varchar(40),
  fname varchar(50),
  lname varchar(50),
  email varchar(100),
  date_user_added datetime,
  constraint unique (email)
) engine=innodb;

create table if not exists challenges (
  challengeid int unsigned auto_increment primary key,
  start_dttm datetime,
  end_dttm datetime
) engine=innodb;

create table if not exists teams (
  teamid int unsigned auto_increment primary key,
  challengeid int unsigned,
  captainid int unsigned,
  teamname varchar(30),
  date_team_added datetime,
  constraint foreign key (challengeid) references challenges (challengeid),
  constraint foreign key (captainid) references users (userid)
) engine=innodb;

create table if not exists team_members (
  teamid int unsigned,
  userid int unsigned,
  date_user_team_added datetime,
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

