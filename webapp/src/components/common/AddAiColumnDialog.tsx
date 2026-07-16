import * as React from "react"
import { toast } from "sonner"
import {
  Sparkles,
  Type,
  Gauge,
  ToggleLeft,
  Pencil,
  Wand2,
  LayoutGrid,
  Settings2,
  Trash2,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocale, type Locale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import {
  aiColumnStore,
  useAiColumns,
  type AiColumnEntity,
  type AiColumnKind,
  type AiColumnOutput,
} from "@/lib/ai-columns"
import {
  useProspects,
  useAccounts,
  prospectStore,
  accountStore,
} from "@/lib/store"

const COPY = {
  en: {
    title: "Table columns — AI & custom",
    description:
      "Add a column the AI fills per row, a custom column you fill yourself, or let the AI rewrite an existing column's values.",
    tabTemplates: "Templates",
    tabScratch: "From scratch",
    tabTransform: "Transform a column",
    tabManage: "Manage",
    useTemplate: "Use this template",
    exampleBefore: "Before",
    exampleAfter: "After",
    name: "Column name",
    namePlaceholder: "e.g. Last funding round",
    fillLabel: "How is it filled?",
    fillAi: "AI fills it",
    fillAiDesc: "Runs the prompt per row.",
    fillCustom: "I'll fill it myself",
    fillCustomDesc: "Starts empty — type values in edit mode.",
    prompt: "AI prompt",
    output: "Output",
    outText: "Text",
    outScore: "Score",
    outYesNo: "Yes / No",
    cancel: "Cancel",
    create: "Create column",
    close: "Done",
    transformColumn: "Column to transform",
    transformHow: "What should the AI do?",
    transformApply: "Apply to all rows",
    transformed: (n: number) => `${n} ${n === 1 ? "value" : "values"} updated`,
    transformHint:
      "Rewrites this column's values in your workspace copy — the original source data is untouched.",
    manageEmpty: "No AI or custom columns yet.",
    renamed: "Column updated",
    deleted: "Column deleted",
    rename: "Rename",
    deleteAria: (name: string) => `Delete ${name}`,
    categories: {
      clean: "Clean",
      copywrite: "Copywrite",
      extract: "Extract",
      research: "Research",
    },
    transforms: {
      titlecase: "Fix casing (Title Case, keep acronyms)",
      clean_suffix: "Strip decorations (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Remove legal suffixes (Inc., LLC, GmbH…)",
      city: "Keep the city only",
      trim: "Trim & collapse whitespace",
    },
    fields: {
      title: "Job title",
      company: "Company",
      location: "Location",
      name: "Company name",
      industry: "Industry",
    },
  },
  es: {
    title: "Columnas de la tabla — IA y personalizadas",
    description:
      "Añade una columna que la IA rellena por fila, una columna personalizada que rellenas tú, o deja que la IA reescriba los valores de una columna existente.",
    tabTemplates: "Plantillas",
    tabScratch: "Desde cero",
    tabTransform: "Transformar una columna",
    tabManage: "Gestionar",
    useTemplate: "Usar esta plantilla",
    exampleBefore: "Antes",
    exampleAfter: "Después",
    name: "Nombre de columna",
    namePlaceholder: "p. ej. Última ronda de financiación",
    fillLabel: "¿Cómo se rellena?",
    fillAi: "La IA la rellena",
    fillAiDesc: "Ejecuta el prompt por fila.",
    fillCustom: "La relleno yo",
    fillCustomDesc: "Empieza vacía — escribe valores en modo edición.",
    prompt: "Prompt de IA",
    output: "Salida",
    outText: "Texto",
    outScore: "Puntuación",
    outYesNo: "Sí / No",
    cancel: "Cancelar",
    create: "Crear columna",
    close: "Listo",
    transformColumn: "Columna a transformar",
    transformHow: "¿Qué debe hacer la IA?",
    transformApply: "Aplicar a todas las filas",
    transformed: (n: number) =>
      `${n} ${n === 1 ? "valor actualizado" : "valores actualizados"}`,
    transformHint:
      "Reescribe los valores de esta columna en tu copia del espacio de trabajo — los datos de origen no se tocan.",
    manageEmpty: "Aún no hay columnas de IA ni personalizadas.",
    renamed: "Columna actualizada",
    deleted: "Columna eliminada",
    rename: "Renombrar",
    deleteAria: (name: string) => `Eliminar ${name}`,
    categories: {
      clean: "Limpieza",
      copywrite: "Redacción",
      extract: "Extracción",
      research: "Investigación",
    },
    transforms: {
      titlecase: "Corregir mayúsculas (Título, conserva siglas)",
      clean_suffix: "Quitar adornos (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Quitar sufijos legales (Inc., LLC, GmbH…)",
      city: "Dejar solo la ciudad",
      trim: "Recortar y compactar espacios",
    },
    fields: {
      title: "Cargo",
      company: "Empresa",
      location: "Ubicación",
      name: "Nombre de la empresa",
      industry: "Sector",
    },
  },
  it: {
    title: "Colonne della tabella — IA e personalizzate",
    description:
      "Aggiungi una colonna che l'IA compila riga per riga, una colonna personalizzata che compili tu, oppure lascia che l'IA riscriva i valori di una colonna esistente.",
    tabTemplates: "Modelli",
    tabScratch: "Da zero",
    tabTransform: "Trasforma una colonna",
    tabManage: "Gestisci",
    useTemplate: "Usa questo modello",
    exampleBefore: "Prima",
    exampleAfter: "Dopo",
    name: "Nome della colonna",
    namePlaceholder: "es. Ultimo round di finanziamento",
    fillLabel: "Come si compila?",
    fillAi: "La compila l'IA",
    fillAiDesc: "Esegue il prompt per ogni riga.",
    fillCustom: "La compilo io",
    fillCustomDesc: "Parte vuota — scrivi i valori in modalità modifica.",
    prompt: "Prompt IA",
    output: "Output",
    outText: "Testo",
    outScore: "Punteggio",
    outYesNo: "Sì / No",
    cancel: "Annulla",
    create: "Crea colonna",
    close: "Fatto",
    transformColumn: "Colonna da trasformare",
    transformHow: "Cosa deve fare l'IA?",
    transformApply: "Applica a tutte le righe",
    transformed: (n: number) =>
      `${n} ${n === 1 ? "valore aggiornato" : "valori aggiornati"}`,
    transformHint:
      "Riscrive i valori di questa colonna nella tua copia dello spazio di lavoro — i dati di origine restano intatti.",
    manageEmpty: "Ancora nessuna colonna IA o personalizzata.",
    renamed: "Colonna aggiornata",
    deleted: "Colonna eliminata",
    rename: "Rinomina",
    deleteAria: (name: string) => `Elimina ${name}`,
    categories: {
      clean: "Pulizia",
      copywrite: "Copywriting",
      extract: "Estrazione",
      research: "Ricerca",
    },
    transforms: {
      titlecase: "Correggi le maiuscole (Title Case, conserva le sigle)",
      clean_suffix: "Rimuovi le decorazioni (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Rimuovi i suffissi legali (Inc., LLC, GmbH…)",
      city: "Mantieni solo la città",
      trim: "Taglia e compatta gli spazi",
    },
    fields: {
      title: "Ruolo",
      company: "Azienda",
      location: "Località",
      name: "Nome dell'azienda",
      industry: "Settore",
    },
  },
  fr: {
    title: "Colonnes du tableau — IA et personnalisées",
    description:
      "Ajoutez une colonne que l'IA remplit ligne par ligne, une colonne personnalisée que vous remplissez vous-même, ou laissez l'IA réécrire les valeurs d'une colonne existante.",
    tabTemplates: "Modèles",
    tabScratch: "À partir de zéro",
    tabTransform: "Transformer une colonne",
    tabManage: "Gérer",
    useTemplate: "Utiliser ce modèle",
    exampleBefore: "Avant",
    exampleAfter: "Après",
    name: "Nom de la colonne",
    namePlaceholder: "p. ex. Dernier tour de financement",
    fillLabel: "Comment est-elle remplie ?",
    fillAi: "L'IA la remplit",
    fillAiDesc: "Exécute le prompt pour chaque ligne.",
    fillCustom: "Je la remplis moi-même",
    fillCustomDesc: "Commence vide — saisissez les valeurs en mode édition.",
    prompt: "Prompt IA",
    output: "Sortie",
    outText: "Texte",
    outScore: "Score",
    outYesNo: "Oui / Non",
    cancel: "Annuler",
    create: "Créer la colonne",
    close: "Terminé",
    transformColumn: "Colonne à transformer",
    transformHow: "Que doit faire l'IA ?",
    transformApply: "Appliquer à toutes les lignes",
    transformed: (n: number) =>
      `${n} ${n === 1 ? "valeur mise à jour" : "valeurs mises à jour"}`,
    transformHint:
      "Réécrit les valeurs de cette colonne dans votre copie de l'espace de travail — les données d'origine restent intactes.",
    manageEmpty: "Aucune colonne IA ou personnalisée pour l'instant.",
    renamed: "Colonne mise à jour",
    deleted: "Colonne supprimée",
    rename: "Renommer",
    deleteAria: (name: string) => `Supprimer ${name}`,
    categories: {
      clean: "Nettoyage",
      copywrite: "Rédaction",
      extract: "Extraction",
      research: "Recherche",
    },
    transforms: {
      titlecase: "Corriger la casse (Title Case, conserve les sigles)",
      clean_suffix: "Supprimer les décorations (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Supprimer les suffixes légaux (Inc., LLC, GmbH…)",
      city: "Ne garder que la ville",
      trim: "Rogner et compacter les espaces",
    },
    fields: {
      title: "Poste",
      company: "Entreprise",
      location: "Localisation",
      name: "Nom de l'entreprise",
      industry: "Secteur",
    },
  },
  de: {
    title: "Tabellenspalten — KI & benutzerdefiniert",
    description:
      "Füge eine Spalte hinzu, die die KI pro Zeile ausfüllt, eine eigene Spalte, die du selbst ausfüllst, oder lass die KI die Werte einer bestehenden Spalte umschreiben.",
    tabTemplates: "Vorlagen",
    tabScratch: "Von Grund auf",
    tabTransform: "Spalte transformieren",
    tabManage: "Verwalten",
    useTemplate: "Diese Vorlage verwenden",
    exampleBefore: "Vorher",
    exampleAfter: "Nachher",
    name: "Spaltenname",
    namePlaceholder: "z. B. Letzte Finanzierungsrunde",
    fillLabel: "Wie wird sie ausgefüllt?",
    fillAi: "Die KI füllt sie aus",
    fillAiDesc: "Führt den Prompt pro Zeile aus.",
    fillCustom: "Ich fülle sie selbst aus",
    fillCustomDesc: "Startet leer — trage Werte im Bearbeitungsmodus ein.",
    prompt: "KI-Prompt",
    output: "Ausgabe",
    outText: "Text",
    outScore: "Score",
    outYesNo: "Ja / Nein",
    cancel: "Abbrechen",
    create: "Spalte erstellen",
    close: "Fertig",
    transformColumn: "Zu transformierende Spalte",
    transformHow: "Was soll die KI tun?",
    transformApply: "Auf alle Zeilen anwenden",
    transformed: (n: number) =>
      `${n} ${n === 1 ? "Wert aktualisiert" : "Werte aktualisiert"}`,
    transformHint:
      "Schreibt die Werte dieser Spalte in deiner Workspace-Kopie um — die ursprünglichen Quelldaten bleiben unberührt.",
    manageEmpty: "Noch keine KI- oder benutzerdefinierten Spalten.",
    renamed: "Spalte aktualisiert",
    deleted: "Spalte gelöscht",
    rename: "Umbenennen",
    deleteAria: (name: string) => `${name} löschen`,
    categories: {
      clean: "Bereinigung",
      copywrite: "Texterstellung",
      extract: "Extraktion",
      research: "Recherche",
    },
    transforms: {
      titlecase: "Groß-/Kleinschreibung korrigieren (Title Case, Akronyme bleiben)",
      clean_suffix: "Zusätze entfernen (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Rechtsformzusätze entfernen (Inc., LLC, GmbH…)",
      city: "Nur die Stadt behalten",
      trim: "Leerzeichen kürzen & zusammenfassen",
    },
    fields: {
      title: "Jobtitel",
      company: "Unternehmen",
      location: "Standort",
      name: "Unternehmensname",
      industry: "Branche",
    },
  },
  pt: {
    title: "Colunas da tabela — IA e personalizadas",
    description:
      "Adicione uma coluna que a IA preenche por linha, uma coluna personalizada preenchida por si, ou deixe a IA reescrever os valores de uma coluna existente.",
    tabTemplates: "Modelos",
    tabScratch: "De raiz",
    tabTransform: "Transformar uma coluna",
    tabManage: "Gerir",
    useTemplate: "Usar este modelo",
    exampleBefore: "Antes",
    exampleAfter: "Depois",
    name: "Nome da coluna",
    namePlaceholder: "p. ex. Última ronda de financiamento",
    fillLabel: "Como é preenchida?",
    fillAi: "A IA preenche",
    fillAiDesc: "Executa o prompt por linha.",
    fillCustom: "Eu preencho",
    fillCustomDesc: "Começa vazia — escreva os valores no modo de edição.",
    prompt: "Prompt de IA",
    output: "Saída",
    outText: "Texto",
    outScore: "Pontuação",
    outYesNo: "Sim / Não",
    cancel: "Cancelar",
    create: "Criar coluna",
    close: "Concluído",
    transformColumn: "Coluna a transformar",
    transformHow: "O que deve a IA fazer?",
    transformApply: "Aplicar a todas as linhas",
    transformed: (n: number) =>
      `${n} ${n === 1 ? "valor atualizado" : "valores atualizados"}`,
    transformHint:
      "Reescreve os valores desta coluna na sua cópia do espaço de trabalho — os dados de origem ficam intactos.",
    manageEmpty: "Ainda não há colunas de IA nem personalizadas.",
    renamed: "Coluna atualizada",
    deleted: "Coluna eliminada",
    rename: "Renomear",
    deleteAria: (name: string) => `Eliminar ${name}`,
    categories: {
      clean: "Limpeza",
      copywrite: "Redação",
      extract: "Extração",
      research: "Pesquisa",
    },
    transforms: {
      titlecase: "Corrigir as maiúsculas (Title Case, mantém as siglas)",
      clean_suffix: "Remover adornos (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Remover sufixos legais (Inc., LLC, GmbH…)",
      city: "Manter apenas a cidade",
      trim: "Aparar e compactar espaços",
    },
    fields: {
      title: "Cargo",
      company: "Empresa",
      location: "Localização",
      name: "Nome da empresa",
      industry: "Setor",
    },
  },
  pt_BR: {
    title: "Colunas da tabela — IA e personalizadas",
    description:
      "Adicione uma coluna que a IA preenche por linha, uma coluna personalizada que você mesmo preenche, ou deixe a IA reescrever os valores de uma coluna existente.",
    tabTemplates: "Modelos",
    tabScratch: "Do zero",
    tabTransform: "Transformar uma coluna",
    tabManage: "Gerenciar",
    useTemplate: "Usar este modelo",
    exampleBefore: "Antes",
    exampleAfter: "Depois",
    name: "Nome da coluna",
    namePlaceholder: "ex.: Última rodada de investimento",
    fillLabel: "Como ela é preenchida?",
    fillAi: "A IA preenche",
    fillAiDesc: "Executa o prompt por linha.",
    fillCustom: "Eu mesmo preencho",
    fillCustomDesc: "Começa vazia — digite os valores no modo de edição.",
    prompt: "Prompt de IA",
    output: "Saída",
    outText: "Texto",
    outScore: "Pontuação",
    outYesNo: "Sim / Não",
    cancel: "Cancelar",
    create: "Criar coluna",
    close: "Pronto",
    transformColumn: "Coluna a transformar",
    transformHow: "O que a IA deve fazer?",
    transformApply: "Aplicar a todas as linhas",
    transformed: (n: number) =>
      `${n} ${n === 1 ? "valor atualizado" : "valores atualizados"}`,
    transformHint:
      "Reescreve os valores desta coluna na sua cópia do espaço de trabalho — os dados de origem não são alterados.",
    manageEmpty: "Ainda não há colunas de IA ou personalizadas.",
    renamed: "Coluna atualizada",
    deleted: "Coluna excluída",
    rename: "Renomear",
    deleteAria: (name: string) => `Excluir ${name}`,
    categories: {
      clean: "Limpeza",
      copywrite: "Redação",
      extract: "Extração",
      research: "Pesquisa",
    },
    transforms: {
      titlecase: "Corrigir as maiúsculas (Title Case, mantém as siglas)",
      clean_suffix: "Remover enfeites (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Remover sufixos legais (Inc., LLC, GmbH…)",
      city: "Manter apenas a cidade",
      trim: "Aparar e compactar espaços",
    },
    fields: {
      title: "Cargo",
      company: "Empresa",
      location: "Localização",
      name: "Nome da empresa",
      industry: "Setor",
    },
  },
} as const

/* ------------------------------ templates -------------------------------- */

interface ColumnTemplate {
  id: string
  category: "clean" | "copywrite" | "extract" | "research"
  name: Record<Locale, string>
  desc: Record<Locale, string>
  prompt: Record<Locale, string>
  output: AiColumnOutput
  example?: { before: string; after: string }
}

// Mirrors Lemlist's AI Column Templates gallery, adapted to our fields.
const TEMPLATES: ColumnTemplate[] = [
  {
    id: "clean_job_title",
    category: "clean",
    name: {
      en: "Clean job title",
      es: "Limpiar cargo",
      it: "Pulisci il ruolo",
      fr: "Nettoyer l'intitulé de poste",
      de: "Jobtitel bereinigen",
      pt: "Limpar cargo",
      pt_BR: "Limpar cargo",
    },
    desc: {
      en: "Standardize and clean job titles for consistency.",
      es: "Estandariza y limpia los cargos para mantener consistencia.",
      it: "Standardizza e pulisci i ruoli per mantenerli coerenti.",
      fr: "Standardisez et nettoyez les intitulés de poste pour plus de cohérence.",
      de: "Standardisiere und bereinige Jobtitel für mehr Konsistenz.",
      pt: "Padronize e limpe os cargos para manter a consistência.",
      pt_BR: "Padronize e limpe os cargos para manter a consistência.",
    },
    prompt: {
      en: "Clean and standardize the job title: title case, keep acronyms (CEO, VP…), remove decorations like “- Apply Now!”, never translate.",
      es: "Limpia y estandariza el cargo: mayúsculas de título, conserva siglas (CEO, VP…), elimina adornos como “- Apply Now!”, nunca traduzcas.",
      it: "Pulisci e standardizza il ruolo: Title Case, conserva le sigle (CEO, VP…), rimuovi decorazioni come “- Apply Now!”, non tradurre mai.",
      fr: "Nettoyez et standardisez l'intitulé de poste : Title Case, conservez les sigles (CEO, VP…), supprimez les décorations comme “- Apply Now!”, ne traduisez jamais.",
      de: "Bereinige und standardisiere den Jobtitel: Title Case, Akronyme behalten (CEO, VP…), Zusätze wie “- Apply Now!” entfernen, niemals übersetzen.",
      pt: "Limpe e padronize o cargo: Title Case, mantenha as siglas (CEO, VP…), remova adornos como “- Apply Now!”, nunca traduza.",
      pt_BR: "Limpe e padronize o cargo: Title Case, mantenha as siglas (CEO, VP…), remova enfeites como “- Apply Now!”, nunca traduza.",
    },
    output: "text",
    example: { before: "VP of Marketing - Apply Now!", after: "VP of Marketing" },
  },
  {
    id: "clean_company",
    category: "clean",
    name: {
      en: "Clean company name",
      es: "Limpiar nombre de empresa",
      it: "Pulisci il nome dell'azienda",
      fr: "Nettoyer le nom de l'entreprise",
      de: "Unternehmensnamen bereinigen",
      pt: "Limpar nome da empresa",
      pt_BR: "Limpar nome da empresa",
    },
    desc: {
      en: "Drop legal suffixes and decorations from company names.",
      es: "Quita sufijos legales y adornos de los nombres de empresa.",
      it: "Rimuovi suffissi legali e decorazioni dai nomi delle aziende.",
      fr: "Supprimez les suffixes légaux et les décorations des noms d'entreprise.",
      de: "Entferne Rechtsformzusätze und Beiwerk aus Unternehmensnamen.",
      pt: "Remova sufixos legais e adornos dos nomes das empresas.",
      pt_BR: "Remova sufixos legais e enfeites dos nomes das empresas.",
    },
    prompt: {
      en: "Clean the company name: remove legal suffixes (Inc., LLC, GmbH, S.L.) and taglines, keep the brand name only.",
      es: "Limpia el nombre de la empresa: quita sufijos legales (Inc., LLC, GmbH, S.L.) y eslóganes, deja solo la marca.",
      it: "Pulisci il nome dell'azienda: rimuovi i suffissi legali (Inc., LLC, GmbH, S.L.) e gli slogan, lascia solo il brand.",
      fr: "Nettoyez le nom de l'entreprise : supprimez les suffixes légaux (Inc., LLC, GmbH, S.L.) et les slogans, gardez uniquement la marque.",
      de: "Bereinige den Unternehmensnamen: Rechtsformzusätze (Inc., LLC, GmbH, S.L.) und Slogans entfernen, nur den Markennamen behalten.",
      pt: "Limpe o nome da empresa: remova sufixos legais (Inc., LLC, GmbH, S.L.) e slogans, deixe apenas a marca.",
      pt_BR: "Limpe o nome da empresa: remova sufixos legais (Inc., LLC, GmbH, S.L.) e slogans, deixe apenas a marca.",
    },
    output: "text",
    example: { before: "Acme Corp, Inc. — We're hiring!", after: "Acme" },
  },
  {
    id: "icebreaker_desc",
    category: "copywrite",
    name: {
      en: "Icebreaker from description",
      es: "Rompehielos desde la descripción",
      it: "Rompighiaccio dalla descrizione",
      fr: "Brise-glace à partir de la description",
      de: "Eisbrecher aus der Beschreibung",
      pt: "Quebra-gelo a partir da descrição",
      pt_BR: "Quebra-gelo a partir da descrição",
    },
    desc: {
      en: "A one-line personalized opener from the company description.",
      es: "Una primera línea personalizada a partir de la descripción de la empresa.",
      it: "Una frase di apertura personalizzata basata sulla descrizione dell'azienda.",
      fr: "Une phrase d'ouverture personnalisée à partir de la description de l'entreprise.",
      de: "Ein personalisierter Einzeiler auf Basis der Unternehmensbeschreibung.",
      pt: "Uma primeira linha personalizada a partir da descrição da empresa.",
      pt_BR: "Uma primeira linha personalizada a partir da descrição da empresa.",
    },
    prompt: {
      en: "Write a one-line, non-salesy icebreaker referencing what the company does.",
      es: "Escribe un rompehielos de una línea, sin sonar a venta, mencionando lo que hace la empresa.",
      it: "Scrivi un rompighiaccio di una riga, senza tono commerciale, che citi cosa fa l'azienda.",
      fr: "Rédigez un brise-glace d'une ligne, sans ton commercial, qui mentionne ce que fait l'entreprise.",
      de: "Schreibe einen einzeiligen, nicht werblichen Eisbrecher, der erwähnt, was das Unternehmen macht.",
      pt: "Escreva um quebra-gelo de uma linha, sem tom de venda, mencionando o que a empresa faz.",
      pt_BR: "Escreva um quebra-gelo de uma linha, sem parecer venda, mencionando o que a empresa faz.",
    },
    output: "text",
  },
  {
    id: "icebreaker_news",
    category: "copywrite",
    name: {
      en: "Icebreaker from news",
      es: "Rompehielos desde noticias",
      it: "Rompighiaccio dalle notizie",
      fr: "Brise-glace à partir de l'actualité",
      de: "Eisbrecher aus den News",
      pt: "Quebra-gelo a partir das notícias",
      pt_BR: "Quebra-gelo a partir das notícias",
    },
    desc: {
      en: "An opener referencing the company's latest news or launch.",
      es: "Una apertura que menciona la última noticia o lanzamiento de la empresa.",
      it: "Un'apertura che cita l'ultima notizia o l'ultimo lancio dell'azienda.",
      fr: "Une ouverture qui mentionne la dernière actualité ou le dernier lancement de l'entreprise.",
      de: "Ein Opener, der auf die neueste News oder den letzten Launch des Unternehmens verweist.",
      pt: "Uma abertura que menciona a notícia ou o lançamento mais recente da empresa.",
      pt_BR: "Uma abertura que menciona a notícia ou o lançamento mais recente da empresa.",
    },
    prompt: {
      en: "Find the company's most recent news and write a one-line opener referencing it.",
      es: "Encuentra la noticia más reciente de la empresa y escribe una apertura de una línea que la mencione.",
      it: "Trova la notizia più recente sull'azienda e scrivi un'apertura di una riga che la citi.",
      fr: "Trouvez l'actualité la plus récente de l'entreprise et rédigez une ouverture d'une ligne qui la mentionne.",
      de: "Finde die neueste News des Unternehmens und schreibe einen einzeiligen Opener, der darauf Bezug nimmt.",
      pt: "Encontre a notícia mais recente da empresa e escreva uma abertura de uma linha que a mencione.",
      pt_BR: "Encontre a notícia mais recente da empresa e escreva uma abertura de uma linha que a mencione.",
    },
    output: "text",
  },
  {
    id: "extract_city",
    category: "extract",
    name: {
      en: "Extract city",
      es: "Extraer ciudad",
      it: "Estrai la città",
      fr: "Extraire la ville",
      de: "Stadt extrahieren",
      pt: "Extrair cidade",
      pt_BR: "Extrair cidade",
    },
    desc: {
      en: "Pull just the city out of a full location or address.",
      es: "Extrae solo la ciudad de una ubicación o dirección completa.",
      it: "Estrai solo la città da una località o un indirizzo completo.",
      fr: "Extrayez uniquement la ville d'une localisation ou d'une adresse complète.",
      de: "Zieht nur die Stadt aus einem vollständigen Standort oder einer Adresse.",
      pt: "Extraia apenas a cidade de uma localização ou morada completa.",
      pt_BR: "Extraia apenas a cidade de uma localização ou endereço completo.",
    },
    prompt: {
      en: "Extract only the city from the location field.",
      es: "Extrae solo la ciudad del campo de ubicación.",
      it: "Estrai solo la città dal campo località.",
      fr: "Extrayez uniquement la ville du champ de localisation.",
      de: "Extrahiere nur die Stadt aus dem Standortfeld.",
      pt: "Extraia apenas a cidade do campo de localização.",
      pt_BR: "Extraia apenas a cidade do campo de localização.",
    },
    output: "text",
    example: { before: "Barcelona, Catalonia, Spain", after: "Barcelona" },
  },
  {
    id: "latest_news",
    category: "research",
    name: {
      en: "Find latest company news",
      es: "Buscar últimas noticias",
      it: "Trova le ultime notizie",
      fr: "Trouver les dernières actualités",
      de: "Neueste Unternehmensnews finden",
      pt: "Encontrar as últimas notícias",
      pt_BR: "Encontrar as últimas notícias",
    },
    desc: {
      en: "One line summarizing the company's most recent announcement.",
      es: "Una línea que resume el anuncio más reciente de la empresa.",
      it: "Una riga che riassume l'annuncio più recente dell'azienda.",
      fr: "Une ligne qui résume la dernière annonce de l'entreprise.",
      de: "Eine Zeile, die die neueste Ankündigung des Unternehmens zusammenfasst.",
      pt: "Uma linha que resume o anúncio mais recente da empresa.",
      pt_BR: "Uma linha que resume o anúncio mais recente da empresa.",
    },
    prompt: {
      en: "Search for the company's most recent announcement and summarize it in one line.",
      es: "Busca el anuncio más reciente de la empresa y resúmelo en una línea.",
      it: "Cerca l'annuncio più recente dell'azienda e riassumilo in una riga.",
      fr: "Recherchez la dernière annonce de l'entreprise et résumez-la en une ligne.",
      de: "Suche die neueste Ankündigung des Unternehmens und fasse sie in einer Zeile zusammen.",
      pt: "Pesquise o anúncio mais recente da empresa e resuma-o numa linha.",
      pt_BR: "Pesquise o anúncio mais recente da empresa e resuma em uma linha.",
    },
    output: "text",
  },
  {
    id: "decision_maker",
    category: "research",
    name: {
      en: "Decision maker?",
      es: "¿Decide la compra?",
      it: "Decisore d'acquisto?",
      fr: "Décideur ?",
      de: "Entscheider?",
      pt: "Decisor de compra?",
      pt_BR: "Decisor de compra?",
    },
    desc: {
      en: "Whether this person likely owns the buying decision.",
      es: "Si esta persona probablemente decide la compra.",
      it: "Se questa persona probabilmente decide l'acquisto.",
      fr: "Indique si cette personne est probablement décisionnaire de l'achat.",
      de: "Ob diese Person die Kaufentscheidung vermutlich trifft.",
      pt: "Se esta pessoa provavelmente decide a compra.",
      pt_BR: "Se essa pessoa provavelmente decide a compra.",
    },
    prompt: {
      en: "Based on title and seniority, is this person likely a decision maker? Yes or no.",
      es: "Según el cargo y la antigüedad, ¿es probable que esta persona decida la compra? Sí o no.",
      it: "In base a ruolo e anzianità, è probabile che questa persona sia un decisore? Sì o no.",
      fr: "D'après le poste et l'ancienneté, cette personne est-elle probablement décisionnaire ? Oui ou non.",
      de: "Ist diese Person nach Jobtitel und Seniorität vermutlich ein Entscheider? Ja oder nein.",
      pt: "Com base no cargo e na senioridade, é provável que esta pessoa seja decisora? Sim ou não.",
      pt_BR: "Com base no cargo e na senioridade, é provável que essa pessoa seja decisora? Sim ou não.",
    },
    output: "yesno",
  },
  {
    id: "fit_score",
    category: "research",
    name: {
      en: "ICP fit score",
      es: "Puntuación de encaje ICP",
      it: "Punteggio di fit ICP",
      fr: "Score d'adéquation ICP",
      de: "ICP-Fit-Score",
      pt: "Pontuação de encaixe no ICP",
      pt_BR: "Pontuação de fit com o ICP",
    },
    desc: {
      en: "Scores each row against your primary ICP, 0-100.",
      es: "Puntúa cada fila contra tu ICP principal, 0-100.",
      it: "Valuta ogni riga rispetto al tuo ICP principale, 0-100.",
      fr: "Note chaque ligne par rapport à votre ICP principal, 0-100.",
      de: "Bewertet jede Zeile gegen dein primäres ICP, 0-100.",
      pt: "Pontua cada linha em relação ao seu ICP principal, 0-100.",
      pt_BR: "Pontua cada linha em relação ao seu ICP principal, 0-100.",
    },
    prompt: {
      en: "Score how well this record matches our primary ICP, 0-100.",
      es: "Puntúa qué tan bien encaja este registro con nuestro ICP principal, 0-100.",
      it: "Valuta quanto questo record corrisponde al nostro ICP principale, 0-100.",
      fr: "Évaluez dans quelle mesure cette fiche correspond à notre ICP principal, 0-100.",
      de: "Bewerte, wie gut dieser Datensatz zu unserem primären ICP passt, 0-100.",
      pt: "Pontue até que ponto este registo corresponde ao nosso ICP principal, 0-100.",
      pt_BR: "Pontue o quanto este registro corresponde ao nosso ICP principal, 0-100.",
    },
    output: "score",
  },
]

/* ------------------------------ transforms ------------------------------- */

const ACRONYMS = new Set(["CEO", "CTO", "CFO", "COO", "CMO", "CRO", "VP", "HR", "IT", "SDR", "AE"])

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => {
      const bare = w.replace(/[^A-Za-z]/g, "").toUpperCase()
      if (ACRONYMS.has(bare)) return w.toUpperCase()
      if (/^(of|the|and|for|de|la|el|y)$/i.test(w)) return w.toLowerCase()
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(" ")
}

type TransformId = "titlecase" | "clean_suffix" | "company_suffix" | "city" | "trim"

const TRANSFORMERS: Record<TransformId, (v: string) => string> = {
  titlecase: (v) => titleCase(v.trim()),
  clean_suffix: (v) => v.split(/\s+[-–|(]/)[0].trim(),
  company_suffix: (v) =>
    v
      .replace(/[,]?\s*(inc\.?|llc|ltd\.?|gmbh|s\.l\.|s\.a\.|corp\.?)\s*$/i, "")
      .trim(),
  city: (v) => v.split(",")[0].trim(),
  trim: (v) => v.replace(/\s+/g, " ").trim(),
}

// The base record fields the transform mode can rewrite, per entity.
const PEOPLE_FIELDS = ["title", "company", "location"] as const
const COMPANY_FIELDS = ["name", "industry", "location"] as const

/* -------------------------------- dialog --------------------------------- */

type Mode = "templates" | "scratch" | "transform" | "manage"

export function AddAiColumnDialog({
  open,
  onOpenChange,
  entity,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  entity: AiColumnEntity
  onCreated?: (id: string) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const prospects = useProspects()
  const accounts = useAccounts()
  const ownColumns = useAiColumns(entity)

  const [mode, setMode] = React.useState<Mode>("templates")
  const [name, setName] = React.useState("")
  const [prompt, setPrompt] = React.useState("")
  const [output, setOutput] = React.useState<AiColumnOutput>("text")
  const [kind, setKind] = React.useState<AiColumnKind>("ai")
  const [transformField, setTransformField] = React.useState<string>(
    entity === "company" ? "name" : "title"
  )
  const [transformId, setTransformId] = React.useState<TransformId>("titlecase")
  const [wasOpen, setWasOpen] = React.useState(false)

  if (open && !wasOpen) {
    setWasOpen(true)
    setMode("templates")
    setName("")
    setPrompt("")
    setOutput("text")
    setKind("ai")
    setTransformField(entity === "company" ? "name" : "title")
    setTransformId("titlecase")
  }
  if (!open && wasOpen) setWasOpen(false)

  const outputs: { value: AiColumnOutput; label: string; icon: typeof Type }[] = [
    { value: "text", label: c.outText, icon: Type },
    { value: "score", label: c.outScore, icon: Gauge },
    { value: "yesno", label: c.outYesNo, icon: ToggleLeft },
  ]

  const canCreate =
    name.trim().length > 0 && (kind === "custom" || prompt.trim().length > 0)

  function create() {
    if (!canCreate) return
    const col = aiColumnStore.add({
      entity,
      label: name.trim(),
      prompt: prompt.trim(),
      output: kind === "custom" ? "text" : output,
      kind,
    })
    onCreated?.(col.id)
    onOpenChange(false)
  }

  function applyTemplate(t: ColumnTemplate) {
    setName(t.name[locale])
    setPrompt(t.prompt[locale])
    setOutput(t.output)
    setKind("ai")
    setMode("scratch")
  }

  // Rewrite an existing column's values (the user's workspace copy).
  function applyTransform() {
    const fn = TRANSFORMERS[transformId]
    let changed = 0
    const isCustomCol = transformField.startsWith("ai_")
    if (isCustomCol) {
      const col = ownColumns.find((x) => x.id === transformField)
      const rows = entity === "company" ? accounts : prospects
      rows.forEach((r) => {
        const cur = col?.values?.[r.id] ?? ""
        const next = fn(cur)
        if (cur && next !== cur) {
          aiColumnStore.setValue(transformField, r.id, next)
          changed++
        }
      })
    } else if (entity === "company") {
      accounts.forEach((a) => {
        const cur = String(a[transformField as (typeof COMPANY_FIELDS)[number]] ?? "")
        const next = fn(cur)
        if (cur && next !== cur) {
          accountStore.update(a.id, { [transformField]: next })
          changed++
        }
      })
    } else {
      prospects.forEach((p) => {
        const cur = String(p[transformField as (typeof PEOPLE_FIELDS)[number]] ?? "")
        const next = fn(cur)
        if (cur && next !== cur) {
          prospectStore.update(p.id, { [transformField]: next })
          changed++
        }
      })
    }
    toast.success(c.transformed(changed))
    onOpenChange(false)
  }

  const baseFields = entity === "company" ? COMPANY_FIELDS : PEOPLE_FIELDS
  const textColumns = ownColumns.filter((x) => x.output === "text")

  const tabs: { key: Mode; label: string; icon: typeof Type }[] = [
    { key: "templates", label: c.tabTemplates, icon: LayoutGrid },
    { key: "scratch", label: c.tabScratch, icon: Pencil },
    { key: "transform", label: c.tabTransform, icon: Wand2 },
    { key: "manage", label: c.tabManage, icon: Settings2 },
  ]

  const grouped = new Map<ColumnTemplate["category"], ColumnTemplate[]>()
  for (const t of TEMPLATES) grouped.set(t.category, [...(grouped.get(t.category) ?? []), t])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        {/* Mode tabs */}
        <div className="bg-muted flex w-fit max-w-full flex-wrap rounded-lg p-[3px]">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = mode === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setMode(t.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>

        {mode === "templates" && (
          <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
            {[...grouped.entries()].map(([cat, items]) => (
              <div key={cat}>
                <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
                  {c.categories[cat]}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="hover:border-primary/40 hover:bg-muted/40 rounded-lg border p-3 text-left transition-colors"
                    >
                      <p className="text-sm font-medium">{t.name[locale]}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {t.desc[locale]}
                      </p>
                      {t.example && (
                        <p className="text-muted-foreground mt-1.5 truncate text-[11px]">
                          <span className="line-through opacity-70">
                            {t.example.before}
                          </span>{" "}
                          → <span className="text-foreground">{t.example.after}</span>
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {mode === "scratch" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-col-name">{c.name}</Label>
              <Input
                id="ai-col-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.namePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label>{c.fillLabel}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { v: "ai", label: c.fillAi, desc: c.fillAiDesc, icon: Sparkles },
                    { v: "custom", label: c.fillCustom, desc: c.fillCustomDesc, icon: Pencil },
                  ] as const
                ).map((o) => {
                  const Icon = o.icon
                  const active = kind === o.v
                  return (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setKind(o.v)}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors",
                        active
                          ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs font-medium">{o.label}</span>
                      <span className="text-muted-foreground text-[11px]">
                        {o.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {kind === "ai" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ai-col-prompt">{c.prompt}</Label>
                  <Textarea
                    id="ai-col-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{c.output}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {outputs.map((o) => {
                      const Icon = o.icon
                      const isActive = output === o.value
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setOutput(o.value)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-colors",
                            isActive
                              ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                              : "hover:bg-muted/60"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          {o.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {mode === "transform" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{c.transformColumn}</Label>
              <Select value={transformField} onValueChange={setTransformField}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {baseFields.map((f) => (
                    <SelectItem key={f} value={f}>
                      {c.fields[f]}
                    </SelectItem>
                  ))}
                  {textColumns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{c.transformHow}</Label>
              <div className="grid gap-2">
                {(Object.keys(TRANSFORMERS) as TransformId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTransformId(id)}
                    className={cn(
                      "rounded-lg border p-2.5 text-left text-sm transition-colors",
                      transformId === id
                        ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                        : "hover:bg-muted/60"
                    )}
                  >
                    {c.transforms[id]}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">{c.transformHint}</p>
            </div>
          </div>
        )}

        {mode === "manage" && (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            {ownColumns.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {c.manageEmpty}
              </p>
            ) : (
              ownColumns.map((col) => (
                <div key={col.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <Input
                    value={col.label}
                    aria-label={c.rename}
                    onChange={(e) =>
                      aiColumnStore.update(col.id, { label: e.target.value })
                    }
                    className="h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.deleteAria(col.label)}
                    className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                    onClick={() => {
                      aiColumnStore.remove(col.id)
                      toast.success(c.deleted)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          {mode === "scratch" && (
            <Button variant="volt" onClick={create} disabled={!canCreate}>
              <Sparkles className="size-4" />
              {c.create}
            </Button>
          )}
          {mode === "transform" && (
            <Button variant="volt" onClick={applyTransform}>
              <Wand2 className="size-4" />
              {c.transformApply}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
