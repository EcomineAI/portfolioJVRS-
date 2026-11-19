import { useState } from 'react';
import { gmailCompose, profile } from '../../data/profile.js';
import { MailIcon } from '../Icons.jsx';
import { PixelButton } from '../ui/index.jsx';

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

const getConfig = () => ({
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() || '',
});

export default function DirectEmailForm({ compact = false, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (botField) return; // honeypot
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    const { serviceId, templateId, publicKey } = getConfig();
    if (!serviceId || !templateId || !publicKey) {
      setStatus('error');
      setErrorMsg('EmailJS keys are not set yet. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in .env, or use Gmail below.');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch(EMAILJS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            from_name: name.trim(),
            from_email: email.trim(),
            reply_to: email.trim(),
            message: message.trim(),
            to_email: profile.email,
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }

      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message ? `Could not send (${err.message}). Try Gmail below.` : 'Could not send right now. Try Gmail below.');
    }
  };

  return (
    <form
      className={`direct-mail pixel-card${compact ? ' direct-mail--compact' : ''}`}
      onSubmit={handleSubmit}
      noValidate
      data-no-spray="true"
    >
      <div className="direct-mail__head">
        <span className="direct-mail__title">
          <MailIcon aria-hidden="true" /> Direct Email
        </span>
        {onClose && (
          <button
            type="button"
            className="direct-mail__close"
            onClick={onClose}
            aria-label="Close direct email form"
            data-uisfx="close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Honeypot for spam bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={botField}
        onChange={(e) => setBotField(e.target.value)}
        className="sr-only"
        aria-hidden="true"
      />

      <div className="direct-mail__row">
        <label className="direct-mail__field">
          <span className="direct-mail__label">Name</span>
          <input
            type="text"
            name="from_name"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => { setName(e.target.value); if (status !== 'idle') setStatus('idle'); }}
            disabled={status === 'sending'}
          />
        </label>

        <label className="direct-mail__field">
          <span className="direct-mail__label">Email</span>
          <input
            type="email"
            name="from_email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); }}
            disabled={status === 'sending'}
          />
        </label>
      </div>

      <label className="direct-mail__field">
        <span className="direct-mail__label">Message</span>
        <textarea
          name="message"
          required
          rows={compact ? 3 : 4}
          placeholder="Say hi, share a project idea, or ask about availability..."
          value={message}
          onChange={(e) => { setMessage(e.target.value); if (status !== 'idle') setStatus('idle'); }}
          disabled={status === 'sending'}
        />
      </label>

      {status === 'sent' && (
        <p className="direct-mail__feedback direct-mail__feedback--ok" role="status">
          ✓ Message sent! I’ll get back to you soon.
        </p>
      )}

      {status === 'error' && (
        <p className="direct-mail__feedback direct-mail__feedback--err" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="direct-mail__actions">
        <PixelButton
          type="submit"
          size="sm"
          loading={status === 'sending'}
          data-uisfx="complete"
        >
          {status === 'sending' ? 'Sending...' : 'Send message'}
        </PixelButton>

        <a
          className="direct-mail__fallback"
          href={gmailCompose}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Gmail ↗
        </a>
      </div>
    </form>
  );
}
