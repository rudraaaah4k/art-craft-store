import re

def process_file():
    with open('src/app/admin/AdminCatalog.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Boilerplate replacements
    content = content.replace(
        "const [error, setError] = useState('')",
        "const [error, setError] = useState('')\n  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})"
    )
    content = content.replace(
        "setError('')",
        "setError('')\n    setFieldErrors({})"
    )
    content = re.sub(
        r"function validateProduct\(\) \{.*?return ''\s*\}",
        """function validateProduct() {
    const errs: Record<string, string> = {}
    if (!productDraft.title.trim()) errs.title = 'Product title is required'
    if (Number(productDraft.price) <= 0) errs.price = 'Price must be greater than zero'
    if (productDraft.salePrice && Number(productDraft.salePrice) > Number(productDraft.price))
      errs.salePrice = 'Sale price cannot exceed price'
    if (Number(productDraft.weightGrams) <= 0) errs.weightGrams = 'Weight is required'
    if (!productDraft.categoryId) errs.categoryId = 'Choose a category'
    if (!productDraft.sku.trim()) errs.sku = 'SKU is required'
    return errs
  }""",
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r"const validationError = validateProduct\(\).*?return\s*\}",
        """const validationError = validateProduct()
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
    }""",
        content,
        flags=re.DOTALL
    )
    
    # Update all 3 catches
    for entity in ['Product', 'Category', 'Coupon']:
        pattern = r"\} catch \(caught\) \{\s*setError\(caught instanceof Error \? caught\.message : '" + entity + r" could not be saved'\)(?:\s*requestAnimationFrame\(\(\) => formAlertRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth', block: 'nearest' \}\)\))?\s*\}"
        repl = f"""}} catch (caught: any) {{
      if (caught.isFieldErrors) {{
        setFieldErrors(caught.fieldErrors)
        requestAnimationFrame(() => {{
          const firstError = document.querySelector('[aria-invalid="true"]')
          if (firstError) {{
            firstError.scrollIntoView({{ behavior: 'smooth', block: 'center' }})
            ;(firstError as HTMLElement).focus()
          }}
        }})
      }} else {{
        setError(caught instanceof Error ? caught.message : '{entity} could not be saved')
      }}
    }}"""
        content = re.sub(pattern, repl, content)

    content = re.sub(
        r"async function responseMessage\(response: Response\) \{.*?return data\s*\}",
        """async function responseMessage(response: Response) {
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
}""",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r"const file = event\.target\.files\?\.\[0\]\s*if \(!file\) return\s*clearNotice\(\)\s*setUploadError\(''\)\s*setBusy\(true\)",
        """const file = event.target.files?.[0]
    if (!file) return
    clearNotice()
    setUploadError('')
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image must be under 4 MB')
      requestAnimationFrame(() => uploadAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
      event.target.value = ''
      return
    }
    setBusy(true)""",
        content
    )

    content = content.replace(
        "export default function AdminCatalog() {",
        """function getInputClass(hasError: boolean) {
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

export default function AdminCatalog() {"""
    )

    form_handler = """onChange={(e) => {
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
  }}"""
    
    content = re.sub(r'<form\s+onSubmit=\{saveProduct\}', f'<form onSubmit={{saveProduct}} {form_handler}', content)
    content = re.sub(r'<form\s+onSubmit=\{saveCategory\}', f'<form onSubmit={{saveCategory}} {form_handler}', content)
    content = re.sub(r'<form\s+onSubmit=\{saveCoupon\}', f'<form onSubmit={{saveCoupon}} {form_handler}', content)

    def map_id(id_val):
        if id_val.startswith('product-'):
            f = id_val.replace('product-', '')
            if f == 'category': return 'categoryId'
            if f == 'sale-price': return 'salePricePaise'
            if f == 'price': return 'pricePaise'
            if f == 'processing-days': return 'processingDays'
            if f == 'length': return 'lengthCm'
            if f == 'width': return 'widthCm'
            if f == 'height': return 'heightCm'
            if f == 'gst': return 'gstPercent'
            return f
        if id_val.startswith('category-'): return id_val.replace('category-', '')
        if id_val.startswith('coupon-'):
            f = id_val.replace('coupon-', '')
            if f == 'discount-value': return 'discountValue'
            if f == 'min-order': return 'minOrderPaise'
            if f == 'max-uses': return 'maxUses'
            if f == 'expiry': return 'validUntil'
            return f
        if id_val.startswith('variant-'):
            parts = id_val.split('-')
            if len(parts) == 3:
                f = parts[1]
                if f == 'price': return f"variants.${{{parts[2]}}}.pricePaise"
                return f"variants.${{{parts[2]}}}.{f}"
        if id_val.startswith('image-url'):
            parts = id_val.split('-')
            if len(parts) == 3:
                return f"images.${{{parts[2]}}}.url"
        if id_val.startswith('image-alt'):
            parts = id_val.split('-')
            if len(parts) == 3:
                return f"images.${{{parts[2]}}}.altText"
        if id_val.startswith('seo-meta-title'): return 'metaTitle'
        if id_val.startswith('seo-meta-description'): return 'metaDescription'
        return None

    lines = content.split('\\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if 'className={inputClass}' in line:
            # Look backwards for ID
            id_val = None
            is_tpl = False
            for j in range(i-1, i-5, -1):
                if j < 0: break
                id_match = re.search(r'id=(?:"([^"]+)"|\{`([^`]+)`\})', lines[j])
                if id_match:
                    if id_match.group(1):
                        id_val = id_match.group(1)
                        is_tpl = False
                    else:
                        id_val = id_match.group(2)
                        is_tpl = True
                    break
            
            if id_val:
                field = map_id(id_val)
                if field:
                    indent = line[:len(line) - len(line.lstrip())]
                    
                    if is_tpl and '${' in field:
                        field_key = f"[`{field}`]"
                    else:
                        field_key = f"['{field}']"

                    err_id = f"{{`{id_val}-error`}}" if is_tpl else f'"{id_val}-error"'
                    
                    new_class = f"className={{getInputClass(!!fieldErrors{field_key})}}"
                    aria = f"aria-invalid={{!!fieldErrors{field_key}}} aria-describedby={{fieldErrors{field_key} ? {err_id} : undefined}}"
                    
                    # replace on this line
                    new_lines.append(indent + f"{new_class} {aria}")
                    
                    # now look forward for the end of this tag to inject the error message
                    # the end could be "/>", "</textarea>", or "</select>"
                    err_tag = indent + f"<FieldError error={{fieldErrors{field_key}}} id={err_id} />"
                    
                    # advance until we find the end of the tag
                    i += 1
                    while i < len(lines):
                        end_line = lines[i]
                        new_lines.append(end_line)
                        if '/>' in end_line or '</textarea>' in end_line or '</select>' in end_line:
                            new_lines.append(err_tag)
                            break
                        i += 1
                    i += 1
                    continue
        
        new_lines.append(line)
        i += 1

    with open('src/app/admin/AdminCatalog.tsx', 'w', encoding='utf-8') as f:
        f.write('\\n'.join(new_lines))

if __name__ == "__main__":
    process_file()
