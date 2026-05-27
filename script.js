function normalizePhone(num) {
  // Keep digits only
  return (num || '').replace(/\D/g, '');
}

function setupWhatsAppPurchase({ whatsappNumber, buttonId, formId }) {
  const btn = document.getElementById(buttonId);
  const form = document.getElementById(formId);
  if (!btn || !form) return;

  btn.addEventListener('click', () => {
    const student = form.elements['student']?.value?.trim() || '';
    const phone = form.elements['phone']?.value?.trim() || '';
    const note = form.elements['note']?.value?.trim() || '';

    const meta = window.BATCH_META || {};

    const lines = [];
    lines.push(`Hi Samrat's core physics 👋`);
    lines.push(`I want to enquire/purchase: ${meta.className || ''}`.trim());
    lines.push(`Location: ${meta.location || ''}`);
    lines.push(`Time: ${meta.time || ''}`);
    lines.push(`Fees: ${meta.fees || ''}`);

    if (student) lines.push(`Student name: ${student}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (note) lines.push(`Message: ${note}`);

    lines.push(`— Sent from website`);

    const message = lines.join('\n');
    const phoneDigits = normalizePhone(whatsappNumber);

    // WhatsApp click-to-chat
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });
}

