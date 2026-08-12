import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Bordereau } from "@/types/bordereau";

const C = { primary: "#8B2613", bg: "#FDFBF7", card: "#F4EBE2", text: "#2C1A14", white: "#FFFFFF", border: "#E4D5C7", gray: "#7A6A60" };

const styles = StyleSheet.create({
  page: { backgroundColor: C.bg, fontSize: 10, color: C.text, fontFamily: "Helvetica" },
  header: { backgroundColor: C.primary, color: C.white, paddingVertical: 22, paddingHorizontal: 28, flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  subtitle: { fontSize: 9, marginTop: 4, color: "#F4D9CF" },
  number: { alignItems: "flex-end" },
  numberLabel: { fontSize: 7, color: "#F4D9CF", letterSpacing: 1 },
  numberValue: { fontSize: 15, fontFamily: "Helvetica-Bold", marginTop: 2 },
  date: { fontSize: 8, color: "#F4D9CF", marginTop: 6 },
  body: { padding: 28 },
  addresses: { flexDirection: "row", marginBottom: 16 },
  address: { flex: 1, backgroundColor: C.card, borderRadius: 6, padding: 12 },
  gap: { width: 12 },
  section: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.primary, marginBottom: 6, letterSpacing: 1 },
  name: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  line: { fontSize: 9, marginBottom: 2, lineHeight: 1.4 },
  block: { marginBottom: 16 },
  table: { borderWidth: 1, borderColor: C.primary, borderRadius: 4 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  lastRow: { flexDirection: "row" },
  head: { backgroundColor: C.primary },
  headCell: { color: C.white, fontSize: 8, fontFamily: "Helvetica-Bold", padding: 7, flex: 1 },
  cell: { fontSize: 9, padding: 7, flex: 1 },
  retained: { fontSize: 9, padding: 7, flex: 1, backgroundColor: C.card, fontFamily: "Helvetica-Bold", color: C.primary },
  note: { fontSize: 7, color: C.gray, marginTop: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border },
  legal: { fontSize: 7, color: C.gray, maxWidth: 340, lineHeight: 1.5 },
  qr: { alignItems: "center" },
  qrImage: { width: 72, height: 72 },
  qrLabel: { fontSize: 6, color: C.gray, marginTop: 4 },
});

export default function BordereauPDF({ bordereau, qrCodeDataUrl }: { bordereau: Bordereau; qrCodeDataUrl?: string }) {
  const { expediteur, destinataire, declaration, dimensions, poidsVolumetrique, poidsRetenu } = bordereau;
  const volumetriqueRetenu = poidsVolumetrique >= dimensions.poidsReel;

  return (
    <Document title={`Bordereau Sun Express ${bordereau.numero}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View><Text style={styles.title}>SUN EXPRESS</Text><Text style={styles.subtitle}>Réexpédition de colis — France vers Antilles / Guyane</Text></View>
          <View style={styles.number}><Text style={styles.numberLabel}>BORDEREAU N°</Text><Text style={styles.numberValue}>{bordereau.numero}</Text><Text style={styles.date}>{bordereau.dateCreation}</Text></View>
        </View>
        <View style={styles.body}>
          <View style={styles.addresses}>
            <View style={styles.address}><Text style={styles.section}>EXPÉDITEUR</Text><Text style={styles.name}>{expediteur.nom}</Text><Text style={styles.line}>{expediteur.rue}</Text><Text style={styles.line}>{expediteur.codePostal} {expediteur.ville}</Text><Text style={styles.line}>{expediteur.pays}</Text><Text style={styles.line}>{expediteur.telephone}</Text></View>
            <View style={styles.gap} />
            <View style={styles.address}><Text style={styles.section}>DESTINATAIRE</Text><Text style={styles.name}>{destinataire.prenom} {destinataire.nom}</Text><Text style={styles.line}>{destinataire.rue}</Text><Text style={styles.line}>{destinataire.codePostal} {destinataire.ville}</Text><Text style={styles.line}>{destinataire.territoire}</Text><Text style={styles.line}>WhatsApp : {destinataire.indicatifPays} {destinataire.telephoneWhatsapp}</Text></View>
          </View>
          <View style={styles.block}><Text style={styles.section}>DÉCLARATION DOUANIÈRE</Text><View style={styles.table}><View style={[styles.row, styles.head]}><Text style={[styles.headCell, { flex: 2 }]}>Description des articles</Text><Text style={styles.headCell}>Nb colis</Text><Text style={styles.headCell}>Valeur déclarée</Text></View><View style={styles.lastRow}><Text style={[styles.cell, { flex: 2 }]}>{declaration.description}</Text><Text style={styles.cell}>{declaration.nombreColis}</Text><Text style={styles.cell}>{declaration.valeurDeclaree.toFixed(2)} €</Text></View></View></View>
          <View style={styles.block}><Text style={styles.section}>POIDS RÉEL VS POIDS VOLUMÉTRIQUE</Text><View style={styles.table}><View style={[styles.row, styles.head]}><Text style={styles.headCell}>Poids réel</Text><Text style={styles.headCell}>Dimensions (L × l × H)</Text><Text style={styles.headCell}>Poids volumétrique</Text><Text style={styles.headCell}>Poids retenu</Text></View><View style={styles.lastRow}><Text style={styles.cell}>{dimensions.poidsReel.toFixed(2)} kg</Text><Text style={styles.cell}>{dimensions.longueur} × {dimensions.largeur} × {dimensions.hauteur} cm</Text><Text style={styles.cell}>{poidsVolumetrique.toFixed(2)} kg</Text><Text style={styles.retained}>{poidsRetenu.toFixed(2)} kg</Text></View></View><Text style={styles.note}>Poids facturable = le plus élevé entre le poids réel et le poids volumétrique ((L × l × H) / 5000). Ici : {volumetriqueRetenu ? "le poids volumétrique a été retenu." : "le poids réel a été retenu."}</Text></View>
          <View style={styles.footer}><Text style={styles.legal}>Ce bordereau atteste de la prise en charge du colis par SUN EXPRESS pour réexpédition vers les Antilles/Guyane. La valeur déclarée engage la responsabilité de l'expéditeur auprès des services douaniers. Toute réclamation doit être formulée dans les 48h suivant la réception du colis.</Text>{qrCodeDataUrl ? <View style={styles.qr}><Image src={qrCodeDataUrl} style={styles.qrImage} /><Text style={styles.qrLabel}>Scanner pour suivre</Text></View> : null}</View>
        </View>
      </Page>
    </Document>
  );
}
