'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type Category = { id: string; name: string; slug: string; description: string | null; _count?: { products: number } }
type ImageData = { url: string; altText: string | null }
type VariantData = { name: string; value: string; pricePaise: number; sku: string | null; stock: number }
type Product = {
  id: string; title: string; slug: string; description: string; price: number; salePrice: number | null
  sku: string | null; gstPercent: number; stock: number; weightGrams: number
  lengthCm: number | null; widthCm: number | null; heightCm: number | null
  processingDays: number; isMadeToOrder: boolean; codAllowed: boolean; status: string
  metaTitle: string | null; metaDescription: string | null
  category: Category; images: ImageData[]; variants: Array<VariantData & { id: string }>
}
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
  title: '', slug: '', description: '', categoryId: '', sku: '', price: '', salePrice: '',
  gstPercent: '12', stock: '0', weightGrams: '', lengthCm: '', widthCm: '', heightCm: '',
  processingDays: '3', isMadeToOrder: false, codAllowed: true, status: 'DRAFT',
  metaTitle: '', metaDescription: '', images: [{ url: '', altText: '' }], variants: [],
}
const emptyCategory: CategoryDraft = { name: '', slug: '', description: '' }
const emptyCoupon: CouponDraft = { code: '', type: 'PERCENT', discountValue: '', minOrder: '', maxUses: '', validUntil: '' }

function HelpTip({ text }: { text: string }) {
  return (
    <span
      title={text}
      aria-label={text}
      className="ml-2 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-[#c9b79f] text-xs text-[#8a684b]"
    >
      ?
    </span>
  )
}

function moneyFromPaise(value: number | null | undefined) {
  if (value === null || value === undefined) return ''
  return (value / 100).toFixed(2)
}

function paise(value: string) {
  return Math.round(Number(value || 0) * 100)
}

async function responseMessage(response: Response) {
  const data = (await response.json().catch(() => ({}))) as {
    message?: string
    fieldErrors?: Record<string, string>
    issues?: { fieldErrors?: Record<string, string[]> }
  }
  if (!response.ok) {
    if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      throw { isFieldErrors: true, message: data.message || 'Validation failed', fieldErrors: data.fieldErrors }
    }
    const fields = Object.values(data.issues?.fieldErrors || {}).flat()
    throw new Error(fields[0] || data.message || 'Request failed')
  }
  return data
}

const inputClass =
  'mt-1 w-full rounded-lg border border-[#d8c7b1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a94e28] focus:ring-2 focus:ring-[#a94e28]/20'
const buttonClass =
  'rounded-lg bg-[#a94e28] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#883e20] disabled:cursor-not-allowed disabled:opacity-50'
const secondaryButtonClass =
  'rounded-md border border-[#c9b79f] px-3 py-1.5 text-xs font-semibold hover:bg-[#f0e6d8]'

function getInputClass(hasError: boolean) {
  return `mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${
    hasError 
      ? 'border-[#a94e28] focus:border-[#a94e28] focus:ring-[#a94e28]/20' 
      : 'border-[#d8c7b1] focus:border-[#a94e28] focus:ring-[#a94e28]/20'
  }`
}

function FieldError({ error, id }: { error?: string; id: string }) {
  if (!error) return null;
  return <p id={id} role="alert" className="mt-1 text-sm text-[#a94e28]">{error}</p>;
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [uploadError, setUploadError] = useState('')
  const uploadAlertRef = useRef<HTMLDivElement>(null)
  const formAlertRef = useRef<HTMLDivElement>(null)

  async function loadData() {
    const [productResponse, categoryResponse, couponResponse] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/admin/categories'),
      fetch('/api/admin/coupons'),
    ])
    setProducts(await productResponse.json())
    setCategories(await categoryResponse.json())
    setCoupons(await couponResponse.json())
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  function clearNotice() {
    setMessage('')
    setError('')
    setFieldErrors({})
  }

  function validateProduct() {
    const errs: Record<string, string> = {}
    if (!productDraft.title.trim()) errs.title = 'Product title is required'
    if (Number(productDraft.price) <= 0) errs.price = 'Price must be greater than zero'
    if (productDraft.salePrice && Number(productDraft.salePrice) > Number(productDraft.price))
      errs.salePrice = 'Sale price cannot exceed price'
    if (Number(productDraft.weightGrams) <= 0) errs.weightGrams = 'Weight is required'
    if (!productDraft.categoryId) errs.categoryId = 'Choose a category'
    if (!productDraft.sku.trim()) errs.sku = 'SKU is required'
    return errs
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault()
    clearNotice()
    setUploadError('')
    const validationError = validateProduct()
    if (Object.keys(validationError).length > 0) {
      setFieldErrors(validationError)
      requestAnimationFrame(() => {
        const firstError = document.querySelector('[aria-invalid="true"]')
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(firstError as HTMLElement).focus()
        }
      })
      return
    }
    setBusy(true)
    try {
      const payload = {
        ...productDraft,
        pricePaise: paise(productDraft.price),
        salePricePaise: productDraft.salePrice ? paise(productDraft.salePrice) : null,
        gstPercent: Number(productDraft.gstPercent),
        stock: Number(productDraft.stock),
        weightGrams: Number(productDraft.weightGrams),
        lengthCm: productDraft.lengthCm ? Number(productDraft.lengthCm) : null,
        widthCm: productDraft.widthCm ? Number(productDraft.widthCm) : null,
        heightCm: productDraft.heightCm ? Number(productDraft.heightCm) : null,
        processingDays: Number(productDraft.processingDays),
        metaTitle: productDraft.metaTitle || null,
        metaDescription: productDraft.metaDescription || null,
        images: productDraft.images.map((image) => ({
          url: image.url,
          altText: image.altText || null,
        })),
        variants: productDraft.variants.map((variant) => ({
          name: variant.name,
          value: variant.value,
          pricePaise: paise(variant.price),
          sku: variant.sku || null,
          stock: Number(variant.stock),
        })),
      }
      const response = await fetch(
        editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products',
        {
          method: editingProductId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      await responseMessage(response)
      await loadData()
      setProductDraft(emptyProduct)
      setEditingProductId(null)
      setMessage('Product saved')
    } catch (caught: any) {
      if (caught.isFieldErrors) {
        setFieldErrors(caught.fieldErrors)
        requestAnimationFrame(() => {
          const firstError = document.querySelector('[aria-invalid="true"]')
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ;(firstError as HTMLElement).focus()
          }
        })
      } else {
        setError(caught instanceof Error ? caught.message : 'Product could not be saved')
      }
    } finally {
      setBusy(false)
    }
  }

  function editProduct(product: Product) {
    setPanel('products')
    clearNotice()
    setEditingProductId(product.id)
    setProductDraft({
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      categoryId: product.category.id,
      sku: product.sku || '',
      price: moneyFromPaise(product.price),
      salePrice: moneyFromPaise(product.salePrice),
      gstPercent: String(product.gstPercent),
      stock: String(product.stock),
      weightGrams: String(product.weightGrams),
      lengthCm: product.lengthCm !== null ? String(product.lengthCm) : '',
      widthCm: product.widthCm !== null ? String(product.widthCm) : '',
      heightCm: product.heightCm !== null ? String(product.heightCm) : '',
      processingDays: String(product.processingDays),
      isMadeToOrder: product.isMadeToOrder,
      codAllowed: product.codAllowed,
      status: product.status as ProductDraft['status'],
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      images: product.images.map((image) => ({
        url: image.url,
        altText: image.altText || '',
      })),
      variants: product.variants.map((variant) => ({
        name: variant.name,
        value: variant.value,
        price: moneyFromPaise(variant.pricePaise),
        sku: variant.sku || '',
        stock: String(variant.stock),
      })),
    })
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= productDraft.images.length) return
    const images = [...productDraft.images]
    ;[images[index], images[nextIndex]] = [images[nextIndex], images[index]]
    setProductDraft({ ...productDraft, images })
  }

  function dropImage(index: number) {
    if (draggedImageIndex === null || draggedImageIndex === index) return
    const images = [...productDraft.images]
    const [moved] = images.splice(draggedImageIndex, 1)
    images.splice(index, 0, moved)
    setProductDraft({ ...productDraft, images })
    setDraggedImageIndex(null)
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    clearNotice()
    setUploadError('')
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image must be under 4 MB')
      requestAnimationFrame(() => uploadAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
      event.target.value = ''
      return
    }
    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = (await responseMessage(
        await fetch('/api/admin/uploads', { method: 'POST', body: formData }),
      )) as { url: string; warning?: string }
      const images = productDraft.images.filter((image) => image.url.trim())
      setProductDraft({
        ...productDraft,
        images: [...images, { url: data.url, altText: file.name }],
      })
      if (data.warning) {
        setUploadError(data.warning)
        requestAnimationFrame(() => uploadAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
      } else {
        setMessage('Image uploaded')
      }
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : 'Upload failed'
      setUploadError(msg)
      requestAnimationFrame(() => uploadAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete ${product.title}? Products with orders are soft-deleted.`)) return
    clearNotice()
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      await responseMessage(response)
      await loadData()
      setMessage('Product deleted')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Product could not be deleted')
    }
  }

  async function duplicateProduct(product: Product) {
    clearNotice()
    try {
      const response = await fetch(`/api/admin/products/${product.id}/duplicate`, { method: 'POST' })
      await responseMessage(response)
      await loadData()
      setMessage('Draft copy created')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Duplicate failed')
    }
  }

  async function saveCategory(event: FormEvent) {
    event.preventDefault()
    clearNotice()
    setBusy(true)
    try {
      const response = await fetch(
        editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : '/api/admin/categories',
        {
          method: editingCategoryId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...categoryDraft,
            description: categoryDraft.description || null,
          }),
        },
      )
      await responseMessage(response)
      await loadData()
      setCategoryDraft(emptyCategory)
      setEditingCategoryId(null)
      setMessage('Category saved')
    } catch (caught: any) {
      if (caught.isFieldErrors) {
        setFieldErrors(caught.fieldErrors)
        requestAnimationFrame(() => {
          const firstError = document.querySelector('[aria-invalid="true"]')
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ;(firstError as HTMLElement).focus()
          }
        })
      } else {
        setError(caught instanceof Error ? caught.message : 'Category could not be saved')
      }
    } finally {
      setBusy(false)
    }
  }

  async function deleteCategory(category: Category) {
    if (!confirm(`Delete ${category.name}?`)) return
    clearNotice()
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' })
      await responseMessage(response)
      await loadData()
      setMessage('Category deleted')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Category could not be deleted')
    }
  }

  async function saveCoupon(event: FormEvent) {
    event.preventDefault()
    clearNotice()
    setBusy(true)
    try {
      const response = await fetch(
        editingCouponId ? `/api/admin/coupons/${editingCouponId}` : '/api/admin/coupons',
        {
          method: editingCouponId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: couponDraft.code,
            type: couponDraft.type,
            discountValue: Number(couponDraft.discountValue),
            minOrderPaise: couponDraft.minOrder ? paise(couponDraft.minOrder) : null,
            maxUses: couponDraft.maxUses ? Number(couponDraft.maxUses) : null,
            validUntil: couponDraft.validUntil
              ? new Date(couponDraft.validUntil).toISOString()
              : null,
          }),
        },
      )
      await responseMessage(response)
      await loadData()
      setCouponDraft(emptyCoupon)
      setEditingCouponId(null)
      setMessage('Coupon saved')
    } catch (caught: any) {
      if (caught.isFieldErrors) {
        setFieldErrors(caught.fieldErrors)
        requestAnimationFrame(() => {
          const firstError = document.querySelector('[aria-invalid="true"]')
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ;(firstError as HTMLElement).focus()
          }
        })
      } else {
        setError(caught instanceof Error ? caught.message : 'Coupon could not be saved')
      }
    } finally {
      setBusy(false)
    }
  }

  async function deleteCoupon(coupon: Coupon) {
    if (!confirm(`Delete coupon ${coupon.code}?`)) return
    clearNotice()
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' })
      await responseMessage(response)
      await loadData()
      setMessage('Coupon deleted')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Coupon could not be deleted')
    }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#d8c7b1] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a94e28]">
            Control room
          </p>
          <h2 className="font-serif text-4xl text-[#4a5d3a]">Catalog</h2>
          <p className="mt-1 text-sm text-[#6f6255]">
            Keep the shop accurate, calm, and ready to sell.
          </p>
        </div>
        <span
          title="Help for the current admin catalog workspace"
          className="w-fit rounded-full border border-[#c9b79f] px-3 py-1 text-xs text-[#6f6255]"
        >
          Help
        </span>
      </div>

      {/* Notification */}
      {(message || error) && (
        <div
          role={error ? 'alert' : 'status'}
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-[#b8c8a9] bg-[#edf4e8] text-[#3d5b35]'
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#d8c7b1] pb-2">
        {(['products', 'categories', 'coupons'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setPanel(item)
              clearNotice()
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
              panel === item
                ? 'bg-[#4a5d3a] text-white'
                : 'text-[#4a5d3a] hover:bg-[#e8dcc8]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* ─── Products panel ─── */}
      {panel === 'products' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          {/* Product list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-[#4a5d3a]">
                Products
                <HelpTip text="Published products appear in the public product query; drafts remain admin-only." />
              </h3>
              <span className="text-sm text-[#6f6255]">{products.length} items</span>
            </div>
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#e8dcc8]">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].altText || product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{product.title}</h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          product.status === 'PUBLISHED'
                            ? 'bg-[#dcebd4] text-[#3d5b35]'
                            : 'bg-[#eee3d3] text-[#80684d]'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                    <p className="truncate text-sm text-[#6f6255]">
                      {product.category.name} · SKU {product.sku || 'missing'} · ₹
                      {(product.price / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-[#8a684b]">
                      {product.variants.length
                        ? `${product.variants.length} variants`
                        : `${product.stock} in stock`}{' '}
                      · {product.images.length} images
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    onClick={() => editProduct(product)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    onClick={() => void duplicateProduct(product)}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    onClick={() => void deleteProduct(product)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Product form */}
          <form onSubmit={saveProduct} onChange={(e) => {
    const name = (e.target as HTMLInputElement).name;
    if (name) {
      let field = name;
      if (name.startsWith('product-')) field = name.replace('product-', '');
      else if (name.startsWith('category-')) field = name.replace('category-', '');
      else if (name.startsWith('coupon-')) field = name.replace('coupon-', '');
      else if (name.startsWith('variant-')) {
        const parts = name.split('-');
        if (parts.length >= 3) field = `variants.${parts[2]}.${parts[1]}`;
      }
      else if (name === 'seo-meta-title') field = 'metaTitle';
      else if (name === 'seo-meta-description') field = 'metaDescription';
      if (fieldErrors[field]) {
        const next = { ...fieldErrors };
        delete next[field];
        setFieldErrors(next);
      }
    }
  }}
            className="space-y-5 rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-4 shadow-sm sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-[#4a5d3a]">
                {editingProductId ? 'Edit product' : 'New product'}
                <HelpTip text="Prices are entered in rupees here and stored as integer paise on the server." />
              </h3>
              {editingProductId && (
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() => {
                    setEditingProductId(null)
                    setProductDraft(emptyProduct)
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Product Title — distinct from SEO Meta Title */}
              <label htmlFor="product-title" className="sm:col-span-2 text-sm font-semibold">
                Product Title
                <HelpTip text="The main display name for this product in the shop." />
                <input
                  id="product-title"
                  name="product-title"
                  className={inputClass}
                  value={productDraft.title}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, title: event.target.value })
                  }
                  placeholder="Hand-painted monsoon"
                />
              </label>

              <label htmlFor="product-slug" className="text-sm font-semibold">
                Slug
                <input
                  id="product-slug"
                  name="product-slug"
                  className={inputClass}
                  value={productDraft.slug}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, slug: event.target.value })
                  }
                  placeholder="hand-painted-monsoon"
                />
              </label>

              <label htmlFor="product-sku" className="text-sm font-semibold">
                SKU
                <input
                  id="product-sku"
                  name="product-sku"
                  className={inputClass}
                  value={productDraft.sku}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, sku: event.target.value })
                  }
                  placeholder="ART-PAINT-013"
                />
              </label>

              <label htmlFor="product-category" className="sm:col-span-2 text-sm font-semibold">
                Category
                <select
                  id="product-category"
                  name="product-category"
                  className={inputClass}
                  value={productDraft.categoryId}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, categoryId: event.target.value })
                  }
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="product-description" className="sm:col-span-2 text-sm font-semibold">
                Description
                <textarea
                  id="product-description"
                  name="product-description"
                  className={inputClass}
                  rows={3}
                  value={productDraft.description}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, description: event.target.value })
                  }
                />
              </label>

              <label htmlFor="product-price" className="text-sm font-semibold">
                Price (₹)
                <input
                  id="product-price"
                  name="product-price"
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={productDraft.price}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, price: event.target.value })
                  }
                />
              </label>

              <label htmlFor="product-sale-price" className="text-sm font-semibold">
                Sale price (₹)
                <input
                  id="product-sale-price"
                  name="product-sale-price"
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={productDraft.salePrice}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, salePrice: event.target.value })
                  }
                />
              </label>

              <label htmlFor="product-gst" className="text-sm font-semibold">
                GST %
                <HelpTip text="GST percentage for this product. Default is 12%." />
                <input
                  id="product-gst"
                  name="product-gst"
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  value={productDraft.gstPercent}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, gstPercent: event.target.value })
                  }
                />
              </label>

              <label htmlFor="product-stock" className="text-sm font-semibold">
                Stock
                <HelpTip text="For products without variants, stock is tracked here. With variants, each variant has its own stock." />
                <input
                  id="product-stock"
                  name="product-stock"
                  className={inputClass}
                  type="number"
                  min="0"
                  value={productDraft.stock}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, stock: event.target.value })
                  }
                />
              </label>

              <label htmlFor="product-weight" className="text-sm font-semibold">
                Weight (g)
                <HelpTip text="Weight in grams, required for shipping rate calculation." />
                <input
                  id="product-weight"
                  name="product-weight"
                  className={inputClass}
                  type="number"
                  min="1"
                  value={productDraft.weightGrams}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, weightGrams: event.target.value })
                  }
                />
              </label>

              <label htmlFor="product-processing-days" className="text-sm font-semibold">
                Processing days
                <HelpTip text="Days needed to prepare the item before dispatch. Added to delivery ETA." />
                <input
                  id="product-processing-days"
                  name="product-processing-days"
                  className={inputClass}
                  type="number"
                  min="0"
                  value={productDraft.processingDays}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, processingDays: event.target.value })
                  }
                />
              </label>

              {(['lengthCm', 'widthCm', 'heightCm'] as const).map((dimension) => (
                <label
                  key={dimension}
                  htmlFor={`product-${dimension}`}
                  className="text-sm font-semibold"
                >
                  {dimension.replace('Cm', ' cm')}
                  <input
                    id={`product-${dimension}`}
                    name={`product-${dimension}`}
                    className={inputClass}
                    type="number"
                    min="0"
                    value={productDraft[dimension]}
                    onChange={(event) =>
                      setProductDraft({ ...productDraft, [dimension]: event.target.value })
                    }
                  />
                </label>
              ))}
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-4 text-sm">
              <label htmlFor="product-made-to-order" className="flex items-center gap-2">
                <input
                  id="product-made-to-order"
                  name="product-made-to-order"
                  type="checkbox"
                  checked={productDraft.isMadeToOrder}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, isMadeToOrder: event.target.checked })
                  }
                />
                Made to order
                <HelpTip text="Made-to-order items are prepaid only and non-returnable." />
              </label>
              <label htmlFor="product-cod-allowed" className="flex items-center gap-2">
                <input
                  id="product-cod-allowed"
                  name="product-cod-allowed"
                  type="checkbox"
                  checked={productDraft.codAllowed}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, codAllowed: event.target.checked })
                  }
                />
                COD allowed
                <HelpTip text="Allow cash-on-delivery for this product. Disabled for made-to-order items." />
              </label>
              <label htmlFor="product-status" className="flex items-center gap-2">
                Status
                <select
                  id="product-status"
                  name="product-status"
                  className="rounded border border-[#d8c7b1] bg-white px-2 py-1"
                  value={productDraft.status}
                  onChange={(event) =>
                    setProductDraft({
                      ...productDraft,
                      status: event.target.value as ProductDraft['status'],
                    })
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </label>
            </div>

            {/* Images section */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">
                  Images
                  <HelpTip text="The first image is the cover. Drag rows or use arrows to reorder." />
                </h4>
                <label className="cursor-pointer rounded-md border border-[#c9b79f] px-3 py-1.5 text-xs font-semibold hover:bg-[#f0e6d8]">
                  Upload mock/Cloudinary
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(event) => void uploadImage(event)}
                  />
                </label>
              </div>
              {/* Inline upload error / warning */}
              {uploadError && (
                <div
                  ref={uploadAlertRef}
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
                >
                  {uploadError}
                </div>
              )}
              <div className="space-y-2">
                {productDraft.images.map((image, index) => (
                  <div
                    key={`${index}-${image.url}`}
                    draggable
                    onDragStart={() => setDraggedImageIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => dropImage(index)}
                    className="flex gap-2 rounded-lg border border-[#e2d4c2] bg-white p-2"
                  >
                    <span className="cursor-grab pt-2 text-[#8a684b]">⠿</span>
                    <input
                      id={`image-url-${index}`}
                      name={`image-url-${index}`}
                      className={inputClass}
                      value={image.url}
                      placeholder="Image URL"
                      onChange={(event) => {
                        const images = [...productDraft.images]
                        images[index] = { ...images[index], url: event.target.value }
                        setProductDraft({ ...productDraft, images })
                      }}
                    />
                    <input
                      id={`image-alt-${index}`}
                      name={`image-alt-${index}`}
                      className={inputClass}
                      value={image.altText}
                      placeholder="Alt text"
                      onChange={(event) => {
                        const images = [...productDraft.images]
                        images[index] = { ...images[index], altText: event.target.value }
                        setProductDraft({ ...productDraft, images })
                      }}
                    />
                    <button
                      type="button"
                      title="Move image up"
                      className="px-1"
                      onClick={() => moveImage(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Move image down"
                      className="px-1"
                      onClick={() => moveImage(index, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title="Remove image"
                      className="px-1 text-red-700"
                      onClick={() =>
                        setProductDraft({
                          ...productDraft,
                          images: productDraft.images.filter(
                            (_, imageIndex) => imageIndex !== index,
                          ),
                        })
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[#a94e28]"
                onClick={() =>
                  setProductDraft({
                    ...productDraft,
                    images: [...productDraft.images, { url: '', altText: '' }],
                  })
                }
              >
                + Add image URL
              </button>
            </div>

            {/* Variants section */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">
                  Variants
                  <HelpTip text="Variant products reserve and sell stock from each selected Variant.stock." />
                </h4>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#a94e28]"
                  onClick={() =>
                    setProductDraft({
                      ...productDraft,
                      variants: [
                        ...productDraft.variants,
                        {
                          name: '',
                          value: '',
                          price: productDraft.price,
                          sku: '',
                          stock: '0',
                        },
                      ],
                    })
                  }
                >
                  + Add variant
                </button>
              </div>
              <div className="space-y-2">
                {productDraft.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-lg border border-[#e2d4c2] bg-white p-2 sm:grid-cols-5"
                  >
                    <input
                      id={`variant-name-${index}`}
                      name={`variant-name-${index}`}
                      className={inputClass}
                      placeholder="Name (e.g. Size)"
                      value={variant.name}
                      onChange={(event) => {
                        const variants = [...productDraft.variants]
                        variants[index] = { ...variants[index], name: event.target.value }
                        setProductDraft({ ...productDraft, variants })
                      }}
                    />
                    <input
                      id={`variant-value-${index}`}
                      name={`variant-value-${index}`}
                      className={inputClass}
                      placeholder="Value (e.g. Large)"
                      value={variant.value}
                      onChange={(event) => {
                        const variants = [...productDraft.variants]
                        variants[index] = { ...variants[index], value: event.target.value }
                        setProductDraft({ ...productDraft, variants })
                      }}
                    />
                    <input
                      id={`variant-price-${index}`}
                      name={`variant-price-${index}`}
                      className={inputClass}
                      placeholder="Price ₹"
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(event) => {
                        const variants = [...productDraft.variants]
                        variants[index] = { ...variants[index], price: event.target.value }
                        setProductDraft({ ...productDraft, variants })
                      }}
                    />
                    <input
                      id={`variant-sku-${index}`}
                      name={`variant-sku-${index}`}
                      className={inputClass}
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(event) => {
                        const variants = [...productDraft.variants]
                        variants[index] = { ...variants[index], sku: event.target.value }
                        setProductDraft({ ...productDraft, variants })
                      }}
                    />
                    <div className="flex gap-2">
                      <input
                        id={`variant-stock-${index}`}
                        name={`variant-stock-${index}`}
                        className={inputClass}
                        placeholder="Stock"
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(event) => {
                          const variants = [...productDraft.variants]
                          variants[index] = { ...variants[index], stock: event.target.value }
                          setProductDraft({ ...productDraft, variants })
                        }}
                      />
                      <button
                        type="button"
                        className="shrink-0 rounded-md text-xs text-red-700"
                        onClick={() =>
                          setProductDraft({
                            ...productDraft,
                            variants: productDraft.variants.filter(
                              (_, variantIndex) => variantIndex !== index,
                            ),
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO fields — distinct labels from Product Title */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label htmlFor="seo-meta-title" className="text-sm font-semibold">
                SEO Meta Title
                <HelpTip text="The title that appears in search engine results. Different from the product display name." />
                <input
                  id="seo-meta-title"
                  name="seo-meta-title"
                  className={inputClass}
                  value={productDraft.metaTitle}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, metaTitle: event.target.value })
                  }
                  placeholder="Buy Hand-painted Monsoon Art Online"
                />
              </label>
              <label htmlFor="seo-meta-description" className="text-sm font-semibold">
                SEO Meta Description
                <textarea
                  id="seo-meta-description"
                  name="seo-meta-description"
                  className={inputClass}
                  rows={2}
                  value={productDraft.metaDescription}
                  onChange={(event) =>
                    setProductDraft({ ...productDraft, metaDescription: event.target.value })
                  }
                  placeholder="Handcrafted art piece depicting the monsoon season in India..."
                />
              </label>
            </div>

            {/* Inline form error near submit button */}
            {error && (
              <div
                ref={formAlertRef}
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button className={buttonClass} disabled={busy} type="submit">
              {busy ? 'Saving...' : editingProductId ? 'Update product' : 'Create product'}
            </button>
          </form>
        </div>
      )}

      {/* ─── Categories panel ─── */}
      {panel === 'categories' && (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form onSubmit={saveCategory} onChange={(e) => {
    const name = (e.target as HTMLInputElement).name;
    if (name) {
      let field = name;
      if (name.startsWith('product-')) field = name.replace('product-', '');
      else if (name.startsWith('category-')) field = name.replace('category-', '');
      else if (name.startsWith('coupon-')) field = name.replace('coupon-', '');
      else if (name.startsWith('variant-')) {
        const parts = name.split('-');
        if (parts.length >= 3) field = `variants.${parts[2]}.${parts[1]}`;
      }
      else if (name === 'seo-meta-title') field = 'metaTitle';
      else if (name === 'seo-meta-description') field = 'metaDescription';
      if (fieldErrors[field]) {
        const next = { ...fieldErrors };
        delete next[field];
        setFieldErrors(next);
      }
    }
  }} className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-5">
            <h3 className="font-serif text-2xl text-[#4a5d3a]">
              {editingCategoryId ? 'Edit category' : 'New category'}
              <HelpTip text="Categories organize the public catalog." />
            </h3>
            <label htmlFor="category-name" className="mt-4 block text-sm font-semibold">
              Name
              <input
                id="category-name"
                name="category-name"
                className={inputClass}
                value={categoryDraft.name}
                onChange={(event) =>
                  setCategoryDraft({ ...categoryDraft, name: event.target.value })
                }
              />
            </label>
            <label htmlFor="category-slug" className="mt-4 block text-sm font-semibold">
              Slug
              <input
                id="category-slug"
                name="category-slug"
                className={inputClass}
                value={categoryDraft.slug}
                onChange={(event) =>
                  setCategoryDraft({ ...categoryDraft, slug: event.target.value })
                }
              />
            </label>
            <label htmlFor="category-description" className="mt-4 block text-sm font-semibold">
              Description
              <textarea
                id="category-description"
                name="category-description"
                className={inputClass}
                rows={3}
                value={categoryDraft.description}
                onChange={(event) =>
                  setCategoryDraft({ ...categoryDraft, description: event.target.value })
                }
              />
            </label>
            <button className={`${buttonClass} mt-4`} disabled={busy}>
              {editingCategoryId ? 'Update category' : 'Create category'}
            </button>
            {editingCategoryId && (
              <button
                type="button"
                className="mt-2 block text-xs underline"
                onClick={() => {
                  setEditingCategoryId(null)
                  setCategoryDraft(emptyCategory)
                }}
              >
                Cancel edit
              </button>
            )}
          </form>
          <div className="space-y-3">
            <h3 className="font-serif text-2xl text-[#4a5d3a]">Categories</h3>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-4"
              >
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-xs text-[#6f6255]">
                    /{category.slug} · {category._count?.products || 0} products
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => {
                      setEditingCategoryId(category.id)
                      setCategoryDraft({
                        name: category.name,
                        slug: category.slug,
                        description: category.description || '',
                      })
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs text-red-700 underline"
                    onClick={() => void deleteCategory(category)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Coupons panel ─── */}
      {panel === 'coupons' && (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form onSubmit={saveCoupon} onChange={(e) => {
    const name = (e.target as HTMLInputElement).name;
    if (name) {
      let field = name;
      if (name.startsWith('product-')) field = name.replace('product-', '');
      else if (name.startsWith('category-')) field = name.replace('category-', '');
      else if (name.startsWith('coupon-')) field = name.replace('coupon-', '');
      else if (name.startsWith('variant-')) {
        const parts = name.split('-');
        if (parts.length >= 3) field = `variants.${parts[2]}.${parts[1]}`;
      }
      else if (name === 'seo-meta-title') field = 'metaTitle';
      else if (name === 'seo-meta-description') field = 'metaDescription';
      if (fieldErrors[field]) {
        const next = { ...fieldErrors };
        delete next[field];
        setFieldErrors(next);
      }
    }
  }} className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-5">
            <h3 className="font-serif text-2xl text-[#4a5d3a]">
              {editingCouponId ? 'Edit coupon' : 'New coupon'}
              <HelpTip text="Percent values are whole percentages; flat values are entered in rupees." />
            </h3>
            <label htmlFor="coupon-code" className="mt-4 block text-sm font-semibold">
              Code
              <input
                id="coupon-code"
                name="coupon-code"
                className={inputClass}
                value={couponDraft.code}
                onChange={(event) =>
                  setCouponDraft({ ...couponDraft, code: event.target.value })
                }
              />
            </label>
            <label htmlFor="coupon-type" className="mt-4 block text-sm font-semibold">
              Type
              <select
                id="coupon-type"
                name="coupon-type"
                className={inputClass}
                value={couponDraft.type}
                onChange={(event) =>
                  setCouponDraft({
                    ...couponDraft,
                    type: event.target.value as CouponDraft['type'],
                  })
                }
              >
                <option value="PERCENT">Percent</option>
                <option value="FLAT">Flat amount</option>
              </select>
            </label>
            <label htmlFor="coupon-discount-value" className="mt-4 block text-sm font-semibold">
              Discount value
              <HelpTip text="For percent, enter whole number (e.g. 10 = 10%). For flat, enter rupee amount." />
              <input
                id="coupon-discount-value"
                name="coupon-discount-value"
                className={inputClass}
                type="number"
                min="1"
                value={couponDraft.discountValue}
                onChange={(event) =>
                  setCouponDraft({ ...couponDraft, discountValue: event.target.value })
                }
              />
            </label>
            <label htmlFor="coupon-min-order" className="mt-4 block text-sm font-semibold">
              Minimum order (₹)
              <HelpTip text="Minimum cart value in rupees required to use this coupon." />
              <input
                id="coupon-min-order"
                name="coupon-min-order"
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={couponDraft.minOrder}
                onChange={(event) =>
                  setCouponDraft({ ...couponDraft, minOrder: event.target.value })
                }
              />
            </label>
            <label htmlFor="coupon-max-uses" className="mt-4 block text-sm font-semibold">
              Usage limit
              <HelpTip text="Leave blank for unlimited uses." />
              <input
                id="coupon-max-uses"
                name="coupon-max-uses"
                className={inputClass}
                type="number"
                min="0"
                value={couponDraft.maxUses}
                onChange={(event) =>
                  setCouponDraft({ ...couponDraft, maxUses: event.target.value })
                }
              />
            </label>
            <label htmlFor="coupon-expiry" className="mt-4 block text-sm font-semibold">
              Expiry
              <input
                id="coupon-expiry"
                name="coupon-expiry"
                className={inputClass}
                type="datetime-local"
                value={couponDraft.validUntil}
                onChange={(event) =>
                  setCouponDraft({ ...couponDraft, validUntil: event.target.value })
                }
              />
            </label>
            <button className={`${buttonClass} mt-4`} disabled={busy}>
              {editingCouponId ? 'Update coupon' : 'Create coupon'}
            </button>
            {editingCouponId && (
              <button
                type="button"
                className="mt-2 block text-xs underline"
                onClick={() => {
                  setEditingCouponId(null)
                  setCouponDraft(emptyCoupon)
                }}
              >
                Cancel edit
              </button>
            )}
          </form>
          <div className="space-y-3">
            <h3 className="font-serif text-2xl text-[#4a5d3a]">Coupons</h3>
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex items-center justify-between rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-4"
              >
                <div>
                  <p className="font-semibold">
                    {coupon.code}{' '}
                    <span className="text-xs font-normal text-[#6f6255]">
                      {coupon.type === 'FLAT'
                        ? `₹${(coupon.discountValue / 100).toFixed(2)}`
                        : `${coupon.discountValue}%`}
                    </span>
                  </p>
                  <p className="text-xs text-[#6f6255]">
                    Used {coupon.uses}
                    {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => {
                      setEditingCouponId(coupon.id)
                      setCouponDraft({
                        code: coupon.code,
                        type: coupon.type as CouponDraft['type'],
                        discountValue: String(coupon.discountValue),
                        minOrder: coupon.minOrderPaise ? moneyFromPaise(coupon.minOrderPaise) : '',
                        maxUses: coupon.maxUses?.toString() || '',
                        validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 16) : '',
                      })
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs text-red-700 underline"
                    onClick={() => void deleteCoupon(coupon)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
