import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelectCombobox } from "@/components/common/MultiSelectCombobox"
import { STATUS_META, STATUS_ORDER } from "@/lib/conv-status"
import { useLocale } from "@/lib/locale"
import {
  newFilterCondition,
  newFilterGroup,
  type FolderFilterCondition,
  type FolderFilterField,
  type FolderFilterGroup,
  type FolderFilterOperator,
} from "@/lib/inbox-folders"
import type { ConvStatus, Prospect } from "@/lib/types"

const FIELD_ORDER: FolderFilterField[] = [
  "outcome",
  "company",
  "industry",
  "seniority",
  "department",
  "tags",
  "score",
]
const CATEGORICAL_OPS: FolderFilterOperator[] = ["is", "is_not"]
const NUMERIC_OPS: FolderFilterOperator[] = ["gt", "gte", "lt", "lte"]

const COPY = {
  en: {
    fieldLabel: {
      outcome: "Outcome",
      company: "Company",
      industry: "Industry",
      seniority: "Seniority",
      department: "Department",
      tags: "Tags",
      score: "Score",
    },
    opLabel: { is: "is", is_not: "is not", gt: ">", gte: "≥", lt: "<", lte: "≤" },
    and: "And",
    or: "Or",
    addCondition: "Add condition",
    addGroup: "Add group (or)",
    removeGroup: "Remove group",
    removeCondition: "Remove condition",
    selectValues: "Select values",
    search: "Search…",
    noOptions: "No options yet.",
    noMatch: "No matches.",
    clearAll: (n: number) => `Clear all (${n})`,
  },
  es: {
    fieldLabel: {
      outcome: "Resultado",
      company: "Empresa",
      industry: "Industria",
      seniority: "Antigüedad",
      department: "Departamento",
      tags: "Etiquetas",
      score: "Puntuación",
    },
    opLabel: { is: "es", is_not: "no es", gt: ">", gte: "≥", lt: "<", lte: "≤" },
    and: "Y",
    or: "O",
    addCondition: "Añadir condición",
    addGroup: "Añadir grupo (o)",
    removeGroup: "Quitar grupo",
    removeCondition: "Quitar condición",
    selectValues: "Selecciona valores",
    search: "Buscar…",
    noOptions: "Aún no hay opciones.",
    noMatch: "Sin coincidencias.",
    clearAll: (n: number) => `Borrar todo (${n})`,
  },
  it: {
    fieldLabel: {
      outcome: "Esito",
      company: "Azienda",
      industry: "Settore",
      seniority: "Seniority",
      department: "Reparto",
      tags: "Tag",
      score: "Punteggio",
    },
    opLabel: { is: "è", is_not: "non è", gt: ">", gte: "≥", lt: "<", lte: "≤" },
    and: "E",
    or: "O",
    addCondition: "Aggiungi condizione",
    addGroup: "Aggiungi gruppo (o)",
    removeGroup: "Rimuovi gruppo",
    removeCondition: "Rimuovi condizione",
    selectValues: "Seleziona valori",
    search: "Cerca…",
    noOptions: "Ancora nessuna opzione.",
    noMatch: "Nessuna corrispondenza.",
    clearAll: (n: number) => `Cancella tutto (${n})`,
  },
  fr: {
    fieldLabel: {
      outcome: "Résultat",
      company: "Entreprise",
      industry: "Secteur",
      seniority: "Ancienneté",
      department: "Département",
      tags: "Étiquettes",
      score: "Score",
    },
    opLabel: { is: "est", is_not: "n'est pas", gt: ">", gte: "≥", lt: "<", lte: "≤" },
    and: "Et",
    or: "Ou",
    addCondition: "Ajouter une condition",
    addGroup: "Ajouter un groupe (ou)",
    removeGroup: "Supprimer le groupe",
    removeCondition: "Supprimer la condition",
    selectValues: "Sélectionner des valeurs",
    search: "Rechercher…",
    noOptions: "Aucune option pour le moment.",
    noMatch: "Aucune correspondance.",
    clearAll: (n: number) => `Tout effacer (${n})`,
  },
  de: {
    fieldLabel: {
      outcome: "Ergebnis",
      company: "Unternehmen",
      industry: "Branche",
      seniority: "Karrierestufe",
      department: "Abteilung",
      tags: "Tags",
      score: "Score",
    },
    opLabel: { is: "ist", is_not: "ist nicht", gt: ">", gte: "≥", lt: "<", lte: "≤" },
    and: "Und",
    or: "Oder",
    addCondition: "Bedingung hinzufügen",
    addGroup: "Gruppe hinzufügen (oder)",
    removeGroup: "Gruppe entfernen",
    removeCondition: "Bedingung entfernen",
    selectValues: "Werte auswählen",
    search: "Suchen…",
    noOptions: "Noch keine Optionen.",
    noMatch: "Keine Treffer.",
    clearAll: (n: number) => `Alles löschen (${n})`,
  },
  pt: {
    fieldLabel: {
      outcome: "Resultado",
      company: "Empresa",
      industry: "Setor",
      seniority: "Senioridade",
      department: "Departamento",
      tags: "Etiquetas",
      score: "Pontuação",
    },
    opLabel: { is: "é", is_not: "não é", gt: ">", gte: "≥", lt: "<", lte: "≤" },
    and: "E",
    or: "Ou",
    addCondition: "Adicionar condição",
    addGroup: "Adicionar grupo (ou)",
    removeGroup: "Remover grupo",
    removeCondition: "Remover condição",
    selectValues: "Selecionar valores",
    search: "Pesquisar…",
    noOptions: "Ainda sem opções.",
    noMatch: "Sem correspondências.",
    clearAll: (n: number) => `Limpar tudo (${n})`,
  },
  pt_BR: {
    fieldLabel: {
      outcome: "Resultado",
      company: "Empresa",
      industry: "Setor",
      seniority: "Senioridade",
      department: "Departamento",
      tags: "Tags",
      score: "Pontuação",
    },
    opLabel: { is: "é", is_not: "não é", gt: ">", gte: "≥", lt: "<", lte: "≤" },
    and: "E",
    or: "Ou",
    addCondition: "Adicionar condição",
    addGroup: "Adicionar grupo (ou)",
    removeGroup: "Remover grupo",
    removeCondition: "Remover condição",
    selectValues: "Selecionar valores",
    search: "Pesquisar…",
    noOptions: "Ainda não há opções.",
    noMatch: "Nenhuma correspondência.",
    clearAll: (n: number) => `Limpar tudo (${n})`,
  },
} as const

// A HubSpot/segment-style two-level filter builder: any number of AND-groups
// of conditions, OR'd together. Used by Inbox's new/edit-folder dialog to
// build a CustomFolder's `filterGroups`. Value options for the curated
// Prospect fields are derived from the actual prospect data passed in,
// rather than a hand-maintained vocabulary, so they never drift out of sync.
export function FolderFilterBuilder({
  groups,
  onChange,
  prospects,
}: {
  groups: FolderFilterGroup[]
  onChange: (groups: FolderFilterGroup[]) => void
  prospects: Prospect[]
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const options = React.useMemo(() => {
    const company = new Set<string>()
    const industry = new Set<string>()
    const seniority = new Set<string>()
    const department = new Set<string>()
    const tags = new Set<string>()
    for (const p of prospects) {
      if (p.company) company.add(p.company)
      if (p.industry) industry.add(p.industry)
      if (p.seniority) seniority.add(p.seniority)
      if (p.department) department.add(p.department)
      p.tags.forEach((t) => tags.add(t))
    }
    return {
      company: Array.from(company).sort(),
      industry: Array.from(industry).sort(),
      seniority: Array.from(seniority).sort(),
      department: Array.from(department).sort(),
      tags: Array.from(tags).sort(),
    }
  }, [prospects])

  function updateGroup(groupId: string, next: FolderFilterGroup) {
    onChange(groups.map((g) => (g.id === groupId ? next : g)))
  }
  function addGroup() {
    onChange([...groups, newFilterGroup()])
  }
  function removeGroup(groupId: string) {
    onChange(groups.filter((g) => g.id !== groupId))
  }
  function addCondition(groupId: string) {
    const g = groups.find((x) => x.id === groupId)
    if (!g) return
    updateGroup(groupId, { ...g, conditions: [...g.conditions, newFilterCondition()] })
  }
  function updateCondition(
    groupId: string,
    condId: string,
    patch: Partial<FolderFilterCondition>
  ) {
    const g = groups.find((x) => x.id === groupId)
    if (!g) return
    updateGroup(groupId, {
      ...g,
      conditions: g.conditions.map((cond) => (cond.id === condId ? { ...cond, ...patch } : cond)),
    })
  }
  function removeCondition(groupId: string, condId: string) {
    const g = groups.find((x) => x.id === groupId)
    if (!g) return
    const nextConditions = g.conditions.filter((cond) => cond.id !== condId)
    if (nextConditions.length === 0) {
      removeGroup(groupId)
    } else {
      updateGroup(groupId, { ...g, conditions: nextConditions })
    }
  }

  return (
    <div className="space-y-3">
      {groups.map((group, gi) => (
        <React.Fragment key={group.id}>
          {gi > 0 && (
            <div className="flex items-center gap-2">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                {c.or}
              </span>
              <div className="bg-border h-px flex-1" />
            </div>
          )}
          <div className="space-y-2 rounded-lg border p-3">
            {group.conditions.map((cond, ci) => (
              <div key={cond.id} className="space-y-1">
                {ci > 0 && (
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                    {c.and}
                  </p>
                )}
                <div className="flex items-start gap-1.5">
                  <Select
                    value={cond.field}
                    onValueChange={(v) => {
                      const field = v as FolderFilterField
                      updateCondition(group.id, cond.id, {
                        field,
                        operator: field === "score" ? "gt" : "is",
                        values: [],
                        numericValue: field === "score" ? 50 : undefined,
                      })
                    }}
                  >
                    <SelectTrigger size="sm" className="w-[122px] shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_ORDER.map((f) => (
                        <SelectItem key={f} value={f}>
                          {c.fieldLabel[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={cond.operator}
                    onValueChange={(v) =>
                      updateCondition(group.id, cond.id, { operator: v as FolderFilterOperator })
                    }
                  >
                    <SelectTrigger size="sm" className="w-[92px] shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(cond.field === "score" ? NUMERIC_OPS : CATEGORICAL_OPS).map((op) => (
                        <SelectItem key={op} value={op}>
                          {c.opLabel[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="min-w-0 flex-1">
                    {cond.field === "score" ? (
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={cond.numericValue ?? 0}
                        onChange={(e) =>
                          updateCondition(group.id, cond.id, {
                            numericValue: Number(e.target.value),
                          })
                        }
                        className="h-8"
                      />
                    ) : cond.field === "outcome" ? (
                      <MultiSelectCombobox<ConvStatus>
                        items={STATUS_ORDER}
                        values={new Set(cond.values as ConvStatus[])}
                        onChange={(next) =>
                          updateCondition(group.id, cond.id, { values: Array.from(next) })
                        }
                        getKey={(s) => s}
                        getLabel={(s) => STATUS_META[s][locale]}
                        placeholder={c.selectValues}
                        searchPlaceholder={c.search}
                        emptyText={c.noOptions}
                        noMatchText={c.noMatch}
                        clearAllLabel={c.clearAll}
                      />
                    ) : (
                      <MultiSelectCombobox<string>
                        items={options[cond.field]}
                        values={new Set(cond.values)}
                        onChange={(next) =>
                          updateCondition(group.id, cond.id, { values: Array.from(next) })
                        }
                        getKey={(s) => s}
                        getLabel={(s) => s}
                        placeholder={c.selectValues}
                        searchPlaceholder={c.search}
                        emptyText={c.noOptions}
                        noMatchText={c.noMatch}
                        clearAllLabel={c.clearAll}
                      />
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => removeCondition(group.id, cond.id)}
                    aria-label={c.removeCondition}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addCondition(group.id)}
              >
                <Plus className="size-3.5" />
                {c.addCondition}
              </Button>
              {groups.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-7 text-xs"
                  onClick={() => removeGroup(group.id)}
                >
                  {c.removeGroup}
                </Button>
              )}
            </div>
          </div>
        </React.Fragment>
      ))}
      <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={addGroup}>
        <Plus className="size-3.5" />
        {c.addGroup}
      </Button>
    </div>
  )
}
