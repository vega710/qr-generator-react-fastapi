import React from 'react';
import { createRoot } from 'react-dom/client';
import { Clipboard, Download, Loader2, Moon, QrCode, Sun } from 'lucide-react';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const QR_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'url', label: 'URL' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'wifi', label: 'Wi-Fi' },
];

function App() {
  const [type, setType] = React.useState('text');
  const [form, setForm] = React.useState({
    value: '',
    ssid: '',
    password: '',
    encryption: 'WPA',
    size: 10,
  });
  const [qrUrl, setQrUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (qrUrl) URL.revokeObjectURL(qrUrl);
    };
  }, [qrUrl]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = () => {
    const payload = { type, size: Number(form.size) };
    if (type === 'wifi') {
      payload.ssid = form.ssid;
      payload.password = form.password;
      payload.encryption = form.encryption;
      return payload;
    }
    payload.value = form.value;
    return payload;
  };

  const generateQr = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Unable to generate QR code.');
      }

      const blob = await response.blob();
      setQrUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(blob);
      });
    } catch (err) {
      setError(err.message);
      setQrUrl('');
    } finally {
      setLoading(false);
    }
  };

  const downloadQr = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-${type}.png`;
    link.click();
  };

  const copyQr = async () => {
    if (!qrUrl || !navigator.clipboard || !window.ClipboardItem) return;
    const blob = await fetch(qrUrl).then((response) => response.blob());
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  };

  return (
    <main className={darkMode ? 'app dark' : 'app'}>
      <section className="shell">
        <div className="topbar">
          <div className="brand">
            <span className="brand-icon">
              <QrCode size={24} />
            </span>
            <div>
              <h1>QRLik</h1>
              <p>Create clean, scannable PNG QR codes.</p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setDarkMode((value) => !value)} type="button" aria-label="Toggle dark mode">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="workspace">
          <form className="panel form-panel" onSubmit={generateQr}>
            <div className="tabs" role="tablist" aria-label="QR code type">
              {QR_TYPES.map((item) => (
                <button
                  aria-selected={type === item.id}
                  className={type === item.id ? 'tab active' : 'tab'}
                  key={item.id}
                  onClick={() => {
                    setType(item.id);
                    setError('');
                  }}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <DynamicFields form={form} type={type} updateForm={updateForm} />

            <label className="field">
              <span>QR size</span>
              <input
                max="20"
                min="4"
                onChange={(event) => updateForm('size', event.target.value)}
                type="range"
                value={form.size}
              />
              <strong>{form.size}</strong>
            </label>

            {error && <p className="error">{error}</p>}

            <button className="primary-button" disabled={loading} type="submit">
              {loading ? <Loader2 className="spin" size={18} /> : <QrCode size={18} />}
              Generate QR Code
            </button>
          </form>

          <section className="panel preview-panel" aria-label="QR code preview">
            <div className="preview-box">
              {qrUrl ? (
                <img alt="Generated QR code" src={qrUrl} />
              ) : (
                <div className="empty-preview">
                  <QrCode size={72} />
                  <p>Your QR code appears here.</p>
                </div>
              )}
            </div>

            <div className="actions">
              <button className="secondary-button" disabled={!qrUrl} onClick={downloadQr} type="button">
                <Download size={18} />
                Download
              </button>
              <button className="secondary-button" disabled={!qrUrl} onClick={copyQr} type="button">
                <Clipboard size={18} />
                Copy image
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function DynamicFields({ form, type, updateForm }) {
  if (type === 'wifi') {
    return (
      <div className="fields">
        <label className="field">
          <span>Network name</span>
          <input onChange={(event) => updateForm('ssid', event.target.value)} placeholder="MyNetwork" required value={form.ssid} />
        </label>
        <label className="field">
          <span>Password</span>
          <input onChange={(event) => updateForm('password', event.target.value)} placeholder="12345678" type="password" value={form.password} />
        </label>
        <label className="field">
          <span>Encryption</span>
          <select onChange={(event) => updateForm('encryption', event.target.value)} value={form.encryption}>
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">No password</option>
          </select>
        </label>
      </div>
    );
  }

  const config = {
    text: { label: 'Text', placeholder: 'Write anything you want to encode', inputMode: 'text', type: 'text' },
    url: { label: 'Website URL', placeholder: 'example.com', inputMode: 'url', type: 'url' },
    email: { label: 'Email address', placeholder: 'hello@example.com', inputMode: 'email', type: 'email' },
    phone: { label: 'Phone number', placeholder: 'phone number', inputMode: 'tel', type: 'tel' },
  }[type];

  return (
    <label className="field">
      <span>{config.label}</span>
      {type === 'text' ? (
        <textarea onChange={(event) => updateForm('value', event.target.value)} placeholder={config.placeholder} required rows="5" value={form.value} />
      ) : (
        <input
          inputMode={config.inputMode}
          onChange={(event) => updateForm('value', event.target.value)}
          placeholder={config.placeholder}
          required
          type={config.type}
          value={form.value}
        />
      )}
    </label>
  );
}

createRoot(document.getElementById('root')).render(<App />);

