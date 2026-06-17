import * as React from "react"
import { toast } from "sonner"
import { ArrowUp, ArrowDown, Mail, Plus, Trash2 } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
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
import type { Channel } from "@/lib/types"

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
  const activeCount = products.filter((p) => p.active).length

  function toggleProduct(id: string) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const next = { ...p, active: !p.active }
        toast(next.active ? `${p.name} enabled` : `${p.name} disabled`)
        return next
      })
    )
  }

  function addProduct() {
    setProducts((prev) => {
      const product: PlaybookProduct = {
        id: newProductId(),
        name: "New product",
        description: "Describe this product…",
        active: true,
      }
      toast(`${product.name} added`)
      return [...prev, product]
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm tabular-nums">
        {activeCount} of {products.length} products active
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
                aria-label={`Toggle ${product.name}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addProduct}>
        <Plus className="size-4" />
        Add product
      </Button>
    </div>
  )
}

function ValuePropsTab({ products }: { products: PlaybookProduct[] }) {
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
                        placeholder="Describe a value prop…"
                        onChange={(e) => updateRow(row.id, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove value prop"
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No value props yet.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addRow(product.id)}
              >
                <Plus className="size-4" />
                Add value prop
              </Button>
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Value props saved")}>
          Save value props
        </Button>
      </div>
    </div>
  )
}

function TemplatesTab() {
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
      <p className="text-muted-foreground text-sm">
        Kai prefers higher-ranked templates when drafting first-touch outreach.
      </p>

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
                      aria-label="Move template up"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Move template down"
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
        <Button onClick={() => toast.success("Template order saved")}>
          Save order
        </Button>
      </div>
    </div>
  )
}

export default function Playbook() {
  const [products, setProducts] = React.useState<PlaybookProduct[]>(() =>
    playbookProducts.map((p) => ({ ...p }))
  )

  return (
    <Page className="max-w-3xl">
      <PageHeading
        title="Outreach Playbook"
        description="Configure the products, value props, and templates Kai uses to draft outreach."
      />

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="value-props">Value props</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
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
