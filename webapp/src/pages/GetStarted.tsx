import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Building2,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Plus,
  Target,
  Trash2,
  Users,
  Search,
  Send,
  Inbox,
  Mail,
  Briefcase,
  GraduationCap,
  Puzzle,
  Plug,
  FolderKanban,
  Sparkles,
  ArrowRight,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page } from "@/components/layout/Page"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import kaiUrl from "@/assets/kai-pleased.png"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSetup, type SetupTaskId } from "@/lib/setup"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS = [
  "VP of Sales",
  "Head of Sales",
  "RevOps",
  "Account Executive",
  "SDR / BDR",
]

interface ChecklistTask {
  id: SetupTaskId
  icon: React.ComponentType<{ className?: string }>
}

const CHECKLIST: ChecklistTask[] = [
  { id: "crm", icon: Building2 },
  { id: "linkedin", icon: LinkedinIcon },
  { id: "team", icon: Users },
  { id: "profile", icon: Target },
  { id: "links", icon: LinkIcon },
]

// The product's capabilities, surfaced as an "explore what you can do" grid —
// each tile deep-links into the feature so onboarding doubles as a tour.
interface Capability {
  key: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
}

const CAPABILITIES: Capability[] = [
  { key: "search", to: "/search", icon: Search, tint: "bg-primary/10 text-primary" },
  { key: "lists", to: "/lists", icon: FolderKanban, tint: "bg-chart-3/15 text-chart-3" },
  { key: "enrich", to: "/people", icon: Sparkles, tint: "bg-chart-5/15 text-chart-5" },
  { key: "campaigns", to: "/campaigns", icon: Send, tint: "bg-primary/10 text-primary" },
  { key: "inbox", to: "/inbox", icon: Inbox, tint: "bg-chart-1/15 text-chart-1" },
  { key: "templates", to: "/templates", icon: Mail, tint: "bg-chart-4/15 text-chart-4" },
  { key: "deals", to: "/deals", icon: Briefcase, tint: "bg-primary/10 text-primary" },
  { key: "coach", to: "/coach", icon: GraduationCap, tint: "bg-chart-5/15 text-chart-5" },
  { key: "extension", to: "/extension", icon: Puzzle, tint: "bg-chart-4/15 text-chart-4" },
  { key: "integrations", to: "/integrations", icon: Plug, tint: "bg-chart-3/15 text-chart-3" },
]

const COPY = {
  en: {
    title: "Get started",
    description:
      "Finish setting up your workspace to get the most out of Kombo.",
    guidedTitle: "New here? Take the guided setup",
    guidedDesc:
      "A 2-minute walkthrough to tailor Kombo to your team, CRM, and tools.",
    guidedCta: "Start onboarding",
    saved: "Saved",
    linkAdded: "Link added",
    completeCount: (done: number, total: number) =>
      `${done} of ${total} complete`,
    allSet: "You're all set 🎉",
    exploreTitle: "Explore Kombo",
    exploreDesc: "Everything you can do — jump in and try a capability.",
    open: "Open",
    features: {
      search: {
        title: "Find Prospects",
        description:
          "Find your ideal customers with AI across millions of prospects & companies.",
      },
      lists: {
        title: "Lists & segments",
        description:
          "Group prospects and accounts into lists you can enrich and enroll.",
      },
      enrich: {
        title: "Data enrichment",
        description: "Reveal verified emails and direct dials for any contact.",
      },
      campaigns: {
        title: "Sequences & campaigns",
        description:
          "Run multi-step outreach across email and LinkedIn that auto-pauses on a reply.",
      },
      inbox: {
        title: "Unified inbox",
        description:
          "Reply to every channel in one place, with AI-drafted responses.",
      },
      templates: {
        title: "Message templates",
        description: "Save your best-performing copy and personalize it at scale.",
      },
      deals: {
        title: "Pipeline & deals",
        description: "Track prospects from interested to won across outcome stages.",
      },
      coach: {
        title: "Call coaching",
        description: "Score calls and get actionable coaching to win more deals.",
      },
      extension: {
        title: "Chrome extension",
        description: "Prospect and enrich directly on LinkedIn and any website.",
      },
      integrations: {
        title: "CRM & integrations",
        description: "Sync two-way with HubSpot, Salesforce, and your stack.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Setup checklist",
    setupChecklistDesc: "Knock these out to unlock the full Kombo experience.",
    roleGoals: "Your role & goals",
    roleGoalsDesc: "We use this to tailor your dashboards and AI suggestions.",
    role: "Role",
    selectRole: "Select your role",
    goals: "Goals",
    goalsPlaceholder:
      "e.g. Book 30 qualified meetings/month, grow pipeline 2x",
    save: "Save",
    quickLinks: "Quick links",
    quickLinksDesc: "Pin the tools and resources you reach for most.",
    removeLink: (label: string) => `Remove ${label}`,
    label: "Label",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://example.com",
    addLink: "Add link",
    linkedInConnected: "LinkedIn connected",
    connected: "Connected",
    connect: "Connect",
    done: "Done",
    inviteTeam: "Invite team",
    markDone: "Mark done",
    tasks: {
      crm: {
        title: "Connect your CRM",
        description: "Sync prospects, activities, and deals two-way.",
      },
      linkedin: {
        title: "Connect LinkedIn",
        description: "Enrich profiles and send outreach from Kombo.",
      },
      team: {
        title: "Invite your team",
        description: "Collaborate on pipeline and share templates.",
      },
      profile: {
        title: "Set your role & goals",
        description: "Tailor dashboards and AI recommendations.",
      },
      links: {
        title: "Add quick links",
        description: "Pin the tools you use every day.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
  es: {
    title: "Primeros pasos",
    description:
      "Termina de configurar tu espacio de trabajo para sacarle el máximo partido a Kombo.",
    guidedTitle: "¿Nuevo por aquí? Haz la configuración guiada",
    guidedDesc:
      "Un recorrido de 2 minutos para adaptar Kombo a tu equipo, CRM y herramientas.",
    guidedCta: "Empezar onboarding",
    saved: "Guardado",
    linkAdded: "Enlace añadido",
    completeCount: (done: number, total: number) =>
      `${done} de ${total} completados`,
    allSet: "¡Todo listo! 🎉",
    exploreTitle: "Explora Kombo",
    exploreDesc: "Todo lo que puedes hacer — entra y prueba una capacidad.",
    open: "Abrir",
    features: {
      search: {
        title: "Buscar prospectos",
        description:
          "Encuentra a tus clientes ideales con IA entre millones de prospectos y empresas.",
      },
      lists: {
        title: "Listas y segmentos",
        description:
          "Agrupa prospectos y cuentas en listas que puedes enriquecer e inscribir.",
      },
      enrich: {
        title: "Enriquecimiento de datos",
        description: "Revela correos verificados y teléfonos directos de cualquier contacto.",
      },
      campaigns: {
        title: "Secuencias y campañas",
        description:
          "Lanza outreach multipaso por correo y LinkedIn que se pausa al recibir respuesta.",
      },
      inbox: {
        title: "Bandeja unificada",
        description:
          "Responde a todos los canales en un solo lugar, con respuestas redactadas por IA.",
      },
      templates: {
        title: "Plantillas de mensajes",
        description: "Guarda tus textos de mayor rendimiento y personalízalos a escala.",
      },
      deals: {
        title: "Pipeline y negocios",
        description: "Sigue a los prospectos desde interesado hasta ganado por etapas.",
      },
      coach: {
        title: "Coaching de llamadas",
        description: "Evalúa llamadas y recibe coaching accionable para cerrar más.",
      },
      extension: {
        title: "Extensión de Chrome",
        description: "Prospecta y enriquece directamente en LinkedIn y cualquier web.",
      },
      integrations: {
        title: "CRM e integraciones",
        description: "Sincroniza en ambos sentidos con HubSpot, Salesforce y tu stack.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Lista de configuración",
    setupChecklistDesc:
      "Complétalos para desbloquear toda la experiencia de Kombo.",
    roleGoals: "Tu rol y objetivos",
    roleGoalsDesc:
      "Lo usamos para personalizar tus paneles y las sugerencias de IA.",
    role: "Rol",
    selectRole: "Selecciona tu rol",
    goals: "Objetivos",
    goalsPlaceholder:
      "p. ej. Agendar 30 reuniones cualificadas al mes, duplicar el pipeline",
    save: "Guardar",
    quickLinks: "Enlaces rápidos",
    quickLinksDesc: "Fija las herramientas y recursos que más utilizas.",
    removeLink: (label: string) => `Eliminar ${label}`,
    label: "Etiqueta",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://ejemplo.com",
    addLink: "Añadir enlace",
    linkedInConnected: "LinkedIn conectado",
    connected: "Conectado",
    connect: "Conectar",
    done: "Hecho",
    inviteTeam: "Invitar al equipo",
    markDone: "Marcar como hecho",
    tasks: {
      crm: {
        title: "Conecta tu CRM",
        description: "Sincroniza prospectos, actividades y negocios en ambos sentidos.",
      },
      linkedin: {
        title: "Conecta LinkedIn",
        description: "Enriquece perfiles y envía outreach desde Kombo.",
      },
      team: {
        title: "Invita a tu equipo",
        description: "Colabora en el pipeline y comparte plantillas.",
      },
      profile: {
        title: "Define tu rol y objetivos",
        description: "Personaliza los paneles y las recomendaciones de IA.",
      },
      links: {
        title: "Añade enlaces rápidos",
        description: "Fija las herramientas que usas cada día.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
  it: {
    title: "Inizia",
    description:
      "Completa la configurazione del tuo spazio di lavoro per sfruttare al meglio Kombo.",
    guidedTitle: "Nuovo qui? Fai la configurazione guidata",
    guidedDesc:
      "Un percorso di 2 minuti per personalizzare Kombo in base al tuo team, CRM e strumenti.",
    guidedCta: "Inizia l'onboarding",
    saved: "Salvato",
    linkAdded: "Link aggiunto",
    completeCount: (done: number, total: number) =>
      `${done} di ${total} completati`,
    allSet: "Tutto pronto 🎉",
    exploreTitle: "Esplora Kombo",
    exploreDesc: "Tutto quello che puoi fare — entra e prova una funzionalità.",
    open: "Apri",
    features: {
      search: {
        title: "Trova prospect",
        description:
          "Trova i tuoi clienti ideali con l'IA tra milioni di prospect e aziende.",
      },
      lists: {
        title: "Liste e segmenti",
        description:
          "Raggruppa prospect e account in liste che puoi arricchire e iscrivere.",
      },
      enrich: {
        title: "Arricchimento dati",
        description: "Scopri email verificate e numeri diretti per qualsiasi contatto.",
      },
      campaigns: {
        title: "Sequenze e campagne",
        description:
          "Lancia outreach multi-step via email e LinkedIn che si mette in pausa automaticamente alla risposta.",
      },
      inbox: {
        title: "Posta in arrivo unificata",
        description:
          "Rispondi a ogni canale in un unico posto, con risposte redatte dall'IA.",
      },
      templates: {
        title: "Modelli di messaggio",
        description: "Salva i tuoi testi con le migliori performance e personalizzali su larga scala.",
      },
      deals: {
        title: "Pipeline e trattative",
        description: "Segui i prospect dall'interesse alla vittoria lungo le fasi di esito.",
      },
      coach: {
        title: "Coaching delle chiamate",
        description: "Valuta le chiamate e ricevi coaching pratico per chiudere più trattative.",
      },
      extension: {
        title: "Estensione Chrome",
        description: "Prospetta e arricchisci direttamente su LinkedIn e qualsiasi sito web.",
      },
      integrations: {
        title: "CRM e integrazioni",
        description: "Sincronizza in entrambe le direzioni con HubSpot, Salesforce e il tuo stack.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Lista di configurazione",
    setupChecklistDesc: "Completa questi passaggi per sbloccare l'esperienza Kombo completa.",
    roleGoals: "Il tuo ruolo e i tuoi obiettivi",
    roleGoalsDesc: "Li usiamo per personalizzare le tue dashboard e i suggerimenti dell'IA.",
    role: "Ruolo",
    selectRole: "Seleziona il tuo ruolo",
    goals: "Obiettivi",
    goalsPlaceholder:
      "es. Prenota 30 riunioni qualificate al mese, raddoppia la pipeline",
    save: "Salva",
    quickLinks: "Link rapidi",
    quickLinksDesc: "Fissa gli strumenti e le risorse che usi più spesso.",
    removeLink: (label: string) => `Rimuovi ${label}`,
    label: "Etichetta",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://esempio.com",
    addLink: "Aggiungi link",
    linkedInConnected: "LinkedIn collegato",
    connected: "Collegato",
    connect: "Collega",
    done: "Fatto",
    inviteTeam: "Invita il team",
    markDone: "Segna come fatto",
    tasks: {
      crm: {
        title: "Collega il tuo CRM",
        description: "Sincronizza prospect, attività e trattative in entrambe le direzioni.",
      },
      linkedin: {
        title: "Collega LinkedIn",
        description: "Arricchisci i profili e invia outreach da Kombo.",
      },
      team: {
        title: "Invita il tuo team",
        description: "Collabora sulla pipeline e condividi i modelli.",
      },
      profile: {
        title: "Imposta il tuo ruolo e i tuoi obiettivi",
        description: "Personalizza le dashboard e i suggerimenti dell'IA.",
      },
      links: {
        title: "Aggiungi link rapidi",
        description: "Fissa gli strumenti che usi ogni giorno.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
  fr: {
    title: "Premiers pas",
    description:
      "Terminez la configuration de votre espace de travail pour tirer le meilleur parti de Kombo.",
    guidedTitle: "Nouveau ici ? Suivez la configuration guidée",
    guidedDesc:
      "Une visite guidée de 2 minutes pour adapter Kombo à votre équipe, votre CRM et vos outils.",
    guidedCta: "Démarrer l'intégration",
    saved: "Enregistré",
    linkAdded: "Lien ajouté",
    completeCount: (done: number, total: number) =>
      `${done} sur ${total} terminés`,
    allSet: "Tout est prêt 🎉",
    exploreTitle: "Explorez Kombo",
    exploreDesc: "Tout ce que vous pouvez faire — lancez-vous et essayez une fonctionnalité.",
    open: "Ouvrir",
    features: {
      search: {
        title: "Trouver des prospects",
        description:
          "Trouvez vos clients idéaux grâce à l'IA parmi des millions de prospects et d'entreprises.",
      },
      lists: {
        title: "Listes et segments",
        description:
          "Regroupez prospects et comptes dans des listes que vous pouvez enrichir et inscrire.",
      },
      enrich: {
        title: "Enrichissement de données",
        description: "Révélez des emails vérifiés et des lignes directes pour tout contact.",
      },
      campaigns: {
        title: "Séquences et campagnes",
        description:
          "Menez un outreach multi-étapes par email et LinkedIn qui se met en pause automatiquement dès une réponse.",
      },
      inbox: {
        title: "Boîte de réception unifiée",
        description:
          "Répondez sur tous les canaux au même endroit, avec des réponses rédigées par IA.",
      },
      templates: {
        title: "Modèles de messages",
        description: "Enregistrez vos meilleurs textes et personnalisez-les à grande échelle.",
      },
      deals: {
        title: "Pipeline et transactions",
        description: "Suivez les prospects, de l'intérêt à la transaction gagnée, à travers les étapes.",
      },
      coach: {
        title: "Coaching d'appels",
        description: "Évaluez les appels et recevez un coaching concret pour conclure plus de transactions.",
      },
      extension: {
        title: "Extension Chrome",
        description: "Prospectez et enrichissez directement sur LinkedIn et sur n'importe quel site.",
      },
      integrations: {
        title: "CRM et intégrations",
        description: "Synchronisez dans les deux sens avec HubSpot, Salesforce et vos outils.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Liste de configuration",
    setupChecklistDesc: "Cochez ces étapes pour débloquer toute l'expérience Kombo.",
    roleGoals: "Votre rôle et vos objectifs",
    roleGoalsDesc: "Nous les utilisons pour personnaliser vos tableaux de bord et les suggestions de l'IA.",
    role: "Rôle",
    selectRole: "Sélectionnez votre rôle",
    goals: "Objectifs",
    goalsPlaceholder:
      "ex. Prendre 30 rendez-vous qualifiés par mois, doubler le pipeline",
    save: "Enregistrer",
    quickLinks: "Liens rapides",
    quickLinksDesc: "Épinglez les outils et ressources que vous utilisez le plus.",
    removeLink: (label: string) => `Supprimer ${label}`,
    label: "Libellé",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://exemple.com",
    addLink: "Ajouter un lien",
    linkedInConnected: "LinkedIn connecté",
    connected: "Connecté",
    connect: "Connecter",
    done: "Terminé",
    inviteTeam: "Inviter l'équipe",
    markDone: "Marquer comme terminé",
    tasks: {
      crm: {
        title: "Connectez votre CRM",
        description: "Synchronisez prospects, activités et transactions dans les deux sens.",
      },
      linkedin: {
        title: "Connectez LinkedIn",
        description: "Enrichissez les profils et envoyez des messages depuis Kombo.",
      },
      team: {
        title: "Invitez votre équipe",
        description: "Collaborez sur le pipeline et partagez des modèles.",
      },
      profile: {
        title: "Définissez votre rôle et vos objectifs",
        description: "Personnalisez les tableaux de bord et les recommandations de l'IA.",
      },
      links: {
        title: "Ajoutez des liens rapides",
        description: "Épinglez les outils que vous utilisez chaque jour.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
  de: {
    title: "Erste Schritte",
    description:
      "Richte deinen Workspace fertig ein, um das Beste aus Kombo herauszuholen.",
    guidedTitle: "Neu hier? Starte die geführte Einrichtung",
    guidedDesc:
      "Eine 2-minütige Tour, um Kombo auf dein Team, CRM und deine Tools zuzuschneiden.",
    guidedCta: "Onboarding starten",
    saved: "Gespeichert",
    linkAdded: "Link hinzugefügt",
    completeCount: (done: number, total: number) =>
      `${done} von ${total} erledigt`,
    allSet: "Du bist startklar 🎉",
    exploreTitle: "Kombo entdecken",
    exploreDesc: "Alles, was du tun kannst — leg los und probiere eine Funktion aus.",
    open: "Öffnen",
    features: {
      search: {
        title: "Prospects finden",
        description:
          "Finde deine idealen Kunden mit KI unter Millionen von Prospects & Unternehmen.",
      },
      lists: {
        title: "Listen & Segmente",
        description:
          "Gruppiere Prospects und Accounts in Listen, die du anreichern und einschreiben kannst.",
      },
      enrich: {
        title: "Datenanreicherung",
        description: "Decke verifizierte E-Mails und Durchwahlen für jeden Kontakt auf.",
      },
      campaigns: {
        title: "Sequenzen & Kampagnen",
        description:
          "Führe mehrstufige Ansprache über E-Mail und LinkedIn durch, die bei einer Antwort automatisch pausiert.",
      },
      inbox: {
        title: "Einheitlicher Posteingang",
        description:
          "Antworte auf jeden Kanal an einem Ort, mit KI-generierten Antwortentwürfen.",
      },
      templates: {
        title: "Nachrichtenvorlagen",
        description: "Speichere deine erfolgreichsten Texte und personalisiere sie im großen Maßstab.",
      },
      deals: {
        title: "Pipeline & Deals",
        description: "Verfolge Prospects über die Erfolgsphasen von interessiert bis gewonnen.",
      },
      coach: {
        title: "Call-Coaching",
        description: "Bewerte Anrufe und erhalte umsetzbares Coaching, um mehr Deals zu gewinnen.",
      },
      extension: {
        title: "Chrome-Erweiterung",
        description: "Prospecting und Anreicherung direkt auf LinkedIn und jeder Website.",
      },
      integrations: {
        title: "CRM & Integrationen",
        description: "Synchronisiere bidirektional mit HubSpot, Salesforce und deinem Stack.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Einrichtungs-Checkliste",
    setupChecklistDesc: "Erledige diese Schritte, um die volle Kombo-Erfahrung freizuschalten.",
    roleGoals: "Deine Rolle & Ziele",
    roleGoalsDesc: "Wir nutzen das, um deine Dashboards und KI-Vorschläge anzupassen.",
    role: "Rolle",
    selectRole: "Wähle deine Rolle",
    goals: "Ziele",
    goalsPlaceholder:
      "z. B. 30 qualifizierte Meetings/Monat buchen, Pipeline verdoppeln",
    save: "Speichern",
    quickLinks: "Schnellzugriffe",
    quickLinksDesc: "Pinne die Tools und Ressourcen an, die du am häufigsten brauchst.",
    removeLink: (label: string) => `${label} entfernen`,
    label: "Bezeichnung",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://beispiel.com",
    addLink: "Link hinzufügen",
    linkedInConnected: "LinkedIn verbunden",
    connected: "Verbunden",
    connect: "Verbinden",
    done: "Erledigt",
    inviteTeam: "Team einladen",
    markDone: "Als erledigt markieren",
    tasks: {
      crm: {
        title: "Verbinde dein CRM",
        description: "Synchronisiere Prospects, Aktivitäten und Deals bidirektional.",
      },
      linkedin: {
        title: "Verbinde LinkedIn",
        description: "Reichere Profile an und sende Ansprache direkt aus Kombo.",
      },
      team: {
        title: "Lade dein Team ein",
        description: "Arbeite gemeinsam an der Pipeline und teile Vorlagen.",
      },
      profile: {
        title: "Lege deine Rolle & Ziele fest",
        description: "Passe Dashboards und KI-Empfehlungen an.",
      },
      links: {
        title: "Schnellzugriffe hinzufügen",
        description: "Pinne die Tools an, die du täglich nutzt.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
  pt: {
    title: "Começar",
    description:
      "Termine de configurar o seu espaço de trabalho para tirar o máximo partido do Kombo.",
    guidedTitle: "Novo por aqui? Faça a configuração guiada",
    guidedDesc:
      "Um percurso de 2 minutos para adaptar o Kombo à sua equipa, CRM e ferramentas.",
    guidedCta: "Iniciar onboarding",
    saved: "Guardado",
    linkAdded: "Link adicionado",
    completeCount: (done: number, total: number) =>
      `${done} de ${total} concluídos`,
    allSet: "Está tudo pronto 🎉",
    exploreTitle: "Explore o Kombo",
    exploreDesc: "Tudo o que pode fazer — entre e experimente uma funcionalidade.",
    open: "Abrir",
    features: {
      search: {
        title: "Encontrar prospects",
        description:
          "Encontre os seus clientes ideais com IA entre milhões de prospects e empresas.",
      },
      lists: {
        title: "Listas e segmentos",
        description:
          "Agrupe prospects e contas em listas que pode enriquecer e inscrever.",
      },
      enrich: {
        title: "Enriquecimento de dados",
        description: "Revele emails verificados e telefones diretos de qualquer contacto.",
      },
      campaigns: {
        title: "Sequências e campanhas",
        description:
          "Lance outreach em várias etapas por email e LinkedIn que pausa automaticamente ao receber resposta.",
      },
      inbox: {
        title: "Caixa de entrada unificada",
        description:
          "Responda a todos os canais num só lugar, com respostas redigidas por IA.",
      },
      templates: {
        title: "Modelos de mensagens",
        description: "Guarde os seus textos com melhor desempenho e personalize-os em escala.",
      },
      deals: {
        title: "Pipeline e negócios",
        description: "Acompanhe os prospects desde o interesse até ao negócio ganho, ao longo das etapas.",
      },
      coach: {
        title: "Coaching de chamadas",
        description: "Avalie chamadas e receba coaching acionável para ganhar mais negócios.",
      },
      extension: {
        title: "Extensão Chrome",
        description: "Prospete e enriqueça diretamente no LinkedIn e em qualquer site.",
      },
      integrations: {
        title: "CRM e integrações",
        description: "Sincronize em ambos os sentidos com HubSpot, Salesforce e as suas ferramentas.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Lista de configuração",
    setupChecklistDesc: "Conclua estes passos para desbloquear a experiência completa do Kombo.",
    roleGoals: "O seu papel e objetivos",
    roleGoalsDesc: "Usamos isto para personalizar os seus painéis e as sugestões de IA.",
    role: "Função",
    selectRole: "Selecione a sua função",
    goals: "Objetivos",
    goalsPlaceholder:
      "ex. Marcar 30 reuniões qualificadas por mês, duplicar o pipeline",
    save: "Guardar",
    quickLinks: "Links rápidos",
    quickLinksDesc: "Fixe as ferramentas e recursos que mais utiliza.",
    removeLink: (label: string) => `Remover ${label}`,
    label: "Etiqueta",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://exemplo.com",
    addLink: "Adicionar link",
    linkedInConnected: "LinkedIn conectado",
    connected: "Conectado",
    connect: "Conectar",
    done: "Concluído",
    inviteTeam: "Convidar equipa",
    markDone: "Marcar como concluído",
    tasks: {
      crm: {
        title: "Conecte o seu CRM",
        description: "Sincronize prospects, atividades e negócios em ambos os sentidos.",
      },
      linkedin: {
        title: "Conecte o LinkedIn",
        description: "Enriqueça perfis e envie outreach a partir do Kombo.",
      },
      team: {
        title: "Convide a sua equipa",
        description: "Colabore no pipeline e partilhe modelos.",
      },
      profile: {
        title: "Defina o seu papel e objetivos",
        description: "Personalize os painéis e as recomendações de IA.",
      },
      links: {
        title: "Adicione links rápidos",
        description: "Fixe as ferramentas que usa todos os dias.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
  pt_BR: {
    title: "Começar",
    description:
      "Termine de configurar seu workspace para aproveitar ao máximo o Kombo.",
    guidedTitle: "Novo por aqui? Faça a configuração guiada",
    guidedDesc:
      "Um tour de 2 minutos para adaptar o Kombo ao seu time, CRM e ferramentas.",
    guidedCta: "Iniciar onboarding",
    saved: "Salvo",
    linkAdded: "Link adicionado",
    completeCount: (done: number, total: number) =>
      `${done} de ${total} concluídos`,
    allSet: "Está tudo pronto 🎉",
    exploreTitle: "Explore o Kombo",
    exploreDesc: "Tudo o que você pode fazer — entre e experimente um recurso.",
    open: "Abrir",
    features: {
      search: {
        title: "Encontrar prospects",
        description:
          "Encontre seus clientes ideais com IA entre milhões de prospects e empresas.",
      },
      lists: {
        title: "Listas e segmentos",
        description:
          "Agrupe prospects e contas em listas que você pode enriquecer e inscrever.",
      },
      enrich: {
        title: "Enriquecimento de dados",
        description: "Revele emails verificados e telefones diretos de qualquer contato.",
      },
      campaigns: {
        title: "Sequências e campanhas",
        description:
          "Dispare outreach em várias etapas por email e LinkedIn que pausa automaticamente ao receber uma resposta.",
      },
      inbox: {
        title: "Caixa de entrada unificada",
        description:
          "Responda a todos os canais em um só lugar, com respostas redigidas por IA.",
      },
      templates: {
        title: "Modelos de mensagens",
        description: "Salve seus textos de melhor desempenho e personalize-os em escala.",
      },
      deals: {
        title: "Pipeline e negócios",
        description: "Acompanhe os prospects do interesse até o negócio ganho, pelas etapas de resultado.",
      },
      coach: {
        title: "Coaching de ligações",
        description: "Avalie ligações e receba coaching prático para fechar mais negócios.",
      },
      extension: {
        title: "Extensão Chrome",
        description: "Prospecte e enriqueça direto no LinkedIn e em qualquer site.",
      },
      integrations: {
        title: "CRM e integrações",
        description: "Sincronize nos dois sentidos com HubSpot, Salesforce e seu stack.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Checklist de configuração",
    setupChecklistDesc: "Complete estes passos para desbloquear toda a experiência do Kombo.",
    roleGoals: "Seu papel e objetivos",
    roleGoalsDesc: "Usamos isso para personalizar seus painéis e as sugestões de IA.",
    role: "Função",
    selectRole: "Selecione sua função",
    goals: "Objetivos",
    goalsPlaceholder:
      "ex. Agendar 30 reuniões qualificadas por mês, dobrar o pipeline",
    save: "Salvar",
    quickLinks: "Links rápidos",
    quickLinksDesc: "Fixe as ferramentas e recursos que você mais usa.",
    removeLink: (label: string) => `Remover ${label}`,
    label: "Etiqueta",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://exemplo.com",
    addLink: "Adicionar link",
    linkedInConnected: "LinkedIn conectado",
    connected: "Conectado",
    connect: "Conectar",
    done: "Concluído",
    inviteTeam: "Convidar time",
    markDone: "Marcar como concluído",
    tasks: {
      crm: {
        title: "Conecte seu CRM",
        description: "Sincronize prospects, atividades e negócios nos dois sentidos.",
      },
      linkedin: {
        title: "Conecte o LinkedIn",
        description: "Enriqueça perfis e envie outreach a partir do Kombo.",
      },
      team: {
        title: "Convide seu time",
        description: "Colabore no pipeline e compartilhe modelos.",
      },
      profile: {
        title: "Defina seu papel e objetivos",
        description: "Personalize os painéis e as recomendações de IA.",
      },
      links: {
        title: "Adicione links rápidos",
        description: "Fixe as ferramentas que você usa todos os dias.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
} as const

export default function GetStarted() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const setup = useSetup()
  const completedCount = setup.completed.size
  const allDone = setup.progress === 100

  const [role, setRole] = React.useState(setup.role)
  const [goals, setGoals] = React.useState(setup.goals)
  const [linkLabel, setLinkLabel] = React.useState("")
  const [linkUrl, setLinkUrl] = React.useState("")

  function handleSaveProfile() {
    setup.setProfile(role, goals)
    toast.success(c.saved)
  }

  function handleAddLink() {
    const label = linkLabel.trim()
    const url = linkUrl.trim()
    if (!label || !url) return
    setup.addQuickLink(label, url)
    setLinkLabel("")
    setLinkUrl("")
    toast.success(c.linkAdded)
  }

  return (
    <Page className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <img src={kaiUrl} alt="" className="size-14 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{c.title}</h1>
          <p className="text-muted-foreground text-sm">{c.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Guided onboarding entry point */}
        <Card className="from-primary/10 border-primary/20 bg-gradient-to-r to-transparent">
          <CardContent className="flex flex-wrap items-center gap-4 py-1">
            <span className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.guidedTitle}</p>
              <p className="text-muted-foreground text-sm">{c.guidedDesc}</p>
            </div>
            <Button variant="volt" asChild>
              <Link to="/onboarding">
                {c.guidedCta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {c.completeCount(completedCount, CHECKLIST.length)}
                </CardTitle>
                {allDone && <CardDescription>{c.allSet}</CardDescription>}
              </div>
              <span className="text-2xl font-semibold tabular-nums">
                {setup.progress}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={setup.progress} />
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.setupChecklist}</CardTitle>
            <CardDescription>{c.setupChecklistDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {CHECKLIST.map((task, i) => {
              const done = setup.isDone(task.id)
              const Icon = task.icon
              return (
                <React.Fragment key={task.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center gap-4 py-3">
                    <button
                      type="button"
                      aria-label={c.markDone}
                      aria-pressed={done}
                      onClick={() => setup.toggle(task.id)}
                      className="shrink-0 rounded-full"
                    >
                      {done ? (
                        <CheckCircle2 className="text-chart-1 size-5" />
                      ) : (
                        <Circle className="text-muted-foreground hover:text-foreground size-5 transition-colors" />
                      )}
                    </button>
                    <Icon className="text-muted-foreground size-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          done && "text-muted-foreground line-through"
                        )}
                      >
                        {c.tasks[task.id].title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {c.tasks[task.id].description}
                      </p>
                    </div>
                    <TaskAction task={task} done={done} setup={setup} />
                  </div>
                </React.Fragment>
              )
            })}
          </CardContent>
        </Card>

        {/* Explore features & capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.exploreTitle}</CardTitle>
            <CardDescription>{c.exploreDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((cap) => {
                const Icon = cap.icon
                const f = c.features[cap.key]
                return (
                  <Link
                    key={cap.key}
                    to={cap.to}
                    className="group hover:border-primary/40 hover:bg-muted/40 focus-visible:border-primary/40 focus-visible:ring-ring/50 flex flex-col gap-2 rounded-xl border p-4 transition-colors outline-none focus-visible:ring-[3px]"
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg",
                        cap.tint
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-sm font-medium">
                      {f.title}
                      <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {f.description}
                    </span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role & goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.roleGoals}</CardTitle>
            <CardDescription>{c.roleGoalsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">{c.role}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder={c.selectRole} />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">{c.goals}</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder={c.goalsPlaceholder}
              />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile}>{c.save}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.quickLinks}</CardTitle>
            <CardDescription>{c.quickLinksDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setup.quickLinks.length > 0 && (
              <div className="space-y-1">
                {setup.quickLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <LinkIcon className="text-muted-foreground size-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        {link.label}
                      </a>
                      <p className="text-muted-foreground truncate text-xs">
                        {link.url}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={c.removeLink(link.label)}
                      onClick={() => setup.removeQuickLink(link.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="link-label">{c.label}</Label>
                <Input
                  id="link-label"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder={c.labelPlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">{c.url}</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={c.urlPlaceholder}
                />
              </div>
              <Button
                onClick={handleAddLink}
                disabled={!linkLabel.trim() || !linkUrl.trim()}
              >
                <Plus className="size-4" />
                {c.addLink}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}

function TaskAction({
  task,
  done,
  setup,
}: {
  task: ChecklistTask
  done: boolean
  setup: ReturnType<typeof useSetup>
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  if (task.id === "crm") {
    return done ? (
      <Badge variant="success" className="font-normal">
        {c.connected}
      </Badge>
    ) : (
      <Button asChild size="sm" variant="outline">
        <Link to="/integrations">{c.connect}</Link>
      </Button>
    )
  }

  if (task.id === "linkedin") {
    return done ? (
      <Badge variant="success" className="font-normal">
        {c.connected}
      </Badge>
    ) : (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setup.complete("linkedin")
          toast.success(c.linkedInConnected)
        }}
      >
        {c.connect}
      </Button>
    )
  }

  if (task.id === "team") {
    return done ? (
      <Badge variant="success" className="font-normal">
        {c.done}
      </Badge>
    ) : (
      <Button asChild size="sm" variant="outline">
        <Link to="/team">{c.inviteTeam}</Link>
      </Button>
    )
  }

  // profile + links are completed via their editor cards below.
  return done ? (
    <Badge variant="success" className="font-normal">
      {c.done}
    </Badge>
  ) : (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setup.complete(task.id)}
    >
      {c.markDone}
    </Button>
  )
}
