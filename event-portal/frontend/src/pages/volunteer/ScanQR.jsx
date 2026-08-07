import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axiosInstance from '../../api/axiosInstance';

const ScanQR = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('check_in');
  const html5QrRef = useRef(null);

  const startScanning = async () => {
    setError('');
    setResult(null);
    setScanning(true);

    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrRef.current = html5QrCode;

    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) throw new Error('No camera found on this device');

      const rearCamera = devices.find((d) => /back|rear|environment/i.test(d.label));
      const cameraId = rearCamera ? rearCamera.id : devices[0].id;

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await html5QrCode.stop();
          setScanning(false);
          await handleCheckIn(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setError(err.message || 'Could not access camera. Check that you granted camera permission.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch (err) {}
    }
    setScanning(false);
  };

  const handleCheckIn = async (qrToken) => {
    try {
      const res = await axiosInstance.post('/checkin', { qrToken, type: mode });
      setResult({ success: true, message: res.data.message, attendeeName: res.data.attendeeName, eventTitle: res.data.eventTitle });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Check-in failed.' });
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrRef.current) html5QrRef.current.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="page-narrow" style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: 20 }}>Scan Attendee QR Code</h2>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16, fontSize: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="radio" checked={mode === 'check_in'} onChange={() => setMode('check_in')} /> Check In
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="radio" checked={mode === 'check_out'} onChange={() => setMode('check_out')} /> Check Out
          </label>
        </div>

        {!scanning ? (
          <button onClick={startScanning} className="btn btn-primary">Start Scanning</button>
        ) : (
          <button onClick={stopScanning} className="btn btn-secondary">Stop Scanning</button>
        )}

        <div id="qr-reader" style={{ marginTop: 16, borderRadius: 'var(--radius)', overflow: 'hidden' }} />

        {error && <p className="msg-error" style={{ marginTop: 16 }}>{error}</p>}

        {result && (
          <div className={result.success ? 'msg-success' : 'msg-error'} style={{ marginTop: 20, textAlign: 'left' }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{result.message}</p>
            {result.success && (
              <p style={{ margin: '4px 0 0' }}>{result.attendeeName} — {result.eventTitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanQR;
