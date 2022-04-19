var userId = null;
var displayName = null;
var pictureUrl = null;
var today = null;
var tomorrow = null;
var customer = {};
var appoint = {};

function doGet(e) {
  userId = e.parameter.userId;
  displayName = e.parameter.displayName;
  pictureUrl = e.parameter.pictureUrl;
  today = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  tomorrow = Utilities.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000), "GMT+7", "yyyy-MM-dd");

  customer = getCustomer(userId);

  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('ระบบจองคิว Online')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getCustomer(cid) {
  let customers = SpreadsheetApp.getActive().getSheetByName('customers').getDataRange().getDisplayValues()
    .filter(row => row[0] == cid)
    .map(row => { return { 'cid': row[0], 'cname': row[1], 'cphone': row[2], 'isCustomer': true }; });

  if (customers.length > 0) return customers[0];
  else return { 'cid': null, 'cname': null, 'cphone': null, 'isCustomer': false };
}

function getAppoint(cid) {
  let thisdatenum = parseInt(Utilities.formatDate(new Date(), "GMT+7", "yyMMdd"));
  let getAppoints = SpreadsheetApp.getActive().getSheetByName('appoints').getDataRange().getDisplayValues()
    .filter(row => (row[3] == 'จองคิว' && row[5] == cid && parseInt(row[7]) >= thisdatenum))
    .map(row => {
      let arrdate = row[1].split('/');
      let apdate = (parseInt(arrdate[2]) - 543) + '-' + ('0' + arrdate[1]).slice(-2) + '-' + ('0' + arrdate[0]).slice(-2);
      return { 'no': row[0], 'date': apdate, 'period': row[2], 'note': row[4], 'cid': row[5] };
    });

  if (getAppoints.length > 0) return getAppoints[0];
  else return { 'no': 0, 'date': Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"), 'period': null, 'note': null, 'cid': null };
}

function addCustomer(cid, cname, cphone) {
  let rownum = SpreadsheetApp.getActive().getSheetByName('customers').getDataRange().getDisplayValues()
    .findIndex(row => row[0] == cid);
  if (rownum == -1) SpreadsheetApp.getActive().getSheetByName('customers').appendRow([cid, cname, "'" + cphone]);
  return getCustomer(cid);
}

function addAppoint(date, period, note, cid, cphoto) {
  let rownum = SpreadsheetApp.getActive().getSheetByName('appoints').getLastRow();
  let no = rownum <= 1 ? 1 : 1 + SpreadsheetApp.getActive().getSheetByName('appoints').getRange(rownum, 1).getValue();
  let arrdate = date.split("-");
  let apdate = parseInt(arrdate[2]) + '/' + parseInt(arrdate[1]) + '/' + (parseInt(arrdate[0]) + 543);
  let datenum = arrdate[0].slice(-2) + arrdate[1] + arrdate[2];
  SpreadsheetApp.getActive().getSheetByName('appoints').appendRow([no, apdate, period, 'จองคิว', note, cid, cphoto, datenum]);
  return getAppoint(cid);
}

function changeStatus(cid, no, status) {
  let rownum = 1 + SpreadsheetApp.getActive().getSheetByName('appoints').getDataRange().getValues()
    .findIndex(row => parseInt(row[0]) == no);
  if (rownum > 0) SpreadsheetApp.getActive().getSheetByName('appoints').getRange(rownum, 4).setValue(status);
  return getAppoint(cid);
}

function testcode() {
  let data = Utilities.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000), "GMT+7", "yyyy-MM-dd");
  Logger.log(data);
}
