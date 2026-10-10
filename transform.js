/* eslint-disable */
const fs = require('fs');

let content = fs.readFileSync('src/app/admin/AdminCatalog.tsx', 'utf8');

// 1. Add fieldErrors state
content = content.replace(
  "const [error, setError] = useState('')",
  "const [error, setError] = useState('')\n  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})"
);

// 2. Add clearNotice update
content = content.replace(
  "setError('')",
  "setError('')\n    setFieldErrors({})"
);

// 3. Update validateProduct to return fieldErrors
content = content.replace(
  /function validateProduct\(\) \{[\s\S]*?return ''\s*\}/,
  `function validateProduct() {
    const errs: Record<string, string> = {}
    if (!productDraft.title.trim()) errs.title = 'Product title is required'
    if (Number(productDraft.price) <= 0) errs.price = 'Price must be greater than zero'
    if (productDraft.salePrice && Number(productDraft.salePrice) > Number(productDraft.price))
      errs.salePrice = 'Sale price cannot exceed price'
    if (Number(productDraft.weightGrams) <= 0) errs.weightGrams = 'Weight is required'
    if (!productDraft.categoryId) errs.categoryId = 'Choose a category'
    if (!productDraft.sku.trim()) errs.sku = 'SKU is required'
    return errs
  }`
);

// 4. Update saveProduct
content = content.replace(
  /const validationError = validateProduct\(\)[\s\S]*?return\s*\}/,
  `const validationError = validateProduct()
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
    }`
);

content = content.replace(
  /\} catch \(caught\) \{\s*setError\(caught instanceof Error \? caught\.message : 'Product could not be saved'\)\s*requestAnimationFrame\(\(\) => formAlertRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth', block: 'nearest' \}\)\)\s*\}/,
  `} catch (caught: any) {
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
    }`
);

// Update saveCategory and saveCoupon catches
content = content.replace(
  /\} catch \(caught\) \{\s*setError\(caught instanceof Error \? caught\.message : 'Category could not be saved'\)\s*\}/,
  `} catch (caught: any) {
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
    }`
);

content = content.replace(
  /\} catch \(caught\) \{\s*setError\(caught instanceof Error \? caught\.message : 'Coupon could not be saved'\)\s*\}/,
  `} catch (caught: any) {
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
    }`
);

// 5. Update responseMessage
content = content.replace(
  /async function responseMessage\(response: Response\) \{[\s\S]*?return data\s*\}/,
  `async function responseMessage(response: Response) {
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
}`
);

// 6. Update image upload check before fetch
content = content.replace(
  /const file = event\.target\.files\?\.\[0\]\s*if \(\!file\) return\s*clearNotice\(\)\s*setUploadError\(''\)\s*setBusy\(true\)/,
  `const file = event.target.files?.[0]
    if (!file) return
    clearNotice()
    setUploadError('')
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image must be under 4 MB')
      requestAnimationFrame(() => uploadAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
      event.target.value = ''
      return
    }
    setBusy(true)`
);

// 7. Add fieldError helper
content = content.replace(
  "export default function AdminCatalog() {",
  `function getInputClass(hasError: boolean) {
  return \`mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 \${
    hasError 
      ? 'border-[#a94e28] focus:border-[#a94e28] focus:ring-[#a94e28]/20' 
      : 'border-[#d8c7b1] focus:border-[#a94e28] focus:ring-[#a94e28]/20'
  }\`
}

function FieldError({ error, id }: { error?: string; id: string }) {
  if (!error) return null;
  return <p id={id} role="alert" className="mt-1 text-sm text-[#a94e28]">{error}</p>;
}

export default function AdminCatalog() {`
);

// Add form onChange handlers
const formHandler = `onChange={(e) => {
    const name = (e.target as HTMLInputElement).name;
    if (name) {
      let field = name;
      if (name.startsWith('product-')) field = name.replace('product-', '');
      else if (name.startsWith('category-')) field = name.replace('category-', '');
      else if (name.startsWith('coupon-')) field = name.replace('coupon-', '');
      else if (name.startsWith('variant-')) {
        const parts = name.split('-');
        if (parts.length >= 3) field = \`variants.\${parts[2]}.\${parts[1]}\`;
      }
      else if (name === 'seo-meta-title') field = 'metaTitle';
      else if (name === 'seo-meta-description') field = 'metaDescription';
      if (fieldErrors[field]) {
        const next = { ...fieldErrors };
        delete next[field];
        setFieldErrors(next);
      }
    }
  }}`;

content = content.replace(/<form\s*onSubmit=\{saveProduct\}/, `<form onSubmit={saveProduct} ${formHandler}`);
content = content.replace(/<form\s*onSubmit=\{saveCategory\}/, `<form onSubmit={saveCategory} ${formHandler}`);
content = content.replace(/<form\s*onSubmit=\{saveCoupon\}/, `<form onSubmit={saveCoupon} ${formHandler}`);

function mapIdToField(id) {
  if (id.startsWith('product-')) {
    let f = id.replace('product-', '');
    if (f === 'category') return 'categoryId';
    if (f === 'sale-price') return 'salePricePaise';
    if (f === 'price') return 'pricePaise';
    if (f === 'processing-days') return 'processingDays';
    if (f === 'length') return 'lengthCm';
    if (f === 'width') return 'widthCm';
    if (f === 'height') return 'heightCm';
    if (f === 'gst') return 'gstPercent';
    return f;
  }
  if (id.startsWith('category-')) return id.replace('category-', '');
  if (id.startsWith('coupon-')) {
    let f = id.replace('coupon-', '');
    if (f === 'discount-value') return 'discountValue';
    if (f === 'min-order') return 'minOrderPaise';
    if (f === 'max-uses') return 'maxUses';
    if (f === 'expiry') return 'validUntil';
    return f;
  }
  if (id.startsWith('variant-')) {
    const parts = id.split('-'); // variant-price-${index}
    if (parts.length === 3) {
      let f = parts[1];
      if (f === 'price') return 'variants.${' + parts[2] + '}.pricePaise';
      return 'variants.${' + parts[2] + '}.' + f;
    }
  }
  if (id.startsWith('seo-meta-title')) return 'metaTitle';
  if (id.startsWith('seo-meta-description')) return 'metaDescription';
  return null;
}

// Map the specific fields from zod schemas.
// Zod keys:
// product: title, slug, description, categoryId, sku, pricePaise, salePricePaise, gstPercent, stock, weightGrams, lengthCm, widthCm, heightCm, processingDays, isMadeToOrder, codAllowed, status, metaTitle, metaDescription, images, variants
// category: name, slug, description
// coupon: code, type, discountValue, minOrderPaise, maxUses, validUntil

const regex = /<(input|textarea|select)([\s\S]*?)id=(?:"([^"]+)"|\{`([^`]+)`\})([\s\S]*?)className=\{inputClass\}([\s\S]*?)(\/?>)/g;

content = content.replace(regex, (match, tag, beforeId, idStr, idTpl, afterId, afterClass, closing) => {
  const isTpl = !!idTpl;
  const id = isTpl ? idTpl : idStr;
  
  let field = mapIdToField(id);
  if (!field) return match; // skip if we don't know the field

  const fieldKey = isTpl && field.includes('${') ? '[`' + field + '`]' : "['" + field + "']";
  
  const idValue = isTpl ? '{`' + id + '`}' : '"' + id + '"';
  
  const newClassName = 'className={getInputClass(!!fieldErrors' + fieldKey + ')}';
  const ariaInvalid = 'aria-invalid={!!fieldErrors' + fieldKey + '}';
  const ariaDescribedBy = 'aria-describedby={fieldErrors' + fieldKey + ' ? ' + (isTpl ? '{`' + id + '-error`}' : '"' + id + '-error"') + ' : undefined}';
  
  const newTag = '<' + tag + beforeId + 'id=' + idValue + afterId + newClassName + ' ' + ariaInvalid + ' ' + ariaDescribedBy + afterClass + closing;
  
  const errorTag = '\\n<FieldError error={fieldErrors' + fieldKey + '} id=' + (isTpl ? '{`' + id + '-error`}' : '"' + id + '-error"') + ' />';

  return newTag + errorTag;
});

// Write it out
fs.writeFileSync('src/app/admin/AdminCatalog.tsx', content);

