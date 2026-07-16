import * as React from "react"
import { toast } from "sonner"
import {
  Puzzle,
  Mail,
  Calendar,
  Database,
  Globe,
  Search,
  Sparkles,
  Save,
  Check,
  ArrowRight,
  Star,
  Mic,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { cn } from "@/lib/utils"

const STORE_URL =
  "https://chromewebstore.google.com/detail/kombo-prepare-your-first/djcmkdkjdchgplhaadeffehffgjcbohe"
const RECORDER_URL =
  "https://chromewebstore.google.com/detail/komboai-recorder/fkocennpfikhfaikkgjdfbaoeaniccla"

type TabId = "linkedin" | "gmail" | "calendar" | "crm" | "everywhere"

const COPY = {
  en: {
    title: "Kombo for Chrome",
    description: "Prospect, research, and engage anywhere you already work.",
    eyebrow: "Build pipeline from anywhere",
    heroTitle: "Bring Kombo everywhere you sell",
    heroBody:
      "Pin the Kombo extension and get AI-scored prospect intelligence, verified contact data, and one-click outreach right inside LinkedIn, Gmail, your calendar, and your CRM — without switching tabs.",
    addToChrome: "Add to Chrome — it's free",
    rating: "4.8 on the Chrome Web Store",
    howItWorks: "How it works",
    tabsLabel: "Works where you do",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Calendar",
      crm: "CRM",
      everywhere: "Everywhere",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn & Sales Navigator",
        heading: "Turn any profile into a scored prospect",
        body: "Open the Kombo panel on any LinkedIn profile to see fit score, verified email and direct dial, and the buying signals that matter — then save to a list or start a sequence in one click.",
        cta: "Try it on LinkedIn",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personalize and track from your inbox",
        body: "Pull contact and company insights into the compose window, drop in templates, and track opens, clicks, and replies without leaving Gmail.",
        cta: "Try it in Gmail",
      },
      calendar: {
        eyebrow: "Google Calendar",
        heading: "Walk into every meeting prepared",
        body: "Research your meeting guests with company insights, recent signals, and talking points — surfaced automatically next to each calendar event.",
        cta: "Try it on Calendar",
      },
      crm: {
        eyebrow: "Salesforce & HubSpot",
        heading: "Keep your CRM clean automatically",
        body: "Save contacts and enriched company data straight to your CRM, with activity synced so you cut manual data entry and keep one source of truth.",
        cta: "Connect your CRM",
      },
      everywhere: {
        eyebrow: "Kombo Everywhere",
        heading: "Find new leads on any website",
        body: "Turn any company website into opportunities as you browse — save contacts while you read detailed overviews, insights, and current employees.",
        cta: "Try it on any website",
      },
    },
    panelName: "Kombo",
    match: "Excellent match",
    about: "About",
    aboutBody:
      "Fever is a Madrid-based live-entertainment marketplace. Recently hired 5 SDRs and posted about scaling outbound.",
    save: "Save to list",
    saved: "Saved to list",
    dataLocation: "Madrid, ES",
    dataEmployees: "500–1,000 employees",
    dataRevenue: "$100M–$250M revenue",
    benefitsTitle: "Why reps pin Kombo",
    benefits: [
      {
        title: "Prospect in context",
        body: "Score and qualify the person you're already looking at — no copy-pasting between tabs.",
      },
      {
        title: "Verified data on tap",
        body: "Work emails and direct dials enriched with ~30 data points, the moment you need them.",
      },
      {
        title: "One-click to outreach",
        body: "Save to a list or drop straight into a multi-channel sequence without leaving the page.",
      },
    ],
    recorderEyebrow: "Also from Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Record and transcribe your sales calls across Google Meet, Zoom, and Teams — then get AI coaching scorecards and next steps automatically.",
    recorderPoints: [
      "Auto-join & record meetings",
      "Transcripts + AI call scorecards",
      "Next steps synced to your CRM",
    ],
    addRecorder: "Add Recorder to Chrome",
    ctaTitle: "Add Kombo to Chrome",
    ctaBody: "Install in seconds, pin it to your toolbar, and start building pipeline from anywhere.",
    installToast: "Opening the Chrome Web Store…",
    permanentEverywhere: "Pin Kombo so it's always one click away.",
  },
  es: {
    title: "Kombo para Chrome",
    description: "Prospecta, investiga e interactúa donde ya trabajas.",
    eyebrow: "Construye pipeline desde cualquier lugar",
    heroTitle: "Lleva Kombo a todas partes donde vendes",
    heroBody:
      "Ancla la extensión de Kombo y obtén inteligencia de prospectos puntuada por IA, datos de contacto verificados y contacto en un clic dentro de LinkedIn, Gmail, tu calendario y tu CRM — sin cambiar de pestaña.",
    addToChrome: "Añadir a Chrome — es gratis",
    rating: "4.8 en la Chrome Web Store",
    howItWorks: "Cómo funciona",
    tabsLabel: "Funciona donde trabajas",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Calendario",
      crm: "CRM",
      everywhere: "En todas partes",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn y Sales Navigator",
        heading: "Convierte cualquier perfil en un prospecto puntuado",
        body: "Abre el panel de Kombo en cualquier perfil de LinkedIn para ver el encaje, el email verificado y el teléfono directo, y las señales de compra que importan — y guárdalo en una lista o inicia una secuencia en un clic.",
        cta: "Pruébalo en LinkedIn",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personaliza y haz seguimiento desde tu bandeja",
        body: "Trae datos de contacto y empresa a la ventana de redacción, inserta plantillas y haz seguimiento de aperturas, clics y respuestas sin salir de Gmail.",
        cta: "Pruébalo en Gmail",
      },
      calendar: {
        eyebrow: "Google Calendar",
        heading: "Llega preparado a cada reunión",
        body: "Investiga a los invitados con información de empresa, señales recientes y puntos de conversación — junto a cada evento del calendario.",
        cta: "Pruébalo en el calendario",
      },
      crm: {
        eyebrow: "Salesforce y HubSpot",
        heading: "Mantén tu CRM limpio automáticamente",
        body: "Guarda contactos y datos enriquecidos directamente en tu CRM, con la actividad sincronizada para reducir la entrada manual de datos.",
        cta: "Conecta tu CRM",
      },
      everywhere: {
        eyebrow: "Kombo en todas partes",
        heading: "Encuentra nuevos leads en cualquier web",
        body: "Convierte cualquier web de empresa en oportunidades mientras navegas — guarda contactos mientras lees descripciones, señales y empleados actuales.",
        cta: "Pruébalo en cualquier web",
      },
    },
    panelName: "Kombo",
    match: "Encaje excelente",
    about: "Acerca de",
    aboutBody:
      "Fever es un marketplace de entretenimiento en vivo con sede en Madrid. Contrató 5 SDRs y publicó sobre escalar su outbound.",
    save: "Guardar en lista",
    saved: "Guardado en la lista",
    dataLocation: "Madrid, ES",
    dataEmployees: "500–1.000 empleados",
    dataRevenue: "$100M–$250M de ingresos",
    benefitsTitle: "Por qué los comerciales anclan Kombo",
    benefits: [
      {
        title: "Prospecta en contexto",
        body: "Puntúa y cualifica a la persona que ya estás mirando — sin copiar y pegar entre pestañas.",
      },
      {
        title: "Datos verificados al instante",
        body: "Emails de trabajo y teléfonos directos enriquecidos con ~30 datos, justo cuando los necesitas.",
      },
      {
        title: "Contacto en un clic",
        body: "Guarda en una lista o entra directo en una secuencia multicanal sin salir de la página.",
      },
    ],
    recorderEyebrow: "También de Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Graba y transcribe tus llamadas de ventas en Google Meet, Zoom y Teams — y obtén scorecards de coaching con IA y próximos pasos automáticamente.",
    recorderPoints: [
      "Se une y graba reuniones automáticamente",
      "Transcripciones + scorecards de llamada con IA",
      "Próximos pasos sincronizados con tu CRM",
    ],
    addRecorder: "Añadir Recorder a Chrome",
    ctaTitle: "Añade Kombo a Chrome",
    ctaBody: "Instálalo en segundos, ánclalo a tu barra y empieza a construir pipeline desde cualquier lugar.",
    installToast: "Abriendo la Chrome Web Store…",
    permanentEverywhere: "Ancla Kombo para tenerlo siempre a un clic.",
  },
  it: {
    title: "Kombo per Chrome",
    description: "Prospetta, ricerca e interagisci ovunque tu già lavori.",
    eyebrow: "Costruisci pipeline da qualsiasi luogo",
    heroTitle: "Porta Kombo ovunque tu venda",
    heroBody:
      "Fissa l'estensione Kombo e ottieni intelligence sui prospect con punteggio IA, dati di contatto verificati e outreach in un clic direttamente in LinkedIn, Gmail, il tuo calendario e il tuo CRM — senza cambiare scheda.",
    addToChrome: "Aggiungi a Chrome — è gratis",
    rating: "4.8 sul Chrome Web Store",
    howItWorks: "Come funziona",
    tabsLabel: "Funziona dove lavori",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Calendario",
      crm: "CRM",
      everywhere: "Ovunque",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn e Sales Navigator",
        heading: "Trasforma qualsiasi profilo in un prospect con punteggio",
        body: "Apri il pannello Kombo su qualsiasi profilo LinkedIn per vedere il punteggio di fit, l'email verificata e il numero diretto, e i segnali di acquisto che contano — poi salva in una lista o avvia una sequenza in un clic.",
        cta: "Provalo su LinkedIn",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personalizza e monitora dalla tua casella",
        body: "Porta informazioni su contatti e aziende nella finestra di composizione, inserisci modelli e monitora aperture, clic e risposte senza uscire da Gmail.",
        cta: "Provalo in Gmail",
      },
      calendar: {
        eyebrow: "Google Calendar",
        heading: "Arriva preparato a ogni riunione",
        body: "Ricerca gli invitati alla riunione con informazioni sull'azienda, segnali recenti e spunti di conversazione — mostrati automaticamente accanto a ogni evento del calendario.",
        cta: "Provalo su Calendar",
      },
      crm: {
        eyebrow: "Salesforce e HubSpot",
        heading: "Mantieni il tuo CRM pulito automaticamente",
        body: "Salva contatti e dati aziendali arricchiti direttamente nel tuo CRM, con l'attività sincronizzata per ridurre l'inserimento manuale dei dati e mantenere un'unica fonte di verità.",
        cta: "Collega il tuo CRM",
      },
      everywhere: {
        eyebrow: "Kombo ovunque",
        heading: "Trova nuovi lead su qualsiasi sito web",
        body: "Trasforma qualsiasi sito aziendale in opportunità mentre navighi — salva contatti mentre leggi panoramiche dettagliate, informazioni e dipendenti attuali.",
        cta: "Provalo su qualsiasi sito web",
      },
    },
    panelName: "Kombo",
    match: "Corrispondenza eccellente",
    about: "Informazioni",
    aboutBody:
      "Fever è un marketplace di intrattenimento dal vivo con sede a Madrid. Ha assunto di recente 5 SDR e ha pubblicato un post sulla scalata dell'outbound.",
    save: "Salva in lista",
    saved: "Salvato in lista",
    dataLocation: "Madrid, ES",
    dataEmployees: "500–1.000 dipendenti",
    dataRevenue: "$100M–$250M di fatturato",
    benefitsTitle: "Perché i commerciali fissano Kombo",
    benefits: [
      {
        title: "Prospetta nel contesto",
        body: "Valuta e qualifica la persona che stai già guardando — senza copiare e incollare tra schede.",
      },
      {
        title: "Dati verificati a portata di clic",
        body: "Email di lavoro e numeri diretti arricchiti con ~30 punti dati, nel momento in cui ti servono.",
      },
      {
        title: "Contatto in un clic",
        body: "Salva in una lista o passa direttamente a una sequenza multicanale senza uscire dalla pagina.",
      },
    ],
    recorderEyebrow: "Anche da Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Registra e trascrivi le tue chiamate di vendita su Google Meet, Zoom e Teams — poi ottieni scorecard di coaching con IA e i prossimi passi automaticamente.",
    recorderPoints: [
      "Si unisce e registra le riunioni automaticamente",
      "Trascrizioni + scorecard delle chiamate con IA",
      "Prossimi passi sincronizzati con il tuo CRM",
    ],
    addRecorder: "Aggiungi Recorder a Chrome",
    ctaTitle: "Aggiungi Kombo a Chrome",
    ctaBody: "Installa in pochi secondi, fissalo alla barra degli strumenti e inizia a costruire pipeline da qualsiasi luogo.",
    installToast: "Apertura del Chrome Web Store…",
    permanentEverywhere: "Fissa Kombo così è sempre a un clic di distanza.",
  },
  fr: {
    title: "Kombo pour Chrome",
    description: "Prospectez, recherchez et engagez où que vous travailliez déjà.",
    eyebrow: "Construisez votre pipeline depuis n'importe où",
    heroTitle: "Utilisez Kombo partout où vous vendez",
    heroBody:
      "Épinglez l'extension Kombo et obtenez une intelligence de prospects notée par IA, des données de contact vérifiées et une prise de contact en un clic directement dans LinkedIn, Gmail, votre calendrier et votre CRM — sans changer d'onglet.",
    addToChrome: "Ajouter à Chrome — c'est gratuit",
    rating: "4.8 sur le Chrome Web Store",
    howItWorks: "Comment ça marche",
    tabsLabel: "Fonctionne là où vous travaillez",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Calendrier",
      crm: "CRM",
      everywhere: "Partout",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn et Sales Navigator",
        heading: "Transformez n'importe quel profil en prospect noté",
        body: "Ouvrez le panneau Kombo sur n'importe quel profil LinkedIn pour voir le score d'adéquation, l'email vérifié et la ligne directe, ainsi que les signaux d'achat qui comptent — puis enregistrez dans une liste ou lancez une séquence en un clic.",
        cta: "Essayez sur LinkedIn",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personnalisez et suivez depuis votre boîte de réception",
        body: "Intégrez les informations sur les contacts et les entreprises dans la fenêtre de rédaction, insérez des modèles et suivez les ouvertures, clics et réponses sans quitter Gmail.",
        cta: "Essayez dans Gmail",
      },
      calendar: {
        eyebrow: "Google Agenda",
        heading: "Arrivez préparé à chaque rendez-vous",
        body: "Renseignez-vous sur vos invités avec des informations sur l'entreprise, des signaux récents et des points de discussion — affichés automatiquement à côté de chaque événement du calendrier.",
        cta: "Essayez sur Agenda",
      },
      crm: {
        eyebrow: "Salesforce et HubSpot",
        heading: "Gardez votre CRM propre automatiquement",
        body: "Enregistrez les contacts et les données d'entreprise enrichies directement dans votre CRM, avec l'activité synchronisée pour réduire la saisie manuelle et garder une seule source de vérité.",
        cta: "Connectez votre CRM",
      },
      everywhere: {
        eyebrow: "Kombo partout",
        heading: "Trouvez de nouveaux leads sur n'importe quel site",
        body: "Transformez n'importe quel site d'entreprise en opportunités pendant votre navigation — enregistrez des contacts en lisant des aperçus détaillés, des signaux et les employés actuels.",
        cta: "Essayez sur n'importe quel site",
      },
    },
    panelName: "Kombo",
    match: "Excellente correspondance",
    about: "À propos",
    aboutBody:
      "Fever est une marketplace de divertissement en direct basée à Madrid. A récemment recruté 5 SDR et publié un post sur le développement de son outbound.",
    save: "Enregistrer dans une liste",
    saved: "Enregistré dans la liste",
    dataLocation: "Madrid, ES",
    dataEmployees: "500 à 1 000 employés",
    dataRevenue: "$100M–$250M de revenus",
    benefitsTitle: "Pourquoi les commerciaux épinglent Kombo",
    benefits: [
      {
        title: "Prospection en contexte",
        body: "Notez et qualifiez la personne que vous regardez déjà — sans copier-coller entre les onglets.",
      },
      {
        title: "Données vérifiées à portée de clic",
        body: "Emails professionnels et lignes directes enrichis avec ~30 points de données, dès que vous en avez besoin.",
      },
      {
        title: "Prise de contact en un clic",
        body: "Enregistrez dans une liste ou passez directement à une séquence multicanale sans quitter la page.",
      },
    ],
    recorderEyebrow: "Également de Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Enregistrez et transcrivez vos appels commerciaux sur Google Meet, Zoom et Teams — puis obtenez automatiquement des bilans de coaching par IA et les prochaines étapes.",
    recorderPoints: [
      "Rejoint et enregistre les réunions automatiquement",
      "Transcriptions + bilans d'appels par IA",
      "Prochaines étapes synchronisées avec votre CRM",
    ],
    addRecorder: "Ajouter Recorder à Chrome",
    ctaTitle: "Ajoutez Kombo à Chrome",
    ctaBody: "Installez en quelques secondes, épinglez-le à votre barre d'outils et commencez à construire votre pipeline depuis n'importe où.",
    installToast: "Ouverture du Chrome Web Store…",
    permanentEverywhere: "Épinglez Kombo pour l'avoir toujours à portée de clic.",
  },
  de: {
    title: "Kombo für Chrome",
    description: "Prospecting, Recherche und Ansprache, überall wo du bereits arbeitest.",
    eyebrow: "Baue Pipeline von überall auf",
    heroTitle: "Bring Kombo überall hin, wo du verkaufst",
    heroBody:
      "Pinne die Kombo-Erweiterung und erhalte KI-bewertete Prospect-Insights, verifizierte Kontaktdaten und Ansprache mit einem Klick direkt in LinkedIn, Gmail, deinem Kalender und deinem CRM — ohne den Tab zu wechseln.",
    addToChrome: "Zu Chrome hinzufügen — kostenlos",
    rating: "4,8 im Chrome Web Store",
    howItWorks: "So funktioniert's",
    tabsLabel: "Funktioniert, wo du arbeitest",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Kalender",
      crm: "CRM",
      everywhere: "Überall",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn & Sales Navigator",
        heading: "Verwandle jedes Profil in einen bewerteten Prospect",
        body: "Öffne das Kombo-Panel auf jedem LinkedIn-Profil, um Fit Score, verifizierte E-Mail und Durchwahl sowie relevante Kaufsignale zu sehen — dann in einer Liste speichern oder mit einem Klick eine Sequenz starten.",
        cta: "Auf LinkedIn ausprobieren",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personalisieren und tracken direkt aus deinem Posteingang",
        body: "Hole Kontakt- und Unternehmens-Insights ins Compose-Fenster, füge Vorlagen ein und verfolge Öffnungen, Klicks und Antworten, ohne Gmail zu verlassen.",
        cta: "In Gmail ausprobieren",
      },
      calendar: {
        eyebrow: "Google Kalender",
        heading: "Gut vorbereitet in jedes Meeting",
        body: "Recherchiere deine Meeting-Gäste mit Unternehmens-Insights, aktuellen Signalen und Gesprächspunkten — automatisch neben jedem Kalendertermin angezeigt.",
        cta: "Im Kalender ausprobieren",
      },
      crm: {
        eyebrow: "Salesforce & HubSpot",
        heading: "Halte dein CRM automatisch sauber",
        body: "Speichere Kontakte und angereicherte Unternehmensdaten direkt in deinem CRM, mit synchronisierten Aktivitäten, damit du manuelle Dateneingabe reduzierst und eine einzige Quelle der Wahrheit behältst.",
        cta: "Verbinde dein CRM",
      },
      everywhere: {
        eyebrow: "Kombo überall",
        heading: "Finde neue Leads auf jeder Website",
        body: "Verwandle jede Unternehmenswebsite beim Browsen in Chancen — speichere Kontakte, während du detaillierte Übersichten, Insights und aktuelle Mitarbeiter liest.",
        cta: "Auf jeder Website ausprobieren",
      },
    },
    panelName: "Kombo",
    match: "Ausgezeichnete Übereinstimmung",
    about: "Über",
    aboutBody:
      "Fever ist ein Live-Entertainment-Marktplatz mit Sitz in Madrid. Hat kürzlich 5 SDRs eingestellt und über die Skalierung von Outbound gepostet.",
    save: "In Liste speichern",
    saved: "In Liste gespeichert",
    dataLocation: "Madrid, ES",
    dataEmployees: "500–1.000 Mitarbeitende",
    dataRevenue: "$100M–$250M Umsatz",
    benefitsTitle: "Warum Vertriebler Kombo anpinnen",
    benefits: [
      {
        title: "Prospecting im Kontext",
        body: "Bewerte und qualifiziere die Person, die du dir gerade ansiehst — ohne zwischen Tabs zu kopieren und einzufügen.",
      },
      {
        title: "Verifizierte Daten auf Knopfdruck",
        body: "Geschäftliche E-Mails und Durchwahlen, angereichert mit ~30 Datenpunkten, genau dann, wenn du sie brauchst.",
      },
      {
        title: "Mit einem Klick zur Ansprache",
        body: "Speichere in einer Liste oder starte direkt eine Multichannel-Sequenz, ohne die Seite zu verlassen.",
      },
    ],
    recorderEyebrow: "Auch von Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Zeichne deine Vertriebsanrufe über Google Meet, Zoom und Teams auf und transkribiere sie — und erhalte automatisch KI-Coaching-Scorecards und nächste Schritte.",
    recorderPoints: [
      "Tritt Meetings automatisch bei und zeichnet sie auf",
      "Transkripte + KI-Anruf-Scorecards",
      "Nächste Schritte, synchronisiert mit deinem CRM",
    ],
    addRecorder: "Recorder zu Chrome hinzufügen",
    ctaTitle: "Füge Kombo zu Chrome hinzu",
    ctaBody: "In Sekunden installieren, an deine Symbolleiste anpinnen und von überall Pipeline aufbauen.",
    installToast: "Chrome Web Store wird geöffnet…",
    permanentEverywhere: "Pinne Kombo an, damit es immer nur einen Klick entfernt ist.",
  },
  pt: {
    title: "Kombo para Chrome",
    description: "Prospete, pesquise e interaja onde já trabalha.",
    eyebrow: "Construa pipeline a partir de qualquer lugar",
    heroTitle: "Leve o Kombo para todo o lado onde vende",
    heroBody:
      "Fixe a extensão Kombo e obtenha inteligência de prospects pontuada por IA, dados de contacto verificados e contacto num clique dentro do LinkedIn, Gmail, do seu calendário e do seu CRM — sem mudar de separador.",
    addToChrome: "Adicionar ao Chrome — é grátis",
    rating: "4,8 na Chrome Web Store",
    howItWorks: "Como funciona",
    tabsLabel: "Funciona onde trabalha",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Calendário",
      crm: "CRM",
      everywhere: "Em todo o lado",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn e Sales Navigator",
        heading: "Transforme qualquer perfil num prospect pontuado",
        body: "Abra o painel Kombo em qualquer perfil do LinkedIn para ver a pontuação de fit, o email verificado e o telefone direto, e os sinais de compra que importam — depois guarde numa lista ou inicie uma sequência num clique.",
        cta: "Experimente no LinkedIn",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personalize e acompanhe a partir da sua caixa de entrada",
        body: "Traga informações de contactos e empresas para a janela de composição, insira modelos e acompanhe aberturas, cliques e respostas sem sair do Gmail.",
        cta: "Experimente no Gmail",
      },
      calendar: {
        eyebrow: "Google Calendar",
        heading: "Chegue preparado a cada reunião",
        body: "Pesquise os convidados da reunião com informações da empresa, sinais recentes e pontos de conversa — apresentados automaticamente junto a cada evento do calendário.",
        cta: "Experimente no Calendar",
      },
      crm: {
        eyebrow: "Salesforce e HubSpot",
        heading: "Mantenha o seu CRM limpo automaticamente",
        body: "Guarde contactos e dados de empresas enriquecidos diretamente no seu CRM, com a atividade sincronizada para reduzir a introdução manual de dados e manter uma única fonte de verdade.",
        cta: "Ligue o seu CRM",
      },
      everywhere: {
        eyebrow: "Kombo em todo o lado",
        heading: "Encontre novos leads em qualquer site",
        body: "Transforme qualquer site de empresa em oportunidades enquanto navega — guarde contactos enquanto lê descrições detalhadas, sinais e colaboradores atuais.",
        cta: "Experimente em qualquer site",
      },
    },
    panelName: "Kombo",
    match: "Correspondência excelente",
    about: "Acerca de",
    aboutBody:
      "A Fever é um marketplace de entretenimento ao vivo sediado em Madrid. Contratou recentemente 5 SDRs e publicou sobre o crescimento do outbound.",
    save: "Guardar na lista",
    saved: "Guardado na lista",
    dataLocation: "Madrid, ES",
    dataEmployees: "500–1.000 colaboradores",
    dataRevenue: "$100M–$250M de receita",
    benefitsTitle: "Porque é que os comerciais fixam o Kombo",
    benefits: [
      {
        title: "Prospete em contexto",
        body: "Pontue e qualifique a pessoa que já está a ver — sem copiar e colar entre separadores.",
      },
      {
        title: "Dados verificados ao alcance de um clique",
        body: "Emails profissionais e telefones diretos enriquecidos com ~30 pontos de dados, no momento em que precisa deles.",
      },
      {
        title: "Contacto num clique",
        body: "Guarde numa lista ou avance diretamente para uma sequência multicanal sem sair da página.",
      },
    ],
    recorderEyebrow: "Também do Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Grave e transcreva as suas chamadas de vendas no Google Meet, Zoom e Teams — e receba automaticamente scorecards de coaching com IA e os próximos passos.",
    recorderPoints: [
      "Entra e grava reuniões automaticamente",
      "Transcrições + scorecards de chamadas com IA",
      "Próximos passos sincronizados com o seu CRM",
    ],
    addRecorder: "Adicionar o Recorder ao Chrome",
    ctaTitle: "Adicione o Kombo ao Chrome",
    ctaBody: "Instale em segundos, fixe-o na sua barra de ferramentas e comece a construir pipeline a partir de qualquer lugar.",
    installToast: "A abrir a Chrome Web Store…",
    permanentEverywhere: "Fixe o Kombo para o ter sempre a um clique de distância.",
  },
  pt_BR: {
    title: "Kombo para Chrome",
    description: "Prospecte, pesquise e interaja onde você já trabalha.",
    eyebrow: "Construa pipeline de qualquer lugar",
    heroTitle: "Leve o Kombo para todo lugar onde você vende",
    heroBody:
      "Fixe a extensão Kombo e obtenha inteligência de prospects com pontuação por IA, dados de contato verificados e contato em um clique dentro do LinkedIn, Gmail, sua agenda e seu CRM — sem trocar de aba.",
    addToChrome: "Adicionar ao Chrome — é grátis",
    rating: "4,8 na Chrome Web Store",
    howItWorks: "Como funciona",
    tabsLabel: "Funciona onde você trabalha",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Agenda",
      crm: "CRM",
      everywhere: "Em todo lugar",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn e Sales Navigator",
        heading: "Transforme qualquer perfil em um prospect pontuado",
        body: "Abra o painel Kombo em qualquer perfil do LinkedIn para ver a pontuação de fit, o email verificado e o telefone direto, e os sinais de compra que importam — depois salve em uma lista ou inicie uma sequência em um clique.",
        cta: "Experimente no LinkedIn",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personalize e acompanhe direto da sua caixa de entrada",
        body: "Traga informações de contatos e empresas para a janela de redação, insira modelos e acompanhe aberturas, cliques e respostas sem sair do Gmail.",
        cta: "Experimente no Gmail",
      },
      calendar: {
        eyebrow: "Google Agenda",
        heading: "Chegue preparado em cada reunião",
        body: "Pesquise os convidados da reunião com informações da empresa, sinais recentes e pontos de conversa — exibidos automaticamente ao lado de cada evento da agenda.",
        cta: "Experimente na Agenda",
      },
      crm: {
        eyebrow: "Salesforce e HubSpot",
        heading: "Mantenha seu CRM limpo automaticamente",
        body: "Salve contatos e dados de empresas enriquecidos direto no seu CRM, com a atividade sincronizada para reduzir a entrada manual de dados e manter uma única fonte de verdade.",
        cta: "Conecte seu CRM",
      },
      everywhere: {
        eyebrow: "Kombo em todo lugar",
        heading: "Encontre novos leads em qualquer site",
        body: "Transforme qualquer site de empresa em oportunidades enquanto navega — salve contatos enquanto lê descrições detalhadas, sinais e funcionários atuais.",
        cta: "Experimente em qualquer site",
      },
    },
    panelName: "Kombo",
    match: "Correspondência excelente",
    about: "Sobre",
    aboutBody:
      "A Fever é um marketplace de entretenimento ao vivo sediado em Madrid. Contratou recentemente 5 SDRs e postou sobre o crescimento do outbound.",
    save: "Salvar na lista",
    saved: "Salvo na lista",
    dataLocation: "Madrid, ES",
    dataEmployees: "500–1.000 funcionários",
    dataRevenue: "$100M–$250M de receita",
    benefitsTitle: "Por que os vendedores fixam o Kombo",
    benefits: [
      {
        title: "Prospecção em contexto",
        body: "Pontue e qualifique a pessoa que você já está vendo — sem copiar e colar entre abas.",
      },
      {
        title: "Dados verificados na palma da mão",
        body: "Emails profissionais e telefones diretos enriquecidos com ~30 pontos de dados, no momento em que você precisa.",
      },
      {
        title: "Contato em um clique",
        body: "Salve em uma lista ou vá direto para uma sequência multicanal sem sair da página.",
      },
    ],
    recorderEyebrow: "Também do Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Grave e transcreva suas chamadas de vendas no Google Meet, Zoom e Teams — e receba scorecards de coaching com IA e próximos passos automaticamente.",
    recorderPoints: [
      "Entra e grava reuniões automaticamente",
      "Transcrições + scorecards de chamadas com IA",
      "Próximos passos sincronizados com seu CRM",
    ],
    addRecorder: "Adicionar o Recorder ao Chrome",
    ctaTitle: "Adicione o Kombo ao Chrome",
    ctaBody: "Instale em segundos, fixe na sua barra de ferramentas e comece a construir pipeline de qualquer lugar.",
    installToast: "Abrindo a Chrome Web Store…",
    permanentEverywhere: "Fixe o Kombo para ter sempre a um clique de distância.",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

const TABS: { id: TabId; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "linkedin", icon: LinkedinIcon },
  { id: "gmail", icon: Mail },
  { id: "calendar", icon: Calendar },
  { id: "crm", icon: Database },
  { id: "everywhere", icon: Globe },
]

export default function Extension() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [tab, setTab] = React.useState<TabId>("linkedin")
  const scene = c.scenes[tab]

  function install() {
    toast.success(c.installToast)
    window.open(STORE_URL, "_blank", "noreferrer")
  }
  function installRecorder() {
    toast.success(c.installToast)
    window.open(RECORDER_URL, "_blank", "noreferrer")
  }

  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />

      {/* Hero */}
      <Card className="from-primary/[0.06] to-card mb-8 items-center gap-6 overflow-hidden bg-gradient-to-br p-8 text-center md:p-12">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          {c.eyebrow}
        </p>
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {c.heroTitle}
        </h2>
        <p className="text-muted-foreground max-w-2xl text-pretty">{c.heroBody}</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button variant="volt" size="lg" onClick={install}>
            <Puzzle className="size-4" />
            {c.addToChrome}
          </Button>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
            <Star className="size-4 fill-chart-4 text-chart-4" />
            {c.rating}
          </span>
        </div>
      </Card>

      {/* Platform tabs */}
      <p className="text-muted-foreground mb-3 text-center text-sm font-medium tracking-wide uppercase">
        {c.tabsLabel}
      </p>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {TABS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "border-primary bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
            {c.tabs[id]}
          </button>
        ))}
      </div>

      {/* Feature scene */}
      <Card className="mb-8 grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
        <div className="space-y-4">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            {scene.eyebrow}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight">{scene.heading}</h3>
          <p className="text-muted-foreground text-pretty">{scene.body}</p>
          <Button variant="secondary" onClick={install}>
            {scene.cta}
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <ExtensionMock c={c} tab={tab} />
      </Card>

      {/* Benefits */}
      <h3 className="mb-4 text-center text-lg font-semibold">{c.benefitsTitle}</h3>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {c.benefits.map((b: { title: string; body: string }, i: number) => {
          const Icon = [Search, Sparkles, Save][i]
          return (
            <Card key={b.title} className="gap-2 p-5">
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <Icon className="size-4" />
              </span>
              <p className="mt-1 font-semibold">{b.title}</p>
              <p className="text-muted-foreground text-sm">{b.body}</p>
            </Card>
          )
        })}
      </div>

      {/* Second extension: Recorder */}
      <Card className="mb-8 grid items-center gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
        <div className="space-y-3">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            {c.recorderEyebrow}
          </p>
          <div className="flex items-center gap-2">
            <span className="bg-chart-5/15 text-chart-5 flex size-9 items-center justify-center rounded-lg">
              <Mic className="size-5" />
            </span>
            <h3 className="text-xl font-semibold tracking-tight">{c.recorderTitle}</h3>
            <Badge variant="secondary" className="font-normal">2</Badge>
          </div>
          <p className="text-muted-foreground max-w-xl text-pretty">{c.recorderBody}</p>
          <ul className="grid gap-1.5 sm:grid-cols-3">
            {c.recorderPoints.map((p: string) => (
              <li key={p} className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Check className="text-chart-1 size-3.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="secondary" size="lg" onClick={installRecorder} className="md:self-center">
          <Mic className="size-4" />
          {c.addRecorder}
        </Button>
      </Card>

      {/* Final CTA */}
      <Card className="bg-sidebar text-sidebar-foreground items-center gap-4 p-8 text-center md:p-12">
        <span className="bg-volt/15 text-volt flex size-12 items-center justify-center rounded-xl">
          <Puzzle className="size-6" />
        </span>
        <h3 className="text-2xl font-bold tracking-tight">{c.ctaTitle}</h3>
        <p className="text-sidebar-foreground/70 max-w-xl">{c.ctaBody}</p>
        <Button variant="volt" size="lg" onClick={install}>
          <Puzzle className="size-4" />
          {c.addToChrome}
        </Button>
      </Card>
    </Page>
  )
}

function ExtensionMock({ c, tab }: { c: Copy; tab: TabId }) {
  const [saved, setSaved] = React.useState(false)
  const TabIcon = TABS.find((t) => t.id === tab)?.icon ?? Globe

  return (
    <div className="bg-muted/40 relative rounded-xl border p-4 sm:p-6">
      {/* faux browser chrome */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-yellow-400/70" />
        <span className="size-2.5 rounded-full bg-green-400/70" />
        <span className="text-muted-foreground ml-2 inline-flex items-center gap-1.5 text-xs">
          <TabIcon className="size-3.5" />
          {c.tabs[tab]}
        </span>
      </div>

      {/* Kombo panel */}
      <div className="bg-card mx-auto max-w-xs rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <span className="bg-primary/15 text-primary flex size-5 items-center justify-center rounded">
            <Sparkles className="size-3" />
          </span>
          <span className="text-sm font-semibold">{c.panelName}</span>
        </div>
        <div className="space-y-3 p-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "#E5006D" }}
            >
              F
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Sarah Chen · Fever</p>
              <p className="text-muted-foreground truncate text-xs">VP of Sales</p>
            </div>
          </div>

          <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
            <span className="bg-chart-1 size-1.5 rounded-full" />
            92 · {c.match}
          </Badge>

          <div className="text-muted-foreground space-y-1 text-xs">
            <p>📍 {c.dataLocation}</p>
            <p>👥 {c.dataEmployees}</p>
            <p>💰 {c.dataRevenue}</p>
          </div>

          <Button
            size="sm"
            variant={saved ? "secondary" : "volt"}
            className="w-full"
            onClick={() => setSaved(true)}
          >
            {saved ? (
              <>
                <Check className="size-4" />
                {c.saved}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {c.save}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
