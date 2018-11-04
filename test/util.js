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

//   page.on('console', msg => console.log('PAGE LOG:', msg.text()));

//    // 파일 업로드 팝업창 핸들러
//    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
//    const file_upload_popup = await newPagePromise;
//
//    // 클라우드 파일> [내문서]
//    await file_upload_popup.waitForSelector('[path="/내 문서/"]');
//    await file_upload_popup.click('[path="/내 문서/"]');
//    await file_upload_popup.click('#changeButton');