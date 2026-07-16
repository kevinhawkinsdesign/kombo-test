import * as React from "react"
import { toast } from "sonner"
import { ArrowUp, ArrowDown, BookOpen, Mail, Plus, Trash2 } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  playbookProducts,
  valueProps,
  defaultTemplatePriority,
} from "@/lib/mock-playbook"
import type { PlaybookProduct, ValueProp } from "@/lib/mock-playbook"
import { emailTemplates } from "@/lib/mock-extra"
import { useLocale } from "@/lib/locale"
import type { Channel } from "@/lib/types"

const COPY = {
  en: {
    productsActive: (active: number, total: number) =>
      `${active} of ${total} products active`,
    toggleProduct: (name: string) => `Toggle ${name}`,
    productEnabled: (name: string) => `${name} enabled`,
    productDisabled: (name: string) => `${name} disabled`,
    newProductName: "New product",
    newProductDescription: "Describe this product…",
    productAdded: (name: string) => `${name} added`,
    addProduct: "Add product",
    valuePropPlaceholder: "Describe a value prop…",
    removeValueProp: "Remove value prop",
    noValueProps: "No value props yet.",
    addValueProp: "Add value prop",
    saveValueProps: "Save value props",
    valuePropsSaved: "Value props saved",
    templatesIntro:
      "Kai prefers higher-ranked templates when drafting first-touch outreach.",
    moveTemplateUp: "Move template up",
    moveTemplateDown: "Move template down",
    saveOrder: "Save order",
    templateOrderSaved: "Template order saved",
    pageTitle: "Outreach Playbook",
    pageDescription:
      "Configure the products, value props, and templates Kai uses to draft outreach.",
    introTitle: "Your team's sales playbook",
    introDescription:
      "Codify what works — messaging, objection handling, and qualification — in one shared place.",
    introPoints: [
      "Standardize discovery & qualification",
      "Objection-handling guidance",
      "Keep the whole team on-message",
    ],
    tabProducts: "Products",
    tabValueProps: "Value props",
    tabTemplates: "Templates",
  },
  es: {
    productsActive: (active: number, total: number) =>
      `${active} de ${total} productos activos`,
    toggleProduct: (name: string) => `Activar o desactivar ${name}`,
    productEnabled: (name: string) => `${name} activado`,
    productDisabled: (name: string) => `${name} desactivado`,
    newProductName: "Producto nuevo",
    newProductDescription: "Describe este producto…",
    productAdded: (name: string) => `${name} añadido`,
    addProduct: "Añadir producto",
    valuePropPlaceholder: "Describe una propuesta de valor…",
    removeValueProp: "Eliminar propuesta de valor",
    noValueProps: "Aún no hay propuestas de valor.",
    addValueProp: "Añadir propuesta de valor",
    saveValueProps: "Guardar propuestas de valor",
    valuePropsSaved: "Propuestas de valor guardadas",
    templatesIntro:
      "Kai prefiere las plantillas mejor clasificadas al redactar el primer contacto.",
    moveTemplateUp: "Subir plantilla",
    moveTemplateDown: "Bajar plantilla",
    saveOrder: "Guardar orden",
    templateOrderSaved: "Orden de plantillas guardado",
    pageTitle: "Estrategia de contacto",
    pageDescription:
      "Configura los productos, propuestas de valor y plantillas que Kai usa para redactar el contacto.",
    introTitle: "La estrategia de ventas de tu equipo",
    introDescription:
      "Documenta lo que funciona — mensajes, manejo de objeciones y cualificación — en un único lugar compartido.",
    introPoints: [
      "Estandariza el descubrimiento y la cualificación",
      "Guía para el manejo de objeciones",
      "Mantén a todo el equipo alineado en el mensaje",
    ],
    tabProducts: "Productos",
    tabValueProps: "Propuestas de valor",
    tabTemplates: "Plantillas",
  },
  it: {
    productsActive: (active: number, total: number) =>
      `${active} di ${total} prodotti attivi`,
    toggleProduct: (name: string) => `Attiva o disattiva ${name}`,
    productEnabled: (name: string) => `${name} attivato`,
    productDisabled: (name: string) => `${name} disattivato`,
    newProductName: "Nuovo prodotto",
    newProductDescription: "Descrivi questo prodotto…",
    productAdded: (name: string) => `${name} aggiunto`,
    addProduct: "Aggiungi prodotto",
    valuePropPlaceholder: "Descrivi una proposta di valore…",
    removeValueProp: "Rimuovi proposta di valore",
    noValueProps: "Ancora nessuna proposta di valore.",
    addValueProp: "Aggiungi proposta di valore",
    saveValueProps: "Salva proposte di valore",
    valuePropsSaved: "Proposte di valore salvate",
    templatesIntro:
      "Kai preferisce i modelli con il punteggio più alto per scrivere il primo contatto.",
    moveTemplateUp: "Sposta modello in alto",
    moveTemplateDown: "Sposta modello in basso",
    saveOrder: "Salva ordine",
    templateOrderSaved: "Ordine dei modelli salvato",
    pageTitle: "Playbook di outreach",
    pageDescription:
      "Configura i prodotti, le proposte di valore e i modelli che Kai usa per scrivere l'outreach.",
    introTitle: "Il playbook di vendita del tuo team",
    introDescription:
      "Codifica ciò che funziona — messaggistica, gestione delle obiezioni e qualificazione — in un unico posto condiviso.",
    introPoints: [
      "Standardizza discovery e qualificazione",
      "Guida per la gestione delle obiezioni",
      "Mantieni tutto il team allineato nel messaggio",
    ],
    tabProducts: "Prodotti",
    tabValueProps: "Proposte di valore",
    tabTemplates: "Modelli",
  },
  fr: {
    productsActive: (active: number, total: number) =>
      `${active} sur ${total} produits actifs`,
    toggleProduct: (name: string) => `Activer ou désactiver ${name}`,
    productEnabled: (name: string) => `${name} activé`,
    productDisabled: (name: string) => `${name} désactivé`,
    newProductName: "Nouveau produit",
    newProductDescription: "Décrivez ce produit…",
    productAdded: (name: string) => `${name} ajouté`,
    addProduct: "Ajouter un produit",
    valuePropPlaceholder: "Décrivez une proposition de valeur…",
    removeValueProp: "Supprimer la proposition de valeur",
    noValueProps: "Aucune proposition de valeur pour le moment.",
    addValueProp: "Ajouter une proposition de valeur",
    saveValueProps: "Enregistrer les propositions de valeur",
    valuePropsSaved: "Propositions de valeur enregistrées",
    templatesIntro:
      "Kai privilégie les modèles les mieux classés lors de la rédaction du premier contact.",
    moveTemplateUp: "Monter le modèle",
    moveTemplateDown: "Descendre le modèle",
    saveOrder: "Enregistrer l'ordre",
    templateOrderSaved: "Ordre des modèles enregistré",
    pageTitle: "Playbook de prospection",
    pageDescription:
      "Configurez les produits, les propositions de valeur et les modèles que Kai utilise pour rédiger la prospection.",
    introTitle: "Le playbook commercial de votre équipe",
    introDescription:
      "Formalisez ce qui fonctionne — messages, gestion des objections et qualification — en un seul endroit partagé.",
    introPoints: [
      "Standardisez la découverte et la qualification",
      "Conseils pour la gestion des objections",
      "Gardez toute l'équipe alignée sur le message",
    ],
    tabProducts: "Produits",
    tabValueProps: "Propositions de valeur",
    tabTemplates: "Modèles",
  },
  de: {
    productsActive: (active: number, total: number) =>
      `${active} von ${total} Produkten aktiv`,
    toggleProduct: (name: string) => `${name} umschalten`,
    productEnabled: (name: string) => `${name} aktiviert`,
    productDisabled: (name: string) => `${name} deaktiviert`,
    newProductName: "Neues Produkt",
    newProductDescription: "Beschreibe dieses Produkt…",
    productAdded: (name: string) => `${name} hinzugefügt`,
    addProduct: "Produkt hinzufügen",
    valuePropPlaceholder: "Beschreibe eine Value Proposition…",
    removeValueProp: "Value Proposition entfernen",
    noValueProps: "Noch keine Value Propositions.",
    addValueProp: "Value Proposition hinzufügen",
    saveValueProps: "Value Propositions speichern",
    valuePropsSaved: "Value Propositions gespeichert",
    templatesIntro:
      "Kai bevorzugt höher eingestufte Vorlagen beim Verfassen der Erstansprache.",
    moveTemplateUp: "Vorlage nach oben verschieben",
    moveTemplateDown: "Vorlage nach unten verschieben",
    saveOrder: "Reihenfolge speichern",
    templateOrderSaved: "Vorlagenreihenfolge gespeichert",
    pageTitle: "Outreach-Playbook",
    pageDescription:
      "Konfiguriere die Produkte, Value Propositions und Vorlagen, die Kai für die Erstansprache nutzt.",
    introTitle: "Das Sales-Playbook deines Teams",
    introDescription:
      "Halte fest, was funktioniert — Messaging, Einwandbehandlung und Qualifizierung — an einem gemeinsamen Ort.",
    introPoints: [
      "Discovery & Qualifizierung standardisieren",
      "Leitfaden zur Einwandbehandlung",
      "Das gesamte Team auf eine einheitliche Botschaft ausrichten",
    ],
    tabProducts: "Produkte",
    tabValueProps: "Value Propositions",
    tabTemplates: "Vorlagen",
  },
  pt: {
    productsActive: (active: number, total: number) =>
      `${active} de ${total} produtos ativos`,
    toggleProduct: (name: string) => `Ativar ou desativar ${name}`,
    productEnabled: (name: string) => `${name} ativado`,
    productDisabled: (name: string) => `${name} desativado`,
    newProductName: "Novo produto",
    newProductDescription: "Descreva este produto…",
    productAdded: (name: string) => `${name} adicionado`,
    addProduct: "Adicionar produto",
    valuePropPlaceholder: "Descreva uma proposta de valor…",
    removeValueProp: "Remover proposta de valor",
    noValueProps: "Ainda sem propostas de valor.",
    addValueProp: "Adicionar proposta de valor",
    saveValueProps: "Guardar propostas de valor",
    valuePropsSaved: "Propostas de valor guardadas",
    templatesIntro:
      "O Kai prefere os modelos mais bem classificados ao redigir o primeiro contacto.",
    moveTemplateUp: "Mover modelo para cima",
    moveTemplateDown: "Mover modelo para baixo",
    saveOrder: "Guardar ordem",
    templateOrderSaved: "Ordem dos modelos guardada",
    pageTitle: "Playbook de outreach",
    pageDescription:
      "Configure os produtos, as propostas de valor e os modelos que o Kai usa para redigir o outreach.",
    introTitle: "O playbook de vendas da sua equipa",
    introDescription:
      "Documente o que funciona — mensagens, gestão de objeções e qualificação — num único local partilhado.",
    introPoints: [
      "Padronize a descoberta e a qualificação",
      "Orientação para a gestão de objeções",
      "Mantenha toda a equipa alinhada na mensagem",
    ],
    tabProducts: "Produtos",
    tabValueProps: "Propostas de valor",
    tabTemplates: "Modelos",
  },
  pt_BR: {
    productsActive: (active: number, total: number) =>
      `${active} de ${total} produtos ativos`,
    toggleProduct: (name: string) => `Ativar ou desativar ${name}`,
    productEnabled: (name: string) => `${name} ativado`,
    productDisabled: (name: string) => `${name} desativado`,
    newProductName: "Novo produto",
    newProductDescription: "Descreva este produto…",
    productAdded: (name: string) => `${name} adicionado`,
    addProduct: "Adicionar produto",
    valuePropPlaceholder: "Descreva uma proposta de valor…",
    removeValueProp: "Remover proposta de valor",
    noValueProps: "Ainda não há propostas de valor.",
    addValueProp: "Adicionar proposta de valor",
    saveValueProps: "Salvar propostas de valor",
    valuePropsSaved: "Propostas de valor salvas",
    templatesIntro:
      "O Kai prefere os modelos mais bem avaliados ao redigir o primeiro contato.",
    moveTemplateUp: "Mover modelo para cima",
    moveTemplateDown: "Mover modelo para baixo",
    saveOrder: "Salvar ordem",
    templateOrderSaved: "Ordem dos modelos salva",
    pageTitle: "Playbook de outreach",
    pageDescription:
      "Configure os produtos, as propostas de valor e os modelos que o Kai usa para redigir o outreach.",
    introTitle: "O playbook de vendas do seu time",
    introDescription:
      "Documente o que funciona — mensagens, tratamento de objeções e qualificação — em um único lugar compartilhado.",
    introPoints: [
      "Padronize a descoberta e a qualificação",
      "Orientação para o tratamento de objeções",
      "Mantenha todo o time alinhado na mensagem",
    ],
    tabProducts: "Produtos",
    tabValueProps: "Propostas de valor",
    tabTemplates: "Modelos",
  },
} as const

let newProductCounter = 0
function newProductId(): string {
  newProductCounter += 1
  return `prod_new_${newProductCounter}`
}

let newValuePropCounter = 0
function newValuePropId(): string {
  newValuePropCounter += 1
  return `vp_new_${newValuePropCounter}`
}

function ChannelIcon({ channel }: { channel: Channel }) {
  return channel === "linkedin" ? (
    <LinkedinIcon className="text-muted-foreground size-4" />
  ) : (
    <Mail className="text-muted-foreground size-4" />
  )
}

function ProductsTab({
  products,
  setProducts,
}: {
  products: PlaybookProduct[]
  setProducts: React.Dispatch<React.SetStateAction<PlaybookProduct[]>>
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const activeCount = products.filter((p) => p.active).length

  function toggleProduct(id: string) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const next = { ...p, active: !p.active }
        toast(next.active ? c.productEnabled(p.name) : c.productDisabled(p.name))
        return next
      })
    )
  }

  function addProduct() {
    setProducts((prev) => {
      const product: PlaybookProduct = {
        id: newProductId(),
        name: c.newProductName,
        description: c.newProductDescription,
        active: true,
      }
      toast(c.productAdded(product.name))
      return [...prev, product]
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm tabular-nums">
        {c.productsActive(activeCount, products.length)}
      </p>

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium">{product.name}</p>
                <p className="text-muted-foreground text-sm">
                  {product.description}
                </p>
              </div>
              <Switch
                checked={product.active}
                onCheckedChange={() => toggleProduct(product.id)}
                aria-label={c.toggleProduct(product.name)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addProduct}>
        <Plus className="size-4" />
        {c.addProduct}
      </Button>
    </div>
  )
}

function ValuePropsTab({ products }: { products: PlaybookProduct[] }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const activeProducts = products.filter((p) => p.active)

  const [rows, setRows] = React.useState<ValueProp[]>(() =>
    valueProps.map((vp) => ({ ...vp }))
  )

  function updateRow(id: string, text: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, text } : r)))
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function addRow(productId: string) {
    setRows((prev) => [
      ...prev,
      { id: newValuePropId(), productId, text: "" },
    ])
  }

  return (
    <div className="space-y-6">
      {activeProducts.map((product) => {
        const productRows = rows.filter((r) => r.productId === product.id)
        return (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-base">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {productRows.length > 0 ? (
                <div className="space-y-2">
                  {productRows.map((row) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="bg-muted-foreground/50 size-1.5 shrink-0 rounded-full"
                      />
                      <Input
                        value={row.text}
                        placeholder={c.valuePropPlaceholder}
                        onChange={(e) => updateRow(row.id, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={c.removeValueProp}
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {c.noValueProps}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addRow(product.id)}
              >
                <Plus className="size-4" />
                {c.addValueProp}
              </Button>
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end">
        <Button variant="volt" onClick={() => toast.success(c.valuePropsSaved)}>
          {c.saveValueProps}
        </Button>
      </div>
    </div>
  )
}

function TemplatesTab() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [order, setOrder] = React.useState<string[]>(() => [
    ...defaultTemplatePriority,
  ])

  function move(index: number, direction: -1 | 1) {
    setOrder((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next
    })
  }

  const resolved = order
    .map((id) => emailTemplates.find((t) => t.id === id))
    .filter((t): t is (typeof emailTemplates)[number] => t !== undefined)

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{c.templatesIntro}</p>

      <ol className="space-y-3">
        {resolved.map((template, i) => {
          const strongReplyRate = template.replyRate >= 20
          return (
            <li key={template.id}>
              <Card>
                <CardContent className="flex items-center gap-3">
                  <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums">
                    {i + 1}
                  </span>
                  <ChannelIcon channel={template.channel} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{template.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {template.folder}
                    </p>
                  </div>
                  <Badge variant={strongReplyRate ? "success" : "secondary"}>
                    <span className="tabular-nums">{template.replyRate}%</span>
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={c.moveTemplateUp}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={c.moveTemplateDown}
                      disabled={i === resolved.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ol>

      <Separator />

      <div className="flex justify-end">
        <Button
          variant="volt"
          onClick={() => toast.success(c.templateOrderSaved)}
        >
          {c.saveOrder}
        </Button>
      </div>
    </div>
  )
}

export default function Playbook() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [products, setProducts] = React.useState<PlaybookProduct[]>(() =>
    playbookProducts.map((p) => ({ ...p }))
  )

  return (
    <Page className="max-w-3xl">
      <PageHeading
        title={c.pageTitle}
        description={c.pageDescription}
      />

      <FeatureIntro
        featureKey="playbook"
        icon={BookOpen}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">{c.tabProducts}</TabsTrigger>
          <TabsTrigger value="value-props">{c.tabValueProps}</TabsTrigger>
          <TabsTrigger value="templates">{c.tabTemplates}</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab products={products} setProducts={setProducts} />
        </TabsContent>

        <TabsContent value="value-props">
          <ValuePropsTab products={products} />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </Page>
  )
}
