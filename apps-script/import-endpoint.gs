/*
 * TO IMPORT BACKEND
 *
 * Paste these functions into the existing Google Apps Script that serves
 * the dashboard API. The existing doGet(action=all) remains unchanged.
 * The dashboard Import TO page sends POST {action:"import", test, results}.
 *
 * Sheet names / headers expected:
 * STUDENTS: index,student_id,nama,email,sekolah,kelas,rombel,status
 * TESTS:    index,test_id,jenis,nama_to,tanggal,keterangan
 * SUBTESTS: index,subtest_id,jenis,subtes
 * RESULTS:  index,result_id,student_id,test_id,subtest_id,nilai
 */

function doPost(e) {
  try {
    var body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var payload = JSON.parse(body);

    if (payload.action !== 'import') {
      return jsonResponse_({ success: false, error: 'Action POST tidak dikenal.' });
    }

    return jsonResponse_(importTO_(payload));
  } catch (err) {
    return jsonResponse_({ success: false, error: String(err && err.message || err) });
  }
}

function importTO_(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var test = payload.test || {};
  var incoming = Array.isArray(payload.results) ? payload.results : [];

  if (!test.test_id || !test.test_name) {
    throw new Error('test_id dan test_name wajib diisi.');
  }
  if (!incoming.length) {
    throw new Error('Tidak ada nilai yang dikirim.');
  }

  var studentsSh = ss.getSheetByName('STUDENTS');
  var testsSh = ss.getSheetByName('TESTS');
  var subtestsSh = ss.getSheetByName('SUBTESTS');
  var resultsSh = ss.getSheetByName('RESULTS');
  if (!studentsSh || !testsSh || !subtestsSh || !resultsSh) {
    throw new Error('Sheet STUDENTS / TESTS / SUBTESTS / RESULTS tidak lengkap.');
  }

  var students = sheetObjects_(studentsSh);
  var tests = sheetObjects_(testsSh);
  var subtests = sheetObjects_(subtestsSh);
  var results = sheetObjects_(resultsSh);

  // 1) Verify students by student_id. Email is the canonical identity on the UI;
  //    this backend additionally verifies the submitted email when available.
  var studentById = {};
  var studentByEmail = {};
  students.forEach(function(s) {
    var id = String(s.student_id || '').trim();
    var email = normalizeEmail_(s.email);
    if (id) studentById[id] = s;
    if (email) studentByEmail[email] = s;
  });

  var unknownStudents = [];
  incoming.forEach(function(r) {
    var id = String(r.student_id || '').trim();
    var email = normalizeEmail_(r.email);
    var s = studentById[id] || (email ? studentByEmail[email] : null);
    if (!s) unknownStudents.push(email || id || '(kosong)');
    else if (email && normalizeEmail_(s.email) !== email) {
      throw new Error('Email tidak cocok dengan student_id untuk: ' + id);
    }
  });
  if (unknownStudents.length) {
    throw new Error('Ada siswa yang tidak ditemukan di master: ' + unknownStudents.slice(0,10).join(', '));
  }

  // 2) Upsert TESTS row.
  var testRow = tests.find(function(t){ return String(t.test_id) === String(test.test_id); });
  if (testRow) {
    // Existing test is kept; only fill blank metadata so old data is not overwritten.
    var rowNum = testRow.__row;
    var current = testsSh.getRange(rowNum, 1, 1, 6).getValues()[0];
    if (!current[2] && test.type) current[2] = test.type;
    if (!current[3] && test.test_name) current[3] = test.test_name;
    if (!current[4] && test.tanggal) current[4] = test.tanggal;
    testsSh.getRange(rowNum, 1, 1, 6).setValues([current]);
  } else {
    var nextTestIndex = Math.max(-1, ...tests.map(function(t){ return Number(t.index); }).filter(Number.isFinite)) + 1;
    testsSh.appendRow([nextTestIndex, test.test_id, test.jenis || test.type || 'TKA', test.test_name, test.tanggal || '', 'Imported via Dashboard Import TO']);
  }

  // 3) Resolve subtests by displayed name. No new subtest is silently invented.
  var subtestByName = {};
  subtests.forEach(function(s){ subtestByName[normalizeText_(s.subtes)] = s; });
  var unknownSubtests = [];
  incoming.forEach(function(r){
    if (!subtestByName[normalizeText_(r.subtest_name)]) unknownSubtests.push(r.subtest_name);
  });
  unknownSubtests = unique_(unknownSubtests);
  if (unknownSubtests.length) {
    throw new Error('Mapel/subtes belum ada di SUBTESTS: ' + unknownSubtests.join(', '));
  }

  // 4) Upsert RESULTS using student_id + test_id + subtest_id as the natural key.
  var resultMap = {};
  results.forEach(function(r){
    resultMap[[r.student_id,r.test_id,r.subtest_id].join('|')] = r;
  });

  var added = 0, updated = 0;
  var maxResultIndex = Math.max(-1, ...results.map(function(r){ return Number(r.index); }).filter(Number.isFinite));

  incoming.forEach(function(r, idx){
    var s = studentById[String(r.student_id || '').trim()] || studentByEmail[normalizeEmail_(r.email)];
    var sub = subtestByName[normalizeText_(r.subtest_name)];
    var key = [s.student_id, test.test_id, sub.subtest_id].join('|');
    var score = Number(r.nilai != null ? r.nilai : r.score);
    if (!Number.isFinite(score)) throw new Error('Nilai tidak valid pada baris ' + (idx + 1));

    var existing = resultMap[key];
    if (existing) {
      resultsSh.getRange(existing.__row, 6).setValue(score);
      updated++;
    } else {
      maxResultIndex++;
      var resultId = 'RIMP' + new Date().getTime() + '_' + (idx + 1);
      resultsSh.appendRow([maxResultIndex, resultId, s.student_id, test.test_id, sub.subtest_id, score]);
      resultMap[key] = { __row: resultsSh.getLastRow(), student_id:s.student_id, test_id:test.test_id, subtest_id:sub.subtest_id };
      added++;
    }
  });

  return { success:true, message:'Import TO berhasil.', test_id:test.test_id, added:added, updated:updated, total:incoming.length };
}

function sheetObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  var headers = values[0].map(function(h){ return String(h).trim(); });
  return values.slice(1).map(function(row, i){
    var o = { __row:i+2 };
    headers.forEach(function(h,j){ o[h] = row[j]; });
    return o;
  });
}

function normalizeEmail_(v) { return String(v || '').trim().toLowerCase(); }
function normalizeText_(v) { return String(v || '').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase(); }
function unique_(arr) { return Array.from(new Set(arr)); }
function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
