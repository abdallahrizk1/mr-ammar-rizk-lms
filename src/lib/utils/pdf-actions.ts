/**
 * Utilities for opening PDFs / answer keys externally in a new browser tab
 * and downloading PDF files directly without native browser alert popups.
 */

export function buildPrintableDocumentHtml(title: string, pagesCount: number): string {
  const safePages = Math.max(1, Math.min(pagesCount || 8, 12));
  const pagesHtml = Array.from({ length: safePages }, (_, idx) => {
    const pageNum = idx + 1;
    return `
      <section class="page">
        <header class="page-header">
          <span class="brand">منصة الأستاذ عمار رزق • الأحياء للثانوية العامة 2027</span>
          <span class="page-num">صفحة ${pageNum} من ${pagesCount}</span>
        </header>
        <div class="page-body">
          <h2>${title} — الجزء (${pageNum})</h2>
          <p class="lead">
            ملف علمي متكامل ومفصل يشمل الشرح، الرسومات التشريحية التوضيحية، وأهم نقاط الربط والاستنتاج ونماذج الإجابة المعتمدة.
          </p>
          <div class="box">
            <strong>📌 خلاصة الفكرة العلمية ونموذج الحل (${pageNum}):</strong>
            <ul>
              <li>تعتمد الدعامة الفسيولوجية على امتلاء الفجوة العصارية بالماء بالخاصية الأسموزية كظاهرة مؤقتة.</li>
              <li>الدعامة التركيبية دائمة وتعتمد على ترسيب السليلوز واللجنين والسيوبرين والكيوتين في جدر الخلايا.</li>
              <li>مراجعة العلاقات البيانية بين الضغط الأسموزي وضغط الامتلاء وحجم الخلية النباتية.</li>
            </ul>
          </div>
          <div class="diagram">
            <svg viewBox="0 0 500 120" width="100%" height="110">
              <rect x="10" y="10" width="480" height="100" rx="14" fill="#f0fdfa" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="5,5" />
              <circle cx="120" cy="60" r="32" fill="#10b981" fill-opacity="0.2" stroke="#059669" stroke-width="2" />
              <circle cx="380" cy="60" r="22" fill="#f43f5e" fill-opacity="0.18" stroke="#e11d48" stroke-width="2" />
              <path d="M 175 60 L 335 60" stroke="#0f766e" stroke-width="2" />
              <text x="255" y="48" text-anchor="middle" font-size="13" fill="#0f766e" font-weight="bold">مخطط توضيحي رقم (${pageNum})</text>
              <text x="255" y="82" text-anchor="middle" font-size="11" fill="#334155">مقارنة ضغط الامتلاء والانكماش الأسموزي</text>
            </svg>
          </div>
        </div>
        <footer class="page-footer">
          <span>جميع الحقوق محفوظة © منصة أ/ عمار رزق 2027</span>
          <span>${title}</span>
        </footer>
      </section>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - منصة مستر عمار رزق</title>
  <style>
    * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
    body { margin: 0; background: #071719; color: #0f172a; padding: 16px; }
    .toolbar {
      position: sticky; top: 0; z-index: 20;
      max-width: 860px; margin: 0 auto 16px;
      background: #0d2628; color: #fff;
      border: 1px solid rgba(20,184,166,0.3);
      border-radius: 14px; padding: 12px 18px;
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;
    }
    .toolbar h1 { font-size: 15px; margin: 0; color: #6ee7b7; }
    .btn {
      background: #10b981; color: #fff; border: none; border-radius: 10px;
      padding: 8px 16px; font-weight: bold; font-size: 13px; cursor: pointer;
    }
    .page {
      max-width: 860px; margin: 0 auto 20px; background: #ffffff;
      border-radius: 16px; padding: 28px; box-shadow: 0 12px 30px rgba(0,0,0,0.35);
    }
    .page-header, .page-footer {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 12px; color: #64748b; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;
    }
    .page-footer { border-bottom: none; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px; }
    .brand { color: #0f766e; font-weight: bold; }
    h2 { font-size: 18px; color: #0f172a; margin: 18px 0 10px; }
    .lead { font-size: 14px; color: #334155; line-height: 1.8; }
    .box {
      background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px;
      padding: 14px 18px; margin: 16px 0; font-size: 13px; color: #134e4a; line-height: 1.9;
    }
    .diagram { margin-top: 14px; }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none; }
      .page { box-shadow: none; page-break-after: always; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>📄 ${title} (${pagesCount} صفحة)</h1>
    <button class="btn" onclick="window.print()">طباعة / حفظ كملف PDF</button>
  </div>
  ${pagesHtml}
</body>
</html>`;
}

export function openPdfExternally(title: string, pagesCount: number = 10): void {
  if (typeof window === 'undefined') return;
  const html = buildPrintableDocumentHtml(title, pagesCount);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function downloadPdfFile(title: string, pagesCount: number = 10): void {
  if (typeof window === 'undefined') return;
  const html = buildPrintableDocumentHtml(title, pagesCount);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanName = title.replace(/[\\/:*?"<>|]/g, '-').trim() || 'document';
  a.href = url;
  a.download = `${cleanName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
