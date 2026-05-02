import { useState } from 'react';
import {
  HiOutlineQuestionMarkCircle, HiOutlineMail, HiOutlinePhone,
  HiOutlinePaperAirplane, HiOutlineCheckCircle,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import './Help.scss';

const SUPPORT_EMAIL = 'support@bharatmithra.com';
const SUPPORT_PHONE = '+91 80 1234 5678';

type Category = 'account' | 'wallet' | 'service' | 'technical' | 'other';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'account',   label: 'Account & login'      },
  { value: 'wallet',    label: 'Wallet & payments'    },
  { value: 'service',   label: 'A specific service'   },
  { value: 'technical', label: 'Technical issue / bug' },
  { value: 'other',     label: 'Something else'        },
];

const Help = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<Category>('account');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid = name.trim() && email.trim() && subject.trim() && message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    // Stash the request locally — backend hook will pick this up later.
    try {
      const existing = JSON.parse(localStorage.getItem('bm_help_requests') || '[]');
      existing.unshift({
        id: `HR_${Date.now().toString(36)}`,
        name, email, phone, category, subject, message,
        createdAt: new Date().toISOString(),
        status: 'open',
      });
      localStorage.setItem('bm_help_requests', JSON.stringify(existing));
    } catch { /* ignore */ }

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const reset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCategory('account');
    setSubject('');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <div className="bm-help">
      <PageHeader
        icon={<HiOutlineQuestionMarkCircle />}
        title="Help & Support"
        description="Have a question, found a bug, or need help with a service? Send us a message — we usually reply within a business day."
      />

      <div className="bm-help-grid">
        {/* Left: form */}
        <section className="bm-help-card">
          <h3>Contact us</h3>
          <p className="bm-help-card-sub">
            Fill in the form below. Your message goes straight to our support team's inbox.
          </p>

          {submitted ? (
            <div className="bm-help-success">
              <div className="bm-help-success-icon"><HiOutlineCheckCircle /></div>
              <h4>Message sent</h4>
              <p>
                Thanks{name ? `, ${name.split(' ')[0]}` : ''}! We've received your request and
                will reply to <strong>{email}</strong> within 1 business day.
              </p>
              <button className="bm-btn" onClick={reset}>Send another message</button>
            </div>
          ) : (
            <form className="bm-help-form" onSubmit={handleSubmit}>
              <div className="bm-help-row">
                <label className="bm-help-field">
                  <span>Your name <em>*</em></span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </label>
                <label className="bm-help-field">
                  <span>Email <em>*</em></span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <div className="bm-help-row">
                <label className="bm-help-field">
                  <span>Phone <small>(optional)</small></span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98xxxxxxxx"
                  />
                </label>
                <label className="bm-help-field">
                  <span>Topic <em>*</em></span>
                  <select value={category} onChange={e => setCategory(e.target.value as Category)}>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="bm-help-field">
                <span>Subject <em>*</em></span>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  required
                />
              </label>

              <label className="bm-help-field">
                <span>Message <em>*</em></span>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us what's happening — include any error messages, transaction IDs, or steps to reproduce."
                  rows={6}
                  required
                />
              </label>

              <div className="bm-help-actions">
                <span className="bm-help-hint">
                  Your message goes to <strong>{SUPPORT_EMAIL}</strong>
                </span>
                <button
                  type="submit"
                  className="bm-btn bm-btn-primary"
                  disabled={!isValid || submitting}
                >
                  <HiOutlinePaperAirplane />
                  {submitting ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Right: contact strip */}
        <aside className="bm-help-side">
          <div className="bm-help-side-card">
            <h4>Reach us directly</h4>
            <a className="bm-help-side-row" href={`mailto:${SUPPORT_EMAIL}`}>
              <HiOutlineMail />
              <div>
                <span className="bm-help-side-label">Email</span>
                <span className="bm-help-side-value">{SUPPORT_EMAIL}</span>
              </div>
            </a>
            <a className="bm-help-side-row" href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}>
              <HiOutlinePhone />
              <div>
                <span className="bm-help-side-label">Phone</span>
                <span className="bm-help-side-value">{SUPPORT_PHONE}</span>
              </div>
            </a>
            <div className="bm-help-side-hours">
              <strong>Hours</strong>
              Mon – Sat · 9:00 AM – 7:00 PM IST
            </div>
          </div>

          <div className="bm-help-side-card">
            <h4>Faster help</h4>
            <ul className="bm-help-tips">
              <li>Mention the <strong>service code</strong> if your issue is about a specific service.</li>
              <li>Paste the <strong>transaction reference</strong> for any wallet or payment problem.</li>
              <li>Add a <strong>screenshot</strong> when reporting a UI bug — reply to our email with it attached.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Help;
