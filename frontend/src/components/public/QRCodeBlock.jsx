import QRCode from 'qrcode.react';

export default function QRCodeBlock({ service, isEnabled = false }) {
  if (!isEnabled) {
    return (
      <div className="position-relative d-inline-block w-100">
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-secondary bg-opacity-75 d-flex align-items-center justify-content-center"
          style={{ zIndex: 10, borderRadius: '8px' }}
        >
          <span className="badge bg-warning text-dark">
            🔒 Bientôt disponible
          </span>
        </div>

        <div className="text-center p-2 bg-light border rounded">
          <QRCode
            value={`tel:*555*1*NUMERO*${service.price}%23`}
            size={128}
            style={{ opacity: 0.3 }}
          />
          <p className="small mt-2 text-muted">💳 Paiement mobile</p>
        </div>
      </div>
    );
  }

  const paymentCode = `tel:*555*1*NUMERO*${service.price}%23`;

  return (
    <div className="text-center p-2 bg-light border rounded">
      <QRCode value={paymentCode} size={128} />
      <p className="small mt-2 text-muted">💳 Scanner pour payer</p>
    </div>
  );
}
