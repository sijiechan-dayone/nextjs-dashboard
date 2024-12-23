import React from "react";

interface QRCodeDisplayProps {
  qrCode: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode }) => {
  return (
    <div>
      <h2>Scan this QR code with Google Authenticator</h2>
      <img src={qrCode} alt="QR Code for Google Authenticator" />
    </div>
  );
};

export default QRCodeDisplay;
