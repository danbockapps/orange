insert into activities (
  activityid,
  displayorder,
  pointvalue,
  maxperweek,
  shortdesc,
  longdesc,
  url,
  bootstrapicon,
  googleicon
) values

(1, 1, 5, 7, "30 minutes of exercise",
"Click once for each day you do 30 minutes of exercise.", null, null, "directions_run"),

(2, 2, 5, 7, "5 servings of fruit/veg",
"Click once for each day you eat five servings of fruits and vegetables. One
serving is 1/2 cup fruit, 1/2 cup cooked vegetables or 1 cup raw vegetables.",
"http://www.cdc.gov/nutrition/everyone/fruitsvegetables/cup.html", "apple", null),

(3, 3, 1, 7, "Be Healthy Now event", "Click once for each day you attend a Be
Healthy Now exercise class, walk, hike, cooking class or activity you attend.",
null, "calendar", null),

(4, 4, 1, 7, "7+ hours restful sleep",
"Click once for each night you got seven or more hours of restful sleep.",
"http://www.nhlbi.nih.gov/sites/www.nhlbi.nih.gov/files/nhlbisleepinfographic.pdf",
 null,"hotel"),

(5, 5, 1, 7, "Quality time w/friends",
"Click once for each day you spend quality time connecting with a good friend,
family member, or spouse.",
"http://www.mayoclinic.org/healthy-living/stress-management/in-depth/social-support/art-20044445",
null, "people"),

(6, 6, 1, 7, "Mindful activity",
"Click once for each day you spend ten minutes or more in prayer, meditation
or mindful activity.",
"https://www.psychologytoday.com/blog/heart-and-soul-healing/201303/dr-herbert-benson-s-relaxation-response",
null, "notifications_off"),

(7, 7, 1, 7, "Physical activity choice",
"Click once for each day you made a choice to increase everyday physical
activity, such as taking the stairs instead of the elevator, parking further
away from your destination, or walking instead of driving to an activity.",
"http://www.nia.nih.gov/health/publication/exercise-physical-activity/chapter-3-go",
null, "directions_walk"),

(8, 8, 1, 7, "Choosing water over soda",
"Click once for each day you chose to drink water instead of soda, fruit
drinks, etc.",
"http://www.cdc.gov/healthyweight/healthy_eating/drinks.html", null, "local_drink"),

(9, 9, -1, 7, "Sitting for >1 hour",
"Click once for each day you sat for more than one waking hour throughout the day.",
 null, null, "airline_seat_recline_normal"),

(10, 10, -1, 7, "Not meeting MyPlate",
"Click once for each day none of your meals met the MyPlate guidelines.",
"http://www.choosemyplate.gov", null, "restaurant");