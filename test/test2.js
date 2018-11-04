var time = getTimeStamp();
console.log(time);


function getTimeStamp() {
  var d = new Date();

  var s =
    leadingZeros(d.getFullYear(), 4) + '_' +
    leadingZeros(d.getMonth() + 1, 2) + '_' +
    leadingZeros(d.getDate(), 2) + '__' +

    leadingZeros(d.getHours(), 2) + '_' +
    leadingZeros(d.getMinutes(), 2) + '_' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}