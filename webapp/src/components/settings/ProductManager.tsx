import * as React from "react"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Pencil, Trash2, Package } from "lucide-react"

import { useLocale } from "@/lib/locale"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useProducts, productStore, type Product } from "@/lib/mock-products"

const COPY = {
  en: {
    title: "Products to Sell",
    description:
      "The specific products or services your team pitches — each gets its own USP so outreach can speak to it directly.",
    addProduct: "Add product",
    edit: "Edit",
    delete: "Delete",
    actions: "Product actions",
    newTitle: "New product",
    editTitle: "Edit product",
    formDesc: "Give the product a name and its core selling point.",
    name: "Product name",
    namePlaceholder: "e.g. Kombo Platform",
    usp: "Unique selling point",
    uspPlaceholder: "What makes this product worth buying?",
    cancel: "Cancel",
    save: "Save product",
    created: "Product created",
    updated: "Product updated",
    deleted: "Product deleted",
    deleteTitle: "Delete product?",
    deleteDesc: (name: string) => `"${name}" will be permanently removed.`,
    deleteConfirm: "Delete",
    nameRequired: "Give the product a name.",
  },
  es: {
    title: "Productos a vender",
    description:
      "Los productos o servicios concretos que ofrece tu equipo — cada uno tiene su propia propuesta de valor para que la prospección hable directamente de él.",
    addProduct: "Añadir producto",
    edit: "Editar",
    delete: "Eliminar",
    actions: "Acciones del producto",
    newTitle: "Nuevo producto",
    editTitle: "Editar producto",
    formDesc: "Ponle un nombre al producto y define su punto de venta clave.",
    name: "Nombre del producto",
    namePlaceholder: "ej. Kombo Platform",
    usp: "Propuesta de valor",
    uspPlaceholder: "¿Qué hace que este producto valga la pena?",
    cancel: "Cancelar",
    save: "Guardar producto",
    created: "Producto creado",
    updated: "Producto actualizado",
    deleted: "Producto eliminado",
    deleteTitle: "¿Eliminar producto?",
    deleteDesc: (name: string) => `"${name}" se eliminará de forma permanente.`,
    deleteConfirm: "Eliminar",
    nameRequired: "Dale un nombre al producto.",
  },
  it: {
    title: "Prodotti da vendere",
    description:
      "I prodotti o servizi specifici proposti dal tuo team — ognuno ha la propria value proposition per personalizzare l'outreach.",
    addProduct: "Aggiungi prodotto",
    edit: "Modifica",
    delete: "Elimina",
    actions: "Azioni prodotto",
    newTitle: "Nuovo prodotto",
    editTitle: "Modifica prodotto",
    formDesc: "Assegna un nome al prodotto e definisci il suo punto di forza.",
    name: "Nome del prodotto",
    namePlaceholder: "es. Kombo Platform",
    usp: "Punto di forza",
    uspPlaceholder: "Cosa rende vantaggioso questo prodotto?",
    cancel: "Annulla",
    save: "Salva prodotto",
    created: "Prodotto creato",
    updated: "Prodotto aggiornato",
    deleted: "Prodotto eliminato",
    deleteTitle: "Eliminare il prodotto?",
    deleteDesc: (name: string) => `"${name}" verrà rimosso in modo permanente.`,
    deleteConfirm: "Elimina",
    nameRequired: "Assegna un nome al prodotto.",
  },
  fr: {
    title: "Produits à vendre",
    description:
      "Les produits ou services précis que votre équipe propose — chacun a son propre argument de vente pour personnaliser la prospection.",
    addProduct: "Ajouter un produit",
    edit: "Modifier",
    delete: "Supprimer",
    actions: "Actions produit",
    newTitle: "Nouveau produit",
    editTitle: "Modifier le produit",
    formDesc: "Donnez un nom au produit et définissez son argument clé.",
    name: "Nom du produit",
    namePlaceholder: "ex. Kombo Platform",
    usp: "Argument de vente",
    uspPlaceholder: "Qu'est-ce qui rend ce produit intéressant ?",
    cancel: "Annuler",
    save: "Enregistrer le produit",
    created: "Produit créé",
    updated: "Produit mis à jour",
    deleted: "Produit supprimé",
    deleteTitle: "Supprimer le produit ?",
    deleteDesc: (name: string) => `"${name}" sera définitivement supprimé.`,
    deleteConfirm: "Supprimer",
    nameRequired: "Donnez un nom au produit.",
  },
  de: {
    title: "Zu verkaufende Produkte",
    description:
      "Die konkreten Produkte oder Leistungen, die dein Team verkauft — jedes mit eigenem Alleinstellungsmerkmal für gezielte Ansprache.",
    addProduct: "Produkt hinzufügen",
    edit: "Bearbeiten",
    delete: "Löschen",
    actions: "Produktaktionen",
    newTitle: "Neues Produkt",
    editTitle: "Produkt bearbeiten",
    formDesc: "Gib dem Produkt einen Namen und sein wichtigstes Verkaufsargument.",
    name: "Produktname",
    namePlaceholder: "z. B. Kombo Platform",
    usp: "Alleinstellungsmerkmal",
    uspPlaceholder: "Was macht dieses Produkt überzeugend?",
    cancel: "Abbrechen",
    save: "Produkt speichern",
    created: "Produkt erstellt",
    updated: "Produkt aktualisiert",
    deleted: "Produkt gelöscht",
    deleteTitle: "Produkt löschen?",
    deleteDesc: (name: string) => `"${name}" wird endgültig entfernt.`,
    deleteConfirm: "Löschen",
    nameRequired: "Gib dem Produkt einen Namen.",
  },
  pt: {
    title: "Produtos para vender",
    description:
      "Os produtos ou serviços concretos que a tua equipa vende — cada um com a sua proposta de valor para a prospeção falar diretamente disso.",
    addProduct: "Adicionar produto",
    edit: "Editar",
    delete: "Eliminar",
    actions: "Ações do produto",
    newTitle: "Novo produto",
    editTitle: "Editar produto",
    formDesc: "Dá um nome ao produto e define o seu principal argumento de venda.",
    name: "Nome do produto",
    namePlaceholder: "ex. Kombo Platform",
    usp: "Proposta de valor",
    uspPlaceholder: "O que torna este produto interessante?",
    cancel: "Cancelar",
    save: "Guardar produto",
    created: "Produto criado",
    updated: "Produto atualizado",
    deleted: "Produto eliminado",
    deleteTitle: "Eliminar o produto?",
    deleteDesc: (name: string) => `"${name}" será removido permanentemente.`,
    deleteConfirm: "Eliminar",
    nameRequired: "Dê um nome ao produto.",
  },
  pt_BR: {
    title: "Produtos para vender",
    description:
      "Os produtos ou serviços específicos que seu time vende — cada um com sua própria proposta de valor para personalizar a prospecção.",
    addProduct: "Adicionar produto",
    edit: "Editar",
    delete: "Excluir",
    actions: "Ações do produto",
    newTitle: "Novo produto",
    editTitle: "Editar produto",
    formDesc: "Dê um nome ao produto e defina seu principal argumento de venda.",
    name: "Nome do produto",
    namePlaceholder: "ex.: Kombo Platform",
    usp: "Proposta de valor",
    uspPlaceholder: "O que torna esse produto interessante?",
    cancel: "Cancelar",
    save: "Salvar produto",
    created: "Produto criado",
    updated: "Produto atualizado",
    deleted: "Produto excluído",
    deleteTitle: "Excluir o produto?",
    deleteDesc: (name: string) => `"${name}" será removido permanentemente.`,
    deleteConfirm: "Excluir",
    nameRequired: "Dê um nome ao produto.",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export function ProductManager() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const products = useProducts()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Product | undefined>(undefined)
  const [deleting, setDeleting] = React.useState<Product | undefined>(
    undefined
  )

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setFormOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{c.title}</CardTitle>
          <CardDescription>{c.description}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          {c.addProduct}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="relative rounded-lg border p-4">
            <div className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary mt-1 flex size-7 shrink-0 items-center justify-center rounded-md">
                <Package className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {product.name}
                </p>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                  {product.usp}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.actions}
                    className="size-8 shrink-0"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => openEdit(product)}>
                    <Pencil className="size-4" />
                    {c.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={products.length <= 1}
                    onSelect={() => setDeleting(product)}
                  >
                    <Trash2 className="size-4" />
                    {c.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </CardContent>

      <ProductFormDialog
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        c={c}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined)
        }}
        title={c.deleteTitle}
        description={deleting ? c.deleteDesc(deleting.name) : undefined}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (!deleting) return
          productStore.remove(deleting.id)
          toast.success(c.deleted)
          setDeleting(undefined)
        }}
      />
    </Card>
  )
}

function ProductFormDialog({
  open,
  onOpenChange,
  product,
  c,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  c: Copy
}) {
  const [name, setName] = React.useState(product?.name ?? "")
  const [usp, setUsp] = React.useState(product?.usp ?? "")

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error(c.nameRequired)
      return
    }
    const payload = { name: trimmed, usp: usp.trim() }
    if (product) {
      productStore.update(product.id, payload)
      toast.success(c.updated)
    } else {
      productStore.create(payload)
      toast.success(c.created)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? c.editTitle : c.newTitle}</DialogTitle>
          <DialogDescription>{c.formDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">{c.name}</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-usp">{c.usp}</Label>
            <Textarea
              id="product-usp"
              value={usp}
              onChange={(e) => setUsp(e.target.value)}
              placeholder={c.uspPlaceholder}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleSave}>
            {c.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
