var placeholderSupported =
    document.createElement("input").placeholder != undefined;
    
function dateFromMySql(mySqlDateString) {
  // Split timestamp into [ Y, M, D, h, m, s ]
  var t = mySqlDateString.split(/[- :]/);

  // Apply each element to the Date function
  return new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
}
    
function Challenge(regStart, regEnd, start, end) {
  this.regStart = dateFromMySql(regStart);
  this.regEnd = dateFromMySql(regEnd);
  this.start = dateFromMySql(start);
  this.end = dateFromMySql(end);
}

Challenge.prototype.datesOverlap = function(other) {
  if(other.regStart >= this.regStart && other.regStart <= this.end)
    return true;
  else if(other.end >= this.regStart && other.end <= this.end) 
    return true;
  else if(this.regStart >= other.regStart && this.regStart <= other.end)
    return true;
  else if(this.end >= other.regStart && this.end <= other.end)
    return true;
  else
    return false;
}
