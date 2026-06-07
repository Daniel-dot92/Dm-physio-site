const CONFIG = {
  VERSION: 'pdf-drive-v25',
  SPREADSHEET_ID: '1yMkRc4eE2UufAL31GfXumLnCuCdEzGvbrEZeoN2QYzw',
  SHEET_NAME: 'Questionnaire',
  PDF_FOLDER_ID: '19cuRzuwLUCdxpPih3gL4Dhagn5vGDLBh',
  MAKE_FILES_PUBLIC: true,
  SAVE_PDF_TO_DRIVE: true,
};

const AREA_LABELS = {
  'whole-body': 'Цяло тяло',
  head: 'Глава',
  neck: 'Врат',
  shoulder: 'Рамо',
  elbow: 'Лакът',
  wrist: 'Китка',
  chest: 'Гърди и корем',
  'upper-back': 'Гръб',
  'low-back': 'Кръст',
  hip: 'Таз',
  'back-low': 'Гръб и кръст',
  'lowback-hip': 'Кръст и таз',
  knee: 'Коляно',
  ankle: 'Глезен',
  'tingling-arms': 'Изтръпване - ръце',
  'tingling-legs': 'Изтръпване - крака',
  'tingling-whole': 'Изтръпване - цяло тяло',
};

const VIEW_LABELS = {
  front: 'Отпред',
  back: 'Отзад',
  side: 'Отстрани',
  inner: 'Вътрешна страна',
  outer: 'Външна страна',
  bottom: 'Отдолу',
  under: 'Под рамото',
};

const PART_VIEW_LABELS = {
  'tingling-arms': { front: '1-ви, 2-ри, 3-ти пръст', back: '4-ти, 5-ти пръст', inner: 'До китката', outer: 'Цяла ръка' },
  'tingling-legs': { front: 'По вътрешната част', back: 'По външната част', inner: 'Отпред', outer: 'Цял крак' },
  'tingling-whole': { front: 'Цяло тяло' },
};

const VALUE_LABELS = {
  sex: { female: 'Жена', male: 'Мъж', other: 'Друго' },
  symptom_type: {
    pain: 'Болка',
    tingling: 'Изтръпване',
    weakness: 'Слабост',
    burning: 'Парене',
    tightness: 'Стягане',
    dizziness: 'Световъртеж',
    nausea: 'Гадене',
  },
  symptom_duration: {
    under_24h: 'Под 24 часа',
    '1_7_days': '1-7 дни',
    '1_4_weeks': '1-4 седмици',
    '1_3_months': '1-3 месеца',
    over_3_months: 'Над 3 месеца',
  },
  onset_type: {
    sudden: 'Изведнъж',
    gradual: 'Постепенно',
    after_sport: 'След спорт',
    after_trauma: 'След травма',
    after_load: 'След продължително натоварване',
  },
  worst_time: {
    early_morning: 'Сутрин рано',
    during_day: 'През деня',
    end_of_day: 'В края на деня',
    night: 'Нощем',
  },
  worse_factors: {
    sitting: 'Седене',
    standing: 'Стоене',
    walking: 'Ходене',
    bending: 'Навеждане',
    rotation: 'Завъртане',
    lifting_heavy: 'Вдигане на тежко',
    sport: 'Спорт',
  },
  bad_habits: {
    badposture1: 'Глезен върху коляно',
    badposture2: 'Седяща 4-ка',
    badposture3: 'Кръстосани крака',
    badposture4: 'Крака под стола',
    badposture5: 'Заключени колена',
    badposture6: 'Облягане на хълбок',
    badposture7: 'Нисък монитор',
    badposture8: 'Високо бюро',
  },
  sleep_position: {
    back: 'По гръб',
    side: 'На страна',
    front: 'По корем',
  },
  sleep_variant: {
    back_1: 'По гръб - вариант 1',
    back_2: 'По гръб - вариант 2',
    back_3: 'По гръб - вариант 3',
    side_1: 'На страна - вариант 1',
    side_2: 'На страна - вариант 2',
    side_3: 'На страна - вариант 3',
    front_1: 'По корем - вариант 1',
    front_2: 'По корем - вариант 2',
    front_3: 'По корем - вариант 3',
    belly_1: 'По корем - вариант 1',
    belly_2: 'По корем - вариант 2',
  },
  tingling_enabled: { yes: 'Да', no: 'Не' },
  tingling_region: { arms: 'Ръце', legs: 'Крака', whole: 'Цяло тяло' },
  tingling_arm_scope: { both_arms: 'И двете ръце' },
  tingling_leg_scope: { both_legs: 'И двата крака' },
  tingling_selected_variants: {
    'tingling-arms__front': 'Ръце - 1-ви, 2-ри, 3-ти пръст',
    'tingling-arms__back': 'Ръце - 4-ти, 5-ти пръст',
    'tingling-arms__inner': 'Ръце - До китката',
    'tingling-arms__outer': 'Ръце - Цяла ръка',
    'tingling-legs__front': 'Крака - По вътрешната част',
    'tingling-legs__back': 'Крака - По външната част',
    'tingling-legs__inner': 'Крака - Отпред',
    'tingling-legs__outer': 'Крака - Цял крак',
    'tingling-whole__front': 'Цяло тяло',
  },
  sport: { yes: 'Да', no: 'Не', sometimes: 'Понякога' },
  previous_trauma: { yes: 'Да', no: 'Не' },
  doctor_diagnosis: { yes: 'Да', no: 'Не' },
  taking_meds: { yes: 'Да', no: 'Не' },
  red_flags: {
    fever: 'Температура',
    night_pain: 'Нощна болка',
    weight_loss: 'Необяснима загуба на тегло',
    strong_weakness: 'Рязка/силна слабост',
    control_loss: 'Загуба на контрол над уриниране/дефекация',
    recent_major_trauma: 'Скорошна тежка травма',
    cancer_history: 'История за онкологично заболяване',
  },
  personal_data_consent: { yes: 'Да' },
  medical_disclaimer_ack: { yes: 'Да' },
};

const PDF_SECTIONS = [
  {
    title: '1) Контакт и основни данни',
    fields: [
      ['Име', 'first_name'],
      ['Фамилия', 'last_name'],
      ['Телефон', 'phone'],
      ['Имейл', 'email'],
      ['Възраст', 'age'],
      ['Пол', 'sex'],
      ['Височина (см)', 'height_cm'],
      ['Тегло (кг)', 'weight_kg'],
      ['Професия', 'occupation'],
    ],
  },
  {
    title: '2) Локализация',
    fields: [
      ['Основна зона', 'primary_area'],
      ['Избрани зони', 'selected_parts'],
      ['Изтръпване (локализация)', 'tingling_enabled'],
      ['Изтръпване - зона', 'tingling_region'],
      ['Изтръпване - И двете ръце', 'tingling_arm_scope'],
      ['Изтръпване - И двата крака', 'tingling_leg_scope'],
      ['Изтръпване - избрани варианти', 'tingling_selected_variants'],
      ['Изтръпване - пояснение', 'tingling_notes'],
    ],
  },
  {
    title: '3) Симптоми',
    fields: [
      ['Тип симптом', 'symptom_type'],
      ['Сила на симптомите', 'symptom_severity'],
      ['От колко време', 'symptom_duration'],
      ['Как започна', 'onset_type'],
      ['Пояснение за начало', 'onset_details'],
      ['Кога са най-силни', 'worst_time'],
      ['Пояснение за най-силни моменти', 'worst_time_details'],
      ['Какво влошава', 'worse_factors'],
    ],
  },
  {
    title: '4) Навици и активност',
    fields: [
      ['Грешни навици', 'bad_habits'],
      ['Позиция на сън', 'sleep_position'],
      ['Избран вариант на сън', 'sleep_variant'],
      ['Спорт', 'sport'],
      ['Тренировки седмично', 'sport_frequency'],
      ['Вид спорт', 'sport_type'],
    ],
  },
  {
    title: '5) Медицинска информация',
    fields: [
      ['Предишни травми', 'previous_trauma'],
      ['Детайли за травма', 'trauma_details'],
      ['Диагноза от лекар', 'doctor_diagnosis'],
      ['Детайли за диагноза', 'diagnosis_details'],
      ['Прием на лекарства', 'taking_meds'],
      ['Какви лекарства', 'meds_details'],
    ],
  },
  {
    title: '6) Червени флагове',
    fields: [['Червени флагове', 'red_flags']],
  },
  {
    title: '7) Допълнителна информация',
    fields: [['Бележки', 'extra_notes']],
  },
  {
    title: '8) Съгласие и информираност',
    fields: [
      ['Съгласие за лични данни', 'personal_data_consent'],
      ['Запознат/а, че не замества преглед', 'medical_disclaimer_ack'],
    ],
  },
];

function doGet() {
  return jsonResponse_({ ok: true, version: CONFIG.VERSION, message: 'Webhook is alive. Use POST to submit data.' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Missing POST body.');
    }

    const payload = JSON.parse(e.postData.contents || '{}');
    const formData = payload.form_data || {};
    const submittedAt = payload.submitted_at || new Date().toISOString();

    const readable = buildReadableData_(formData);
    const imageEntries = buildImageEntries_(payload, formData);
    const baseName = buildBaseFileName_(readable, submittedAt);

    const folderContext = getFolderContextById_(CONFIG.PDF_FOLDER_ID, 'PDF_FOLDER_ID');
    const warnings = [];
    if (folderContext.warning) warnings.push(folderContext.warning);

    const drawnCanvasKeySet = extractDrawnCanvasKeySet_(payload);
    const pdfResult = savePdfReport_(submittedAt, readable, imageEntries, folderContext.folder, baseName, drawnCanvasKeySet);
    if (pdfResult.warning) warnings.push(pdfResult.warning);

    const rowObject = buildSheetRow_(submittedAt, readable, pdfResult.url || '', baseName);
    const sheet = getOrCreateSheet_(CONFIG.SHEET_NAME);
    appendDynamicRow_(sheet, rowObject);

    return jsonResponse_({
      ok: true,
      version: CONFIG.VERSION,
      warning: warnings.filter(Boolean).join(' | '),
      pdf_url: pdfResult.url || '',
    });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function buildSheetRow_(submittedAt, readable, pdfUrl, baseName) {
  return {
    submitted_at: submittedAt,
    first_name: readable.first_name || '',
    last_name: readable.last_name || '',
    phone: readable.phone || '',
    email: readable.email || '',
    age: readable.age || '',
    sex: readable.sex || '',
    primary_area: readable.primary_area || '',
    symptom_type: readable.symptom_type || '',
    symptom_severity: readable.symptom_severity || '',
    onset_type: readable.onset_type || '',
    onset_details: readable.onset_details || '',
    worst_time: readable.worst_time || '',
    worst_time_details: readable.worst_time_details || '',
    worse_factors: readable.worse_factors || '',
    red_flags: readable.red_flags || '',
    tingling_enabled: readable.tingling_enabled || '',
    tingling_region: readable.tingling_region || '',
    tingling_selected_variants: readable.tingling_selected_variants || '',
    tingling_arm_scope: readable.tingling_arm_scope || '',
    tingling_leg_scope: readable.tingling_leg_scope || '',
    tingling_notes: readable.tingling_notes || '',
    sleep_position: readable.sleep_position || '',
    sleep_variant: readable.sleep_variant || '',
    bad_habits: readable.bad_habits || '',
    personal_data_consent: readable.personal_data_consent || '',
    medical_disclaimer_ack: readable.medical_disclaimer_ack || '',
    extra_notes: readable.extra_notes || '',
    pdf_file_name: baseName + '.pdf',
    pdf_file_url: pdfUrl || '',
  };
}

function buildReadableData_(formData) {
  const out = {};
  Object.keys(formData || {}).forEach(function (key) {
    out[key] = normalizeFormValue_(key, formData[key]);
  });
  return out;
}

function buildImageEntries_(payload, formData) {
  const entries = [];
  const seenKeys = {};
  const allImages = payload && payload.marked_images_all && typeof payload.marked_images_all === 'object'
    ? payload.marked_images_all
    : null;

  if (allImages) {
    Object.keys(allImages).forEach(function (key) {
      const blob = dataUrlToBlob_(allImages[key], key);
      if (!blob) return;
      const title = humanizeImageKey_(key);
      entries.push({ key: key, title: title, blob: blob });
      seenKeys[key] = true;
    });
  }

  const legacyViews = ['front', 'back', 'side', 'inner', 'outer', 'bottom', 'under'];
  const rawLegacy = payload && payload.marked_images && typeof payload.marked_images === 'object'
    ? payload.marked_images
    : null;
  const primaryArea = String((formData && formData.primary_area) || 'whole-body').trim() || 'whole-body';

  if (rawLegacy) {
    legacyViews.forEach(function (view) {
      const key = primaryArea + '__' + view;
      if (seenKeys[key]) return;
      const blob = dataUrlToBlob_(rawLegacy[view], key);
      if (!blob) return;
      const title = humanizeImageKey_(key);
      entries.push({ key: key, title: title, blob: blob });
    });
  }

  entries.sort(function (a, b) {
    return String(a.title || a.key).localeCompare(String(b.title || b.key), 'bg');
  });

  return entries;
}

function extractDrawnCanvasKeySet_(payload) {
  const out = {};
  const raw = payload && payload.drawn_canvas_keys;

  if (Array.isArray(raw)) {
    raw.forEach(function (key) {
      const k = String(key || '').trim();
      if (!k) return;
      out[k] = true;
    });
  } else if (typeof raw === 'string') {
    raw.split(',').forEach(function (key) {
      const k = String(key || '').trim();
      if (!k) return;
      out[k] = true;
    });
  }

  if (Object.keys(out).length > 0) return out;

  const allImages = payload && payload.marked_images_all && typeof payload.marked_images_all === 'object'
    ? payload.marked_images_all
    : null;
  if (!allImages) return out;

  Object.keys(allImages).forEach(function (key) {
    if (isLikelyDrawnCanvasKey_(key)) out[key] = true;
  });

  return out;
}

function isLikelyDrawnCanvasKey_(key) {
  const raw = String(key || '');
  if (!raw || raw.indexOf('__') === -1) return false;
  const partKey = raw.split('__')[0];
  if (!partKey) return false;
  if (partKey === 'sleep' || partKey === 'badhabit') return false;
  if (partKey.indexOf('tingling-') === 0) return false;
  return true;
}

function humanizeImageKey_(key) {
  const raw = String(key || '');
  if (!raw) return 'Маркировка';
  const parts = raw.split('__');
  if (parts.length < 2) return raw;

  const partKey = parts[0];
  const viewKey = parts[1];

  if (partKey === 'badhabit') {
    const habitLabel = (VALUE_LABELS.bad_habits && VALUE_LABELS.bad_habits[viewKey]) ? VALUE_LABELS.bad_habits[viewKey] : viewKey;
    return 'Грешни навици - ' + habitLabel;
  }

  if (partKey === 'sleep') {
    return 'Сън - ' + formatSleepVariant_(viewKey);
  }

  const partLabel = AREA_LABELS[partKey] || partKey;
  const customViewLabels = PART_VIEW_LABELS[partKey] || null;
  const viewLabel = (customViewLabels && customViewLabels[viewKey]) ? customViewLabels[viewKey] : (VIEW_LABELS[viewKey] || viewKey);
  return partLabel + ' - ' + viewLabel;
}

function normalizeFormValue_(key, value) {
  if (key === 'symptom_severity') return formatSeverity_(value);

  const parts = Array.isArray(value)
    ? value.map(function (v) { return String(v || '').trim(); }).filter(Boolean)
    : String(value === null || value === undefined ? '' : value).split(',').map(function (v) { return v.trim(); }).filter(Boolean);

  if (!parts.length) return '';

  if (key === 'sleep_variant') {
    return parts.map(function (v) { return formatSleepVariant_(v); }).join(', ');
  }

  if (key === 'primary_area') {
    return AREA_LABELS[parts[0]] || parts[0];
  }

  if (key === 'selected_parts') {
    return parts.map(function (p) { return AREA_LABELS[p] || p; }).join(', ');
  }

  const map = VALUE_LABELS[key] || null;
  if (map) {
    return parts.map(function (p) { return map[p] || p; }).join(', ');
  }

  return parts.join(', ');
}

function formatSleepVariant_(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const dynamic = raw.match(/^(back|side)_(head|arms|legs)_([1-3])$/);
  if (dynamic) {
    const pos = { back: 'По гръб', side: 'На страна', front: 'По корем' }[dynamic[1]] || dynamic[1];
    const part = { head: 'глава', arms: 'ръце', legs: 'крака' }[dynamic[2]] || dynamic[2];
    return pos + ' - ' + part + ' - вариант ' + dynamic[3];
  }

  const belly = raw.match(/^belly_([1-2])$/);
  if (belly) {
    return 'По корем - вариант ' + belly[1];
  }

  const legacy = VALUE_LABELS.sleep_variant && VALUE_LABELS.sleep_variant[raw];
  return legacy || raw;
}

function formatSeverity_(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw);
    const pairs = [];
    Object.keys(parsed).forEach(function (k) {
      const label = (VALUE_LABELS.symptom_type && VALUE_LABELS.symptom_type[k]) ? VALUE_LABELS.symptom_type[k] : k;
      pairs.push(label + ': ' + parsed[k] + '/10');
    });
    return pairs.join(', ');
  } catch (err) {
    return raw;
  }
}

function savePdfReport_(submittedAt, readable, imageEntries, folder, baseName, drawnCanvasKeySet) {
  const result = { url: '', warning: '' };
  if (!CONFIG.SAVE_PDF_TO_DRIVE) return result;

  if (!folder) {
    result.warning = 'PDF was not saved: PDF folder is not available.';
    return result;
  }

  try {
    const html = buildPdfHtml_(submittedAt, readable, imageEntries, drawnCanvasKeySet || {});
    const htmlBlob = Utilities.newBlob(html, MimeType.HTML, baseName + '.html');
    const pdfBlob = htmlBlob.getAs(MimeType.PDF).setName(baseName + '.pdf');
    const pdfFile = folder.createFile(pdfBlob);

    if (CONFIG.MAKE_FILES_PUBLIC) {
      try {
        pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {
        // If sharing fails we still keep file URL.
      }
    }

    result.url = 'https://drive.google.com/file/d/' + pdfFile.getId() + '/view';
    return result;
  } catch (err) {
    result.warning = 'PDF save failed: ' + String(err && err.message ? err.message : err);
    return result;
  }
}

function buildPdfHtml_(submittedAt, readable, imageEntries, drawnCanvasKeySet) {
  const parts = [];
  parts.push('<!doctype html><html><head><meta charset="utf-8">');
  parts.push('<style>');
  parts.push('@page{size:A4;margin:12mm;}');
  parts.push('body{font-family:Arial,sans-serif;color:#1f2d3d;margin:0;font-size:12px;line-height:1.45;}');
  parts.push('h1{font-size:22px;margin:0 0 8px;color:#0e4f7a;}');
  parts.push('h2{font-size:16px;margin:16px 0 8px;color:#0e4f7a;}');
  parts.push('.meta{margin:0 0 12px;padding:10px;border:1px solid #d9e3ec;background:#f7fbff;}');
  parts.push('.section{margin:0 0 14px;}');
  parts.push('table{border-collapse:collapse;width:100%;}');
  parts.push('td{border:1px solid #d9e3ec;padding:7px 9px;vertical-align:top;}');
  parts.push('td.k{width:35%;font-weight:700;background:#f6f9fc;}');
  parts.push('.section-images-wrap{margin:10px 0 2px;page-break-inside:avoid;break-inside:avoid-page;}');
  parts.push('.section-images-title{margin:0 0 6px;font-size:12px;font-weight:700;color:#0e4f7a;}');
  parts.push('.section-images{font-size:0;}');
  parts.push('.section-image-item{display:inline-block;vertical-align:top;width:24%;margin:0 0.5% 8px;border:1px solid #d9e3ec;padding:5px;background:#fff;box-sizing:border-box;page-break-inside:avoid;break-inside:avoid-page;}');
  parts.push('.section-image-item .title{font-size:11px;font-weight:700;margin:0 0 5px;line-height:1.3;}');
  parts.push('.section-image-item img{width:100%;height:auto;display:block;max-height:190px;object-fit:contain;page-break-inside:avoid;break-inside:avoid-page;}');
  parts.push('.images{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}');
  parts.push('.img-item{border:1px solid #d9e3ec;padding:6px;}');
  parts.push('.img-item .title{font-weight:700;font-size:12px;margin:0 0 6px;}');
  parts.push('.img-item img{width:100%;height:auto;display:block;}');
  parts.push('.image-large{margin:0 0 16px;border:1px solid #d9e3ec;padding:8px;page-break-inside:avoid;break-inside:avoid-page;}');
  parts.push('.image-large .title{font-weight:700;font-size:13px;margin:0 0 8px;color:#0e4f7a;}');
  parts.push('.image-large img{width:100%;height:auto;display:block;}');
  parts.push('.page-break{page-break-before:always;}');
  parts.push('.muted{color:#667; font-size:11px;}');
  parts.push('</style></head><body>');

  parts.push('<h1>DM Physio - Онлайн въпросник</h1>');
  parts.push('<div class="meta"><strong>Подаден на:</strong> ' + escapeHtml_(submittedAt) + '</div>');

  const validImages = (imageEntries || []).filter(function (entry) {
    return entry && entry.blob;
  }).map(function (entry) {
    return {
      key: String(entry.key || ''),
      title: entry.title || entry.key || 'Маркировка',
      dataUrl: blobToDataUrl_(entry.blob),
    };
  }).filter(function (entry) { return !!entry.dataUrl; });

  PDF_SECTIONS.forEach(function (section) {
    appendSectionTable_(parts, section.title, section.fields, readable);
    const sectionImages = getImagesForPdfSection_(section, validImages);
    appendSectionImageGrid_(parts, sectionImages);
  });

  const drawnSet = drawnCanvasKeySet || {};
  const hasExplicitDrawn = Object.keys(drawnSet).length > 0;
  const drawnImages = validImages.filter(function (entry) {
    if (hasExplicitDrawn) return !!drawnSet[entry.key];
    return isLikelyDrawnCanvasKey_(entry.key);
  });

  if (drawnImages.length) {
    parts.push('<div class="page-break"></div>');
    parts.push('<h2>Големи изображения на рисуваните зони</h2>');
    drawnImages.forEach(function (entry) {
      appendLargeImageSection_(parts, entry.title, entry.dataUrl);
    });
  }

  if (!validImages.length) {
    parts.push('<p class="muted">Няма отбелязани маркировки върху изображения.</p>');
  }

  parts.push('</body></html>');
  return parts.join('');
}

function getImagesForPdfSection_(section, validImages) {
  const title = String(section && section.title ? section.title : '');
  const all = Array.isArray(validImages) ? validImages : [];

  if (title.indexOf('2) Локализация') === 0) {
    return all.filter(function (entry) {
      const key = String(entry.key || '');
      return key.indexOf('sleep__') !== 0 && key.indexOf('badhabit__') !== 0;
    });
  }

  if (title.indexOf('4) Навици и активност') === 0) {
    return all.filter(function (entry) {
      const key = String(entry.key || '');
      return key.indexOf('sleep__') === 0 || key.indexOf('badhabit__') === 0;
    });
  }

  return [];
}

function appendSectionImageGrid_(parts, images) {
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!list.length) return;

  parts.push('<div class="section-images-wrap">');
  parts.push('<div class="section-images-title">Избрани изображения:</div>');
  parts.push('<div class="section-images">');
  list.forEach(function (entry) {
    parts.push('<div class="section-image-item"><div class="title">' + escapeHtml_(entry.title) + '</div><img src="' + entry.dataUrl + '" alt="' + escapeHtml_(entry.title) + '"></div>');
  });
  parts.push('</div>');
  parts.push('</div>');
}

function appendSectionTable_(parts, title, fields, data) {
  parts.push('<div class="section">');
  parts.push('<h2>' + escapeHtml_(title) + '</h2>');
  parts.push('<table>');

  let rows = 0;
  fields.forEach(function (entry) {
    const label = entry[0];
    const key = entry[1];
    const value = String(data[key] || '').trim();
    if (!value) return;

    rows += 1;
    parts.push('<tr><td class="k">' + escapeHtml_(label) + '</td><td>' + escapeHtml_(value) + '</td></tr>');
  });

  if (rows === 0) {
    parts.push('<tr><td class="k">Информация</td><td>Няма попълнени данни в тази секция.</td></tr>');
  }

  parts.push('</table>');
  parts.push('</div>');
}

function appendImageBlock_(parts, title, dataUrl) {
  if (!dataUrl) return;
  parts.push('<div class="img-item"><div class="title">' + escapeHtml_(title) + '</div><img src="' + dataUrl + '" alt="' + escapeHtml_(title) + '"></div>');
}

function appendLargeImageSection_(parts, title, dataUrl) {
  if (!dataUrl) return;
  parts.push('<div class="image-large"><div class="title">' + escapeHtml_(title) + '</div><img src="' + dataUrl + '" alt="' + escapeHtml_(title) + '"></div>');
}

function buildBaseFileName_(readable, submittedAt) {
  const firstName = sanitizeFileNamePart_(readable.first_name || 'БезИме');
  const lastName = sanitizeFileNamePart_(readable.last_name || 'БезФамилия');
  const area = sanitizeFileNamePart_(readable.primary_area || readable.selected_parts || 'НеУточненаЗона');
  const datePart = formatDateToMinutes_(submittedAt);
  return sanitizeFileNamePart_(firstName + '_' + lastName + '_' + area + '_' + datePart);
}

function formatDateToMinutes_(submittedAt) {
  let date = new Date(submittedAt);
  if (isNaN(date.getTime())) date = new Date();
  const tz = Session.getScriptTimeZone() || 'Europe/Sofia';
  return Utilities.formatDate(date, tz, 'yyyy-MM-dd_HH-mm');
}

function sanitizeFileNamePart_(text) {
  let value = String(text || '').trim();
  if (!value) return 'NA';

  value = value.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
  value = value.replace(/\s+/g, '_');
  value = value.replace(/_+/g, '_');
  value = value.replace(/^\.+|\.+$/g, '');
  value = value.replace(/^_+|_+$/g, '');

  if (!value) return 'NA';
  return value.substring(0, 80);
}

function blobToDataUrl_(blob) {
  if (!blob) return '';
  const contentType = String(blob.getContentType() || '').toLowerCase();
  if (contentType !== 'image/png' && contentType !== 'image/jpeg' && contentType !== 'image/jpg') return '';
  const base64 = Utilities.base64Encode(blob.getBytes());
  return 'data:' + contentType + ';base64,' + base64;
}

function dataUrlToBlob_(dataUrl, tag) {
  const str = String(dataUrl || '');
  const match = str.match(/^data:(image\/png|image\/jpeg);base64,(.+)$/);
  if (!match) return null;

  const mime = match[1];
  const bytes = Utilities.base64Decode(match[2]);
  return Utilities.newBlob(bytes, mime, tag + '.' + (mime === 'image/png' ? 'png' : 'jpg'));
}

function getFolderContextById_(rawId, label) {
  const raw = String(rawId || '').trim();
  if (!raw) return { folder: null, warning: label + ' is empty.' };

  const folderId = normalizeDriveFolderId_(raw);
  try {
    return { folder: DriveApp.getFolderById(folderId), warning: '' };
  } catch (err) {
    return {
      folder: null,
      warning: 'Could not access folder for ' + label + ' (' + folderId + '). ' + String(err && err.message ? err.message : err),
    };
  }
}

function normalizeDriveFolderId_(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return '';

  if (raw.indexOf('/folders/') !== -1) {
    const afterFolders = raw.split('/folders/')[1] || '';
    return afterFolders.split('?')[0].split('&')[0].trim();
  }

  return raw.split('?')[0].split('&')[0].trim();
}

function appendDynamicRow_(sheet, rowObject) {
  const existingHeaders = getHeaders_(sheet);
  const incomingKeys = Object.keys(rowObject);

  const mergedHeaders = existingHeaders.slice();
  incomingKeys.forEach(function (key) {
    if (mergedHeaders.indexOf(key) === -1) mergedHeaders.push(key);
  });

  if (!arraysEqual_(existingHeaders, mergedHeaders)) {
    sheet.getRange(1, 1, 1, mergedHeaders.length).setValues([mergedHeaders]);
  }

  const rowValues = mergedHeaders.map(function (header) {
    return Object.prototype.hasOwnProperty.call(rowObject, header) ? rowObject[header] : '';
  });

  const rowNumber = sheet.getLastRow() + 1;
  sheet.getRange(rowNumber, 1, 1, mergedHeaders.length).setValues([rowValues]);
}

function getHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) return [];
  const values = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  return values.filter(function (value) { return String(value).trim() !== ''; });
}

function getSpreadsheet_() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== 'PASTE_SPREADSHEET_ID_HERE') {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error('No active spreadsheet found. Paste SPREADSHEET_ID in CONFIG.');
}

function getOrCreateSheet_(sheetName) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 1).setValue('submitted_at');
  }
  return sheet;
}

function arraysEqual_(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function escapeHtml_(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function authorizeAll_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const pdfFolder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
  return 'ok: ' + ss.getId() + ' | pdf:' + pdfFolder.getId();
}
