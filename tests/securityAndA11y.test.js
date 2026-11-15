/**
 * @file securityAndA11y.test.js
 * @description Security hardening and accessibility regression tests across server & frontend components.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { InputSanitizer } from '../server/utils/sanitizer.js';
import { EmailReminderService } from '../server/services/emailReminderService.js';

const ROOT = process.cwd();

function collectSourceFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSourceFiles(full));
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

test('Security: InputSanitizer strips prototype pollution keys', () => {
  const payload = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"bad":1},"name":"Safe"}');
  const cleaned = InputSanitizer.sanitize(payload);
  assert.equal(({}).polluted, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(cleaned, '__proto__'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(cleaned, 'constructor'), false);
  assert.equal(cleaned.name, 'Safe');
});

test('Security: EmailReminderService escapes HTML in patient and medication fields', () => {
  const html = EmailReminderService.generateDailyBriefingHtml({
    patientName: '<img src=x onerror=alert(1)>Arthur',
    dateStr: 'Nov 15',
    medications: [
      { name: '<script>evil()</script>Aspirin', dosage: '81mg', time: '08:00', compartment: 'morning', instructions: 'With <b>water</b>' }
    ],
    appointments: [],
    refillAlerts: []
  });

  assert.equal(html.includes('<script>evil()</script>'), false);
  assert.equal(html.includes('<img src=x'), false);
  assert.ok(html.includes('&lt;script&gt;evil()&lt;/script&gt;Aspirin'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;Arthur'));
});

test('Security & Code Quality: Frontend source has no dangerouslySetInnerHTML or native browser dialogs', () => {
  const srcFiles = collectSourceFiles(path.join(ROOT, 'src'));
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(
      content.includes('dangerouslySetInnerHTML'),
      false,
      `Disallowed dangerouslySetInnerHTML found in ${path.relative(ROOT, file)}`
    );
    assert.equal(
      /\bwindow\.(prompt|alert|confirm)\s*\(/.test(content),
      false,
      `Disallowed window.prompt/alert/confirm found in ${path.relative(ROOT, file)}`
    );
  }
});

test('Security: EmailPreviewModal uses sandboxed iframe for HTML email rendering', () => {
  const content = fs.readFileSync(path.join(ROOT, 'src/components/EmailPreviewModal.jsx'), 'utf8');
  assert.ok(content.includes('<iframe'));
  assert.ok(content.includes('sandbox=""'));
  assert.ok(content.includes('srcDoc={previewData.htmlPreview}'));
});

test('Accessibility: All modals implement dialog ARIA attributes and useDialog focus trap', () => {
  const modalFiles = [
    'src/components/ui/Modal.jsx',
    'src/components/EmailPreviewModal.jsx',
    'src/components/EmergencyModal.jsx',
    'src/components/DrugInteractionModal.jsx',
    'src/components/NudgePopupModal.jsx',
    'src/components/PinPadModal.jsx'
  ];

  for (const relPath of modalFiles) {
    const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    assert.ok(content.includes('useDialog'), `${relPath} must use useDialog hook`);
    assert.ok(content.includes('role="dialog"'), `${relPath} must set role="dialog"`);
    assert.ok(content.includes('aria-modal="true"'), `${relPath} must set aria-modal="true"`);
    assert.ok(content.includes('aria-labelledby'), `${relPath} must set aria-labelledby`);
  }
});

test('Accessibility: PinPadModal supports keyboard digit entry and live status updates', () => {
  const content = fs.readFileSync(path.join(ROOT, 'src/components/PinPadModal.jsx'), 'utf8');
  assert.ok(content.includes('/^[0-9]$/.test(event.key)'));
  assert.ok(content.includes("event.key === 'Backspace'"));
  assert.ok(content.includes('aria-live="polite"'));
});

test('Accessibility: CaretakerView implements WAI-ARIA tablist, tab, and tabpanel roles', () => {
  const content = fs.readFileSync(path.join(ROOT, 'src/components/CaretakerView.jsx'), 'utf8');
  assert.ok(content.includes('role="tablist"'));
  assert.ok(content.includes('role="tab"'));
  assert.ok(content.includes('role="tabpanel"'));
  assert.ok(content.includes('aria-selected'));
  assert.ok(content.includes('ArrowRight'));
});
