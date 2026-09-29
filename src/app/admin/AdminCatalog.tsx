'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

type Category = { id: string; name: string; slug: string; description: string | null; _count?: { products: number } }
type Image = { url: string; altText: string | null }
type Variant = { name: string; value: string; pricePaise: number; sku: string | null; stock: number }
type Product = { id: string; title: string; slug: string; price: number; salePrice: number | null; sku: string | null; stock: number; status: string; category: Category; images: Image[]; variants: Array<Variant & { id: string }> }
type Coupon = { id: string; code: string; type: string; discountValue: number; minOrderPaise: number | null; maxUses: number | null; uses: number; validUntil: string | null }
type ImageDraft = { url: string; altText: string }
type VariantDraft = { name: string; value: string; price: string; sku: string; stock: string }
type ProductDraft = {
  title: string; slug: string; description: string; categoryId: string; sku: string; price: string; salePrice: string
  gstPercent: string; stock: string; weightGrams: string; lengthCm: string; widthCm: string; heightCm: string
  processingDays: string; isMadeToOrder: boolean; codAllowed: boolean; status: 'DRAFT' | 'PUBLISHED'
  metaTitle: string; metaDescription: string; images: ImageDraft[]; variants: VariantDraft[]
}
type CategoryDraft = { name: string; slug: string; description: string }
type CouponDraft = { code: string; type: 'PERCENT' | 'FLAT'; discountValue: string; minOrder: string; maxUses: string; validUntil: string }

const emptyProduct: ProductDraft = {
  title: '', slug: '', description: '', categoryId: '', sku: '', price: '', salePrice: '', gstPercent: '12', stock: '0', weightGrams: '', lengthCm: '', widthCm: '', heightCm: '', processingDays: '3', isMadeToOrder: false, codAllowed: true, status: 'DRAFT', metaTitle: '', metaDescription: '', images: [{ url: '', altText: '' }], variants: [],
}
const emptyCategory: CategoryDraft = { name: '', slug: '', description: '' }
const emptyCoupon: CouponDraft = { code: '', type: 'PERCENT', discountValue: '', minOrder: '', maxUses: '', validUntil: '' }

function HelpTip({ text }: { text: string }) {
  return <span title={text} aria-label={text} className="ml-2 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-[#c9b79f] text-xs text-[#8a684b]">?</span>
}

function moneyFromPaise(value: number | null) {
  return value === null ? '' : (value / 100).toFixed(2)
}

function paise(value: string) {
  return Math.round(Number(value || 0) * 100)
}

async function responseMessage(response: Response) {
  const data = await response.json().catch(() => ({})) as { message?: string; issues?: { fieldErrors?: Record<string, string[]> } }
  if (!response.ok) {
    const fields = Object.values(data.issues?.fieldErrors || {}).flat()
    throw new Error(fields[0] || data.message || 'Request failed')
  }
  return data
}

export default function AdminCatalog() {
  const [panel, setPanel] = useState<'products' | 'categories' | 'coupons'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProduct)
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategory)
  const [couponDraft, setCouponDraft] = useState<CouponDraft>(emptyCoupon)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null)
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadData() {
    const [productResponse, categoryResponse, couponResponse] = await Promise.all([
      fetch('/api/admin/products'), fetch('/api/admin/categories'), fetch('/api/admin/coupons'),
    ])
    setProducts(await productResponse.json())
    setCategories(await categoryResponse.json())
    setCoupons(await couponResponse.json())
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  function clearNotice() { setMessage(''); setError('') }

  function validateProduct() {
    if (!productDraft.title.trim()) return 'Title is required'
    if (Number(productDraft.price) <= 0) return 'Price must be greater than zero'
    if (productDraft.salePrice && Number(productDraft.salePrice) > Number(productDraft.price)) return 'Sale price cannot exceed price'
    if (Number(productDraft.weightGrams) <= 0) return 'Weight is required'
    if (!productDraft.categoryId) return 'Choose a category'
    if (!productDraft.sku.trim()) return 'SKU is required'
    if (productDraft.images.some((image) => !image.url.trim())) return 'Every image needs a URL or upload'
    return ''
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault(); clearNotice()
    const validationError = validateProduct()
    if (validationError) { setError(validationError); return }
    setBusy(true)
    try {
      const payload = {
        ...productDraft,
        pricePaise: paise(productDraft.price), salePricePaise: productDraft.salePrice ? paise(productDraft.salePrice) : null,
        gstPercent: Number(productDraft.gstPercent), stock: Number(productDraft.stock), weightGrams: Number(productDraft.weightGrams),
        lengthCm: productDraft.lengthCm ? Number(productDraft.lengthCm) : null, widthCm: productDraft.widthCm ? Number(productDraft.widthCm) : null, heightCm: productDraft.heightCm ? Number(productDraft.heightCm) : null,
        processingDays: Number(productDraft.processingDays), metaTitle: productDraft.metaTitle || null, metaDescription: productDraft.metaDescription || null,
        images: productDraft.images.map((image) => ({ url: image.url, altText: image.altText || null })),
        variants: productDraft.variants.map((variant) => ({ name: variant.name, value: variant.value, pricePaise: paise(variant.price), sku: variant.sku || null, stock: Number(variant.stock) })),
      }
      const response = await fetch(editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products', { method: editingProductId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      await responseMessage(response)
      await loadData(); setProductDraft(emptyProduct); setEditingProductId(null); setMessage('Product saved')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Product could not be saved') } finally { setBusy(false) }
  }

  function editProduct(product: Product) {
    setPanel('products'); clearNotice(); setEditingProductId(product.id)
    setProductDraft({ ...emptyProduct, title: product.title, slug: product.slug, categoryId: product.category.id, sku: product.sku || '', price: moneyFromPaise(product.price), salePrice: moneyFromPaise(product.salePrice), stock: String(product.stock), images: product.images.map((image) => ({ url: image.url, altText: image.altText || '' })), variants: product.variants.map((variant) => ({ name: variant.name, value: variant.value, price: moneyFromPaise(variant.pricePaise), sku: variant.sku || '', stock: String(variant.stock) })) })
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= productDraft.images.length) return
    const images = [...productDraft.images]; [images[index], images[nextIndex]] = [images[nextIndex], images[index]]
    setProductDraft({ ...productDraft, images })
  }

  function dropImage(index: number) {
    if (draggedImageIndex === null || draggedImageIndex === index) return
    const images = [...productDraft.images]; const [moved] = images.splice(draggedImageIndex, 1); images.splice(index, 0, moved)
    setProductDraft({ ...productDraft, images }); setDraggedImageIndex(null)
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return
    clearNotice(); setBusy(true)
    try {
      const formData = new FormData(); formData.append('file', file)
      const data = await responseMessage(await fetch('/api/admin/uploads', { method: 'POST', body: formData })) as { url: string }
      const images = productDraft.images.filter((image) => image.url.trim())
      setProductDraft({ ...productDraft, images: [...images, { url: data.url, altText: file.name }] }); setMessage('Image uploaded')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Upload failed') } finally { setBusy(false); event.target.value = '' }
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete ${product.title}? Products with orders are soft-deleted.`)) return
    clearNotice(); const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' }); await responseMessage(response); await loadData(); setMessage('Product deleted')
  }

  async function duplicateProduct(product: Product) {
    clearNotice(); const response = await fetch(`/api/admin/products/${product.id}/duplicate`, { method: 'POST' }); await responseMessage(response); await loadData(); setMessage('Draft copy created')
  }

  async function saveCategory(event: FormEvent) {
    event.preventDefault(); clearNotice(); setBusy(true)
    try { const response = await fetch(editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : '/api/admin/categories', { method: editingCategoryId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...categoryDraft, description: categoryDraft.description || null }) }); await responseMessage(response); await loadData(); setCategoryDraft(emptyCategory); setEditingCategoryId(null); setMessage('Category saved') } catch (caught) { setError(caught instanceof Error ? caught.message : 'Category could not be saved') } finally { setBusy(false) }
  }

  async function deleteCategory(category: Category) { if (!confirm(`Delete ${category.name}?`)) return; const response = await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' }); try { await responseMessage(response); await loadData(); setMessage('Category deleted') } catch (caught) { setError(caught instanceof Error ? caught.message : 'Category could not be deleted') } }

  async function saveCoupon(event: FormEvent) {
    event.preventDefault(); clearNotice(); setBusy(true)
    try { const response = await fetch(editingCouponId ? `/api/admin/coupons/${editingCouponId}` : '/api/admin/coupons', { method: editingCouponId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponDraft.code, type: couponDraft.type, discountValue: Number(couponDraft.discountValue), minOrderPaise: couponDraft.minOrder ? paise(couponDraft.minOrder) : null, maxUses: couponDraft.maxUses ? Number(couponDraft.maxUses) : null, validUntil: couponDraft.validUntil ? new Date(couponDraft.validUntil).toISOString() : null }) }); await responseMessage(response); await loadData(); setCouponDraft(emptyCoupon); setEditingCouponId(null); setMessage('Coupon saved') } catch (caught) { setError(caught instanceof Error ? caught.message : 'Coupon could not be saved') } finally { setBusy(false) }
  }

  async function deleteCoupon(coupon: Coupon) { if (!confirm(`Delete coupon ${coupon.code}?`)) return; const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' }); try { await responseMessage(response); await loadData(); setMessage('Coupon deleted') } catch (caught) { setError(caught instanceof Error ? caught.message : 'Coupon could not be deleted') } }

  const inputClass = 'mt-1 w-full rounded-lg border border-[#d8c7b1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a94e28] focus:ring-2 focus:ring-[#a94e28]/20'
  const buttonClass = 'rounded-lg bg-[#a94e28] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#883e20] disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 border-b border-[#d8c7b1] pb-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a94e28]">Control room</p><h2 className="font-serif text-4xl text-[#4a5d3a]">Catalog</h2><p className="mt-1 text-sm text-[#6f6255]">Keep the shop accurate, calm, and ready to sell.</p></div>
        <span title="Help for the current admin catalog workspace" className="w-fit rounded-full border border-[#c9b79f] px-3 py-1 text-xs text-[#6f6255]">Help</span>
      </div>
      {(message || error) && <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#b8c8a9] bg-[#edf4e8] text-[#3d5b35]'}`}>{error || message}</div>}
      <div className="flex gap-2 overflow-x-auto border-b border-[#d8c7b1] pb-2">
        {(['products', 'categories', 'coupons'] as const).map((item) => <button key={item} type="button" onClick={() => { setPanel(item); clearNotice() }} className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${panel === item ? 'bg-[#4a5d3a] text-white' : 'text-[#4a5d3a] hover:bg-[#e8dcc8]'}`}>{item}</button>)}
      </div>

      {panel === 'products' && <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-serif text-2xl text-[#4a5d3a]">Products <HelpTip text="Published products appear in the public product query; drafts remain admin-only." /></h3><span className="text-sm text-[#6f6255]">{products.length} items</span></div>
          {products.map((product) => <article key={product.id} className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-4 shadow-sm"><div className="flex gap-3"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#e8dcc8]">{product.images[0] ? <img src={product.images[0].url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs">No image</span>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold">{product.title}</h4><span className={`rounded-full px-2 py-0.5 text-xs ${product.status === 'PUBLISHED' ? 'bg-[#dcebd4] text-[#3d5b35]' : 'bg-[#eee3d3] text-[#80684d]'}`}>{product.status}</span></div><p className="truncate text-sm text-[#6f6255]">{product.category.name} · SKU {product.sku || 'missing'} · ₹{(product.price / 100).toFixed(2)}</p><p className="text-xs text-[#8a684b]">{product.variants.length ? `${product.variants.length} variants` : `${product.stock} in stock`} · {product.images.length} images</p></div></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" className="rounded-md border border-[#c9b79f] px-3 py-1.5 text-xs font-semibold" onClick={() => editProduct(product)}>Edit</button><button type="button" className="rounded-md border border-[#c9b79f] px-3 py-1.5 text-xs font-semibold" onClick={() => void duplicateProduct(product)}>Duplicate</button><button type="button" className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700" onClick={() => void deleteProduct(product)}>Delete</button></div></article>)}
        </div>
        <form onSubmit={saveProduct} className="space-y-5 rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-4 shadow-sm sm:p-6"><div className="flex items-center justify-between"><h3 className="font-serif text-2xl text-[#4a5d3a]">{editingProductId ? 'Edit product' : 'New product'} <HelpTip text="Prices are entered in rupees here and stored as integer paise on the server." /></h3>{editingProductId && <button type="button" className="text-xs underline" onClick={() => { setEditingProductId(null); setProductDraft(emptyProduct) }}>Clear</button>}</div><div className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-semibold">Title<input className={inputClass} value={productDraft.title} onChange={(event) => setProductDraft({ ...productDraft, title: event.target.value })} placeholder="Hand-painted monsoon" /></label><label className="text-sm font-semibold">Slug<input className={inputClass} value={productDraft.slug} onChange={(event) => setProductDraft({ ...productDraft, slug: event.target.value })} placeholder="hand-painted-monsoon" /></label><label className="text-sm font-semibold">SKU<input className={inputClass} value={productDraft.sku} onChange={(event) => setProductDraft({ ...productDraft, sku: event.target.value })} placeholder="ART-PAINT-013" /></label><label className="sm:col-span-2 text-sm font-semibold">Category<select className={inputClass} value={productDraft.categoryId} onChange={(event) => setProductDraft({ ...productDraft, categoryId: event.target.value })}><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="sm:col-span-2 text-sm font-semibold">Description<textarea className={inputClass} rows={3} value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} /></label><label className="text-sm font-semibold">Price (₹)<input className={inputClass} type="number" min="0" step="0.01" value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })} /></label><label className="text-sm font-semibold">Sale price (₹)<input className={inputClass} type="number" min="0" step="0.01" value={productDraft.salePrice} onChange={(event) => setProductDraft({ ...productDraft, salePrice: event.target.value })} /></label><label className="text-sm font-semibold">GST %<input className={inputClass} type="number" min="0" max="100" value={productDraft.gstPercent} onChange={(event) => setProductDraft({ ...productDraft, gstPercent: event.target.value })} /></label><label className="text-sm font-semibold">Stock<input className={inputClass} type="number" min="0" value={productDraft.stock} onChange={(event) => setProductDraft({ ...productDraft, stock: event.target.value })} /></label><label className="text-sm font-semibold">Weight (g)<input className={inputClass} type="number" min="1" value={productDraft.weightGrams} onChange={(event) => setProductDraft({ ...productDraft, weightGrams: event.target.value })} /></label><label className="text-sm font-semibold">Processing days<input className={inputClass} type="number" min="0" value={productDraft.processingDays} onChange={(event) => setProductDraft({ ...productDraft, processingDays: event.target.value })} /></label>{(['lengthCm', 'widthCm', 'heightCm'] as const).map((dimension) => <label key={dimension} className="text-sm font-semibold">{dimension.replace('Cm', ' cm')}<input className={inputClass} type="number" min="0" value={productDraft[dimension]} onChange={(event) => setProductDraft({ ...productDraft, [dimension]: event.target.value })} /></label>)}</div><div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={productDraft.isMadeToOrder} onChange={(event) => setProductDraft({ ...productDraft, isMadeToOrder: event.target.checked })} /> Made to order</label><label className="flex items-center gap-2"><input type="checkbox" checked={productDraft.codAllowed} onChange={(event) => setProductDraft({ ...productDraft, codAllowed: event.target.checked })} /> COD allowed</label><label className="flex items-center gap-2">Status<select className="rounded border border-[#d8c7b1] bg-white px-2 py-1" value={productDraft.status} onChange={(event) => setProductDraft({ ...productDraft, status: event.target.value as ProductDraft['status'] })}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label></div><div><div className="mb-2 flex items-center justify-between"><h4 className="font-semibold">Images <HelpTip text="The first image is the cover. Drag rows or use arrows to reorder." /></h4><label className="cursor-pointer rounded-md border border-[#c9b79f] px-3 py-1.5 text-xs font-semibold">Upload mock/Cloudinary<input className="hidden" type="file" accept="image/*" onChange={(event) => void uploadImage(event)} /></label></div><div className="space-y-2">{productDraft.images.map((image, index) => <div key={`${index}-${image.url}`} draggable onDragStart={() => setDraggedImageIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropImage(index)} className="flex gap-2 rounded-lg border border-[#e2d4c2] bg-white p-2"><span className="cursor-grab pt-2 text-[#8a684b]">⠿</span><input className={inputClass} value={image.url} placeholder="Image URL" onChange={(event) => { const images = [...productDraft.images]; images[index] = { ...images[index], url: event.target.value }; setProductDraft({ ...productDraft, images }) }} /><input className={inputClass} value={image.altText} placeholder="Alt text" onChange={(event) => { const images = [...productDraft.images]; images[index] = { ...images[index], altText: event.target.value }; setProductDraft({ ...productDraft, images }) }} /><button type="button" title="Move image up" className="px-1" onClick={() => moveImage(index, -1)}>↑</button><button type="button" title="Move image down" className="px-1" onClick={() => moveImage(index, 1)}>↓</button><button type="button" title="Remove image" className="px-1 text-red-700" onClick={() => setProductDraft({ ...productDraft, images: productDraft.images.filter((_, imageIndex) => imageIndex !== index) })}>×</button></div>)}</div><button type="button" className="mt-2 text-xs font-semibold text-[#a94e28]" onClick={() => setProductDraft({ ...productDraft, images: [...productDraft.images, { url: '', altText: '' }] })}>+ Add image URL</button></div><div><div className="mb-2 flex items-center justify-between"><h4 className="font-semibold">Variants <HelpTip text="Variant products reserve and sell stock from each selected Variant.stock." /></h4><button type="button" className="text-xs font-semibold text-[#a94e28]" onClick={() => setProductDraft({ ...productDraft, variants: [...productDraft.variants, { name: '', value: '', price: productDraft.price, sku: '', stock: '0' }] })}>+ Add variant</button></div><div className="space-y-2">{productDraft.variants.map((variant, index) => <div key={index} className="grid gap-2 rounded-lg border border-[#e2d4c2] bg-white p-2 sm:grid-cols-5"><input className={inputClass} placeholder="Name" value={variant.name} onChange={(event) => { const variants = [...productDraft.variants]; variants[index] = { ...variants[index], name: event.target.value }; setProductDraft({ ...productDraft, variants }) }} /><input className={inputClass} placeholder="Value" value={variant.value} onChange={(event) => { const variants = [...productDraft.variants]; variants[index] = { ...variants[index], value: event.target.value }; setProductDraft({ ...productDraft, variants }) }} /><input className={inputClass} placeholder="Price ₹" type="number" min="0" step="0.01" value={variant.price} onChange={(event) => { const variants = [...productDraft.variants]; variants[index] = { ...variants[index], price: event.target.value }; setProductDraft({ ...productDraft, variants }) }} /><input className={inputClass} placeholder="Stock" type="number" min="0" value={variant.stock} onChange={(event) => { const variants = [...productDraft.variants]; variants[index] = { ...variants[index], stock: event.target.value }; setProductDraft({ ...productDraft, variants }) }} /><button type="button" className="rounded-md text-xs text-red-700" onClick={() => setProductDraft({ ...productDraft, variants: productDraft.variants.filter((_, variantIndex) => variantIndex !== index) })}>Remove</button></div>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">SEO title<input className={inputClass} value={productDraft.metaTitle} onChange={(event) => setProductDraft({ ...productDraft, metaTitle: event.target.value })} /></label><label className="text-sm font-semibold">SEO description<textarea className={inputClass} rows={2} value={productDraft.metaDescription} onChange={(event) => setProductDraft({ ...productDraft, metaDescription: event.target.value })} /></label></div><button className={buttonClass} disabled={busy} type="submit">{busy ? 'Saving...' : editingProductId ? 'Update product' : 'Create product'}</button></form>
      </div>}

      {panel === 'categories' && <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><form onSubmit={saveCategory} className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-5"><h3 className="font-serif text-2xl text-[#4a5d3a]">{editingCategoryId ? 'Edit category' : 'New category'} <HelpTip text="Categories organize the public catalog." /></h3><label className="mt-4 block text-sm font-semibold">Name<input className={inputClass} value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} /></label><label className="mt-4 block text-sm font-semibold">Slug<input className={inputClass} value={categoryDraft.slug} onChange={(event) => setCategoryDraft({ ...categoryDraft, slug: event.target.value })} /></label><label className="mt-4 block text-sm font-semibold">Description<textarea className={inputClass} rows={3} value={categoryDraft.description} onChange={(event) => setCategoryDraft({ ...categoryDraft, description: event.target.value })} /></label><button className={`${buttonClass} mt-4`} disabled={busy}>{editingCategoryId ? 'Update category' : 'Create category'}</button></form><div className="space-y-3"><h3 className="font-serif text-2xl text-[#4a5d3a]">Categories</h3>{categories.map((category) => <div key={category.id} className="flex items-center justify-between rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-4"><div><p className="font-semibold">{category.name}</p><p className="text-xs text-[#6f6255]">/{category.slug} · {category._count?.products || 0} products</p></div><div className="flex gap-2"><button type="button" className="text-xs underline" onClick={() => { setEditingCategoryId(category.id); setCategoryDraft({ name: category.name, slug: category.slug, description: category.description || '' }) }}>Edit</button><button type="button" className="text-xs text-red-700 underline" onClick={() => void deleteCategory(category)}>Delete</button></div></div>)}</div></div>}

      {panel === 'coupons' && <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><form onSubmit={saveCoupon} className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-5"><h3 className="font-serif text-2xl text-[#4a5d3a]">{editingCouponId ? 'Edit coupon' : 'New coupon'} <HelpTip text="Percent values are whole percentages; flat values are entered in rupees." /></h3><label className="mt-4 block text-sm font-semibold">Code<input className={inputClass} value={couponDraft.code} onChange={(event) => setCouponDraft({ ...couponDraft, code: event.target.value })} /></label><label className="mt-4 block text-sm font-semibold">Type<select className={inputClass} value={couponDraft.type} onChange={(event) => setCouponDraft({ ...couponDraft, type: event.target.value as CouponDraft['type'] })}><option value="PERCENT">Percent</option><option value="FLAT">Flat amount</option></select></label><label className="mt-4 block text-sm font-semibold">Discount value<input className={inputClass} type="number" min="1" value={couponDraft.discountValue} onChange={(event) => setCouponDraft({ ...couponDraft, discountValue: event.target.value })} /></label><label className="mt-4 block text-sm font-semibold">Minimum order (₹)<input className={inputClass} type="number" min="0" step="0.01" value={couponDraft.minOrder} onChange={(event) => setCouponDraft({ ...couponDraft, minOrder: event.target.value })} /></label><label className="mt-4 block text-sm font-semibold">Usage limit<input className={inputClass} type="number" min="0" value={couponDraft.maxUses} onChange={(event) => setCouponDraft({ ...couponDraft, maxUses: event.target.value })} /></label><label className="mt-4 block text-sm font-semibold">Expiry<input className={inputClass} type="datetime-local" value={couponDraft.validUntil} onChange={(event) => setCouponDraft({ ...couponDraft, validUntil: event.target.value })} /></label><button className={`${buttonClass} mt-4`} disabled={busy}>{editingCouponId ? 'Update coupon' : 'Create coupon'}</button></form><div className="space-y-3"><h3 className="font-serif text-2xl text-[#4a5d3a]">Coupons</h3>{coupons.map((coupon) => <div key={coupon.id} className="flex items-center justify-between rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-4"><div><p className="font-semibold">{coupon.code} <span className="text-xs font-normal text-[#6f6255]">{coupon.type === 'FLAT' ? `₹${(coupon.discountValue / 100).toFixed(2)}` : `${coupon.discountValue}%`}</span></p><p className="text-xs text-[#6f6255]">Used {coupon.uses}{coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ''}</p></div><div className="flex gap-2"><button type="button" className="text-xs underline" onClick={() => { setEditingCouponId(coupon.id); setCouponDraft({ code: coupon.code, type: coupon.type as CouponDraft['type'], discountValue: String(coupon.type === 'FLAT' ? coupon.discountValue : coupon.discountValue), minOrder: coupon.minOrderPaise ? moneyFromPaise(coupon.minOrderPaise) : '', maxUses: coupon.maxUses?.toString() || '', validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 16) : '' }) }}>Edit</button><button type="button" className="text-xs text-red-700 underline" onClick={() => void deleteCoupon(coupon)}>Delete</button></div></div>)}</div></div>}
    </section>
  )
}
