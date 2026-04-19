export const manifestStyles = `
  .pm-page { min-height: 100vh; background: #edf2f7; font-family: Arial, Helvetica, sans-serif; }

  .pm-toolbar {
    background: #1a365d; padding: 11px 24px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0,0,0,.3); position: sticky; top: 0; z-index: 50;
  }
  .pm-toolbar-title { color: #fff; font-size: 17px; font-weight: 700; letter-spacing: .3px; }
  .pm-toolbar-sub { color: #90cdf4; font-size: 13px; margin-top: 2px; }
  .pm-btn-print {
    background: #3182ce; color: #fff; border: none; padding: 8px 20px; border-radius: 6px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 6px; transition: background .15s;
  }
  .pm-btn-print:hover { background: #2b6cb0; }

  .pm-paper-wrap { padding: 24px 32px 48px; }
  .pm-paper { background: #fff; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,.14); padding: 24px 28px 28px; }

  .doc-header {
    display: flex; align-items: flex-start; gap: 16px;
    border-bottom: 2px solid #276749; padding-bottom: 12px; margin-bottom: 18px;
  }
  .doc-logo { flex-shrink: 0; width: 185px; border-right: 1px solid #c3d9ca; padding-right: 14px; }
  .doc-logo-trans { font-size: 16px; font-weight: 900; font-family: 'Times New Roman', serif; letter-spacing: 2px; color: #1a202c; line-height: 1; }
  .doc-logo-comarapa { font-size: 36px; font-weight: 900; font-family: 'Times New Roman', serif; color: #1a202c; letter-spacing: 1px; line-height: 1; margin-bottom: 4px; }
  .doc-sindicato { font-size: 11px; color: #4a5568; line-height: 1.35; margin-bottom: 5px; }
  .doc-phones { font-size: 11px; color: #4a5568; line-height: 1.5; }
  .doc-center { flex: 1; overflow: hidden; }
  .doc-route-banner {
    font-size: 13px; font-weight: 700; color: #276749; text-align: center; letter-spacing: .4px;
    border-bottom: 1px solid #c3d9ca; padding-bottom: 5px; margin-bottom: 8px;
  }
  .doc-manifest-title {
    font-size: 17px; font-weight: 900; color: #1a365d; text-align: center;
    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;
  }
  .doc-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 18px; }
  .doc-field { display: flex; align-items: flex-end; gap: 3px; min-height: 17px; }
  .doc-field-label { font-size: 12px; font-weight: 700; color: #1a202c; white-space: nowrap; flex-shrink: 0; }
  .doc-field-value {
    font-size: 12px; color: #1a202c; border-bottom: 1px dotted #a0aec0;
    flex: 1; padding-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .doc-trip-id {
    flex-shrink: 0; border: 2px solid #e53e3e; border-radius: 4px; padding: 5px 10px;
    text-align: center; align-self: flex-start; background: #fff5f5;
  }
  .doc-trip-id-label { font-size: 11px; color: #e53e3e; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
  .doc-trip-id-number { font-size: 24px; font-weight: 900; color: #e53e3e; letter-spacing: 1px; line-height: 1; }

  .pkg-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 4px; }
  .pkg-table thead th {
    background: #1a365d; color: #fff; font-size: 12px; font-weight: 700;
    padding: 5px 7px; text-align: left; border: 1px solid #1a365d;
  }
  .pkg-table thead th.col-no  { width: 28px; text-align: center; }
  .pkg-table thead th.col-id  { width: 45px; text-align: center; }
  .pkg-table thead th.col-amt { width: 62px; text-align: right; }
  .pkg-table thead th.col-est { width: 80px; text-align: center; }

  .pkg-table tbody tr { height: 22px; }
  .pkg-table tbody tr:nth-child(even) { background: #ebf8ff; }
  .pkg-table tbody tr:nth-child(odd)  { background: #fff; }

  .pkg-table tbody td { border: 1px solid #bee3f8; padding: 2px 6px; font-size: 12px; color: #1a202c; vertical-align: middle; }
  .pkg-table tbody td.col-no { text-align: center; font-weight: 700; color: #1a365d; border-color: #1a365d; width: 28px; }
  .pkg-table tbody td.col-id { text-align: center; font-weight: 600; color: #2b6cb0; width: 45px; padding: 0; }
  .pkg-table tbody td.col-id a { display: block; width: 100%; height: 100%; padding: 2px 0; color: inherit; text-decoration: none; }
  .pkg-table tbody td.col-id a:hover { text-decoration: underline; background: rgba(43, 108, 176, 0.05); }
  .pkg-table tbody td.col-amt { text-align: right; font-weight: 700; width: 62px; }
  .pkg-table tbody td.col-est { text-align: center; width: 80px; padding: 2px 4px; }
  .pkg-table tbody td.col-desc { max-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .badge-paid { display: inline-block; background: #c6f6d5; color: #22543d; font-size: 11px; font-weight: 700; border-radius: 3px; padding: 1px 6px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .badge-unpaid { display: inline-block; background: #fefcbf; color: #744210; font-size: 11px; font-weight: 700; border-radius: 3px; padding: 1px 6px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .pm-summary {
    display: flex; gap: 16px; flex-wrap: wrap; margin-top: 14px; padding-top: 10px;
    border-top: 1px solid #bee3f8; font-size: 13px; color: #4a5568;
  }
  .pm-summary strong { color: #1a202c; }

  .pm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 320px; gap: 14px; color: #718096; }
  .pm-spinner { width: 36px; height: 36px; border: 3px solid #bee3f8; border-top-color: #3182ce; border-radius: 50%; animation: spin .8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media print {
    .pm-toolbar { display: none !important; }
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .pm-page { background: #fff !important; min-height: unset !important; }
    .pm-paper-wrap { padding: 0 !important; }
    .pm-paper { box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }
    .pkg-table thead th { background: #1a365d !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pkg-table tbody tr:nth-child(even) { background: #ebf8ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge-paid { background: #c6f6d5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge-unpaid { background: #fefcbf !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .doc-trip-id { background: #fff5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: letter landscape; margin: 10mm 12mm; }
  }
`
