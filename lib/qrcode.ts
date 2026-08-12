import QRCode from "qrcode";

export async function genererQRCodeDataUrl(contenu: string): Promise<string> {
  try {
    return await QRCode.toDataURL(contenu, {
      margin: 1,
      width: 240,
      color: { dark: "#2C1A14", light: "#FFFFFF" },
    });
  } catch (erreur) {
    console.error("Erreur lors de la génération du QR code :", erreur);
    return "";
  }
}
