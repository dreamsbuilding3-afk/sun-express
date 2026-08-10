import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Bordereau } from "@/types/bordereau";

// Charte graphique exacte Sun Express
const COULEURS = {
  primaire: "#8B2613",
  fond: "#FDFBF7",
  carte: "#F4EBE2",
  texte: "#2C1A14",
  blanc: "#FFFFFF",
  bordure: "#E4D5C7",
  gris: "#7A6A60",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COULEURS.fond,
    fontSize: 10,
    color: COULEURS.texte,
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: COULEURS.primaire,
    color: COULEURS.blanc,
    paddingVertical: 22,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitre: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  headerSousTitre: {
    fontSize: 9,
    marginTop: 4,
    color: "#F4D9CF",
  },
  headerNumeroBloc: {
    alignItems: "flex-end",
  },
  headerNumeroLabel: {
    fontSize: 7,
    color: "#F4D9CF",
    letterSpacing: 1,
  },
  headerNumeroValeur: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  headerDate: {
    fontSize: 8,
    color: "#F4D9CF",
    marginTop: 6,
  },
  corps: {
    padding: 28,
  },
  ligneAdresses: {
    flexDirection: "row",
    marginBottom: 16,
  },
  carteAdresse: {
    flex: 1,
    backgroundColor: COULEURS.carte,
    borderRadius: 6,
    padding: 12,
  },
  espaceurH: {
    width: 12,
  },
  titreSection: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COULEURS.primaire,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  texteAdresseNom: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  texteAdresseLigne: {
    fontSize: 9,
    marginBottom: 2,
    lineHeight: 1.4,
    color: COULEURS.texte,
  },
  bloc: {
    marginBottom: 16,
  },
  tableau: {
    borderWidth: 1,
    borderColor: COULEURS.primaire,
    borderRadius: 4,
  },
  ligneTableau: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  ligneTableauFin: {
    flexDirection: "row",
  },
  enteteTableau: {
    backgroundColor: COULEURS.primaire,
  },
  celluleEntete: {
    color: COULEURS.blanc,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    padding: 7,
    flex: 1,
  },
  cellule: {
    fontSize: 9,
    padding: 7,
    flex: 1,
  },
  celluleRetenue: {
    fontSize: 9,
    padding: 7,
    flex: 1,
    backgroundColor: COULEURS.carte,
    fontFamily: "Helvetica-Bold",
    color: COULEURS.primaire,
  },
  noteRetenue: {
    fontSize: 7,
    color: COULEURS.gris,
    marginTop: 4,
  },
  piedPage: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COULEURS.bordure,
  },
  qrBloc: {
    alignItems: "center",
  },
  qrImage: {
    width: 72,
    height: 72,
  },
  qrLegende: {
    fontSize: 6,
    color: COULEURS.gris,
    marginTop: 4,
  },
  mentionsLegales: {
    fontSize: 7,
    color: COULEURS.gris,
    maxWidth: 340,
    lineHeight: 1.5,
  },
});

interface BordereauPDFProps {
  bordereau: Bordereau;
  /** Data URL (base64) du QR code de suivi, généré via lib/qrcode.ts */
  qrCodeDataUrl?: string;
}

export default function BordereauPDF({
  bordereau,
  qrCodeDataUrl,
}: BordereauPDFProps) {
  const {
    expediteur,
    destinataire,
    declaration,
    dimensions,
    poidsVolumetrique,
    poidsRetenu,
  } = bordereau;

  const poidsVolumetriqueRetenu = poidsRetenu === poidsVolumetrique;

  return (
    <Document title={`Bordereau Sun Express ${bordereau.numero}`}>
      <Page size="A4" style={styles.page}>
        {/* En-tête terracotta */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitre}>SUN EXPRESS</Text>
            <Text style={styles.headerSousTitre}>
              Réexpédition de colis — France vers Antilles / Guyane
            </Text>
          </View>
          <View style={styles.headerNumeroBloc}>
            <Text style={styles.headerNumeroLabel}>BORDEREAU N°</Text>
            <Text style={styles.headerNumeroValeur}>{bordereau.numero}</Text>
            <Text style={styles.headerDate}>{bordereau.dateCreation}</Text>
          </View>
        </View>

        <View style={styles.corps}>
          {/* Adresses expéditeur / destinataire */}
          <View style={styles.ligneAdresses}>
            <View style={styles.carteAdresse}>
              <Text style={styles.titreSection}>Expéditeur</Text>
              <Text style={styles.texteAdresseNom}>{expediteur.nom}</Text>
              <Text style={styles.texteAdresseLigne}>{expediteur.rue}</Text>
              <Text style={styles.texteAdresseLigne}>
                {expediteur.codePostal} {expediteur.ville}
              </Text>
              <Text style={styles.texteAdresseLigne}>{expediteur.pays}</Text>
              <Text style={styles.texteAdresseLigne}>{expediteur.telephone}</Text>
            </View>
            <View style={styles.espaceurH} />
            <View style={styles.carteAdresse}>
              <Text style={styles.titreSection}>Destinataire</Text>
              <Text style={styles.texteAdresseNom}>
                {destinataire.prenom} {destinataire.nom}
              </Text>
              <Text style={styles.texteAdresseLigne}>{destinataire.rue}</Text>
              <Text style={styles.texteAdresseLigne}>
                {destinataire.codePostal} {destinataire.ville}
              </Text>
              <Text style={styles.texteAdresseLigne}>{destinataire.territoire}</Text>
              <Text style={styles.texteAdresseLigne}>
                WhatsApp : {destinataire.indicatifPays} {destinataire.telephoneWhatsapp}
              </Text>
            </View>
          </View>

          {/* Déclaration douanière */}
          <View style={styles.bloc}>
            <Text style={styles.titreSection}>Déclaration douanière</Text>
            <View style={styles.tableau}>
              <View style={[styles.ligneTableau, styles.enteteTableau]}>
                <Text style={[styles.celluleEntete, { flex: 2 }]}>
                  Description des articles
                </Text>
                <Text style={styles.celluleEntete}>Nb colis</Text>
                <Text style={styles.celluleEntete}>Valeur déclarée</Text>
              </View>
              <View style={styles.ligneTableauFin}>
                <Text style={[styles.cellule, { flex: 2 }]}>
                  {declaration.description}
                </Text>
                <Text style={styles.cellule}>{declaration.nombreColis}</Text>
                <Text style={styles.cellule}>
                  {declaration.valeurDeclaree.toFixed(2)} €
                </Text>
              </View>
            </View>
          </View>

          {/* Détail du poids */}
          <View style={styles.bloc}>
            <Text style={styles.titreSection}>Poids réel vs poids volumétrique</Text>
            <View style={styles.tableau}>
              <View style={[styles.ligneTableau, styles.enteteTableau]}>
                <Text style={styles.celluleEntete}>Poids réel</Text>
                <Text style={styles.celluleEntete}>Dimensions (L × l × H)</Text>
                <Text style={styles.celluleEntete}>Poids volumétrique</Text>
                <Text style={styles.celluleEntete}>Poids retenu</Text>
              </View>
              <View style={styles.ligneTableauFin}>
                <Text style={styles.cellule}>{dimensions.poidsReel.toFixed(2)} kg</Text>
                <Text style={styles.cellule}>
                  {dimensions.longueur} × {dimensions.largeur} × {dimensions.hauteur} cm
                </Text>
                <Text style={styles.cellule}>{poidsVolumetrique.toFixed(2)} kg</Text>
                <Text style={styles.celluleRetenue}>{poidsRetenu.toFixed(2)} kg</Text>
              </View>
            </View>
            <Text style={styles.noteRetenue}>
              Poids facturable = le plus élevé entre le poids réel et le poids
              volumétrique ((L × l × H) / 5000). Ici :{" "}
              {poidsVolumetriqueRetenu
                ? "le poids volumétrique a été retenu."
                : "le poids réel a été retenu."}
            </Text>
          </View>

          {/* QR Code + mentions légales */}
          <View style={styles.piedPage}>
            <Text style={styles.mentionsLegales}>
              Ce bordereau atteste de la prise en charge du colis par SUN EXPRESS
              pour réexpédition vers les Antilles/Guyane. La valeur déclarée
              engage la responsabilité de l'expéditeur auprès des services
              douaniers. Toute réclamation doit être formulée dans les 48h
              suivant la réception du colis. SUN EXPRESS — Service de
              réexpédition et de vente d'articles de marque.
            </Text>
            {qrCodeDataUrl ? (
              <View style={styles.qrBloc}>
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
                <Text style={styles.qrLegende}>Scanner pour suivre</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}

