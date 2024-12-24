import React from "react";
import Image from "next/image";

interface QRCodeDisplayProps {
  qrCode: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode }) => {
  return (
    <div>
      <h2>Scan this QR code with Google Authenticator</h2>
      <Image src={qrCode} alt="QR Code for Google Authenticator" />
    </div>
  );
};

export default QRCodeDisplay;
