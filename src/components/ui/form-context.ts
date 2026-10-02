import { createContext, useContext } from "react"
import { useFormContext } from "react-hook-form"

export const FormFieldContext = createContext<{ name: string } | null>(null)
export const FormItemContext = createContext<{ id: string } | null>(null)

export function useFormField() {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const form = useFormContext()
  if (!fieldContext || !itemContext || !form) {
    throw new Error("useFormField should be used within <FormField> and <FormItem> inside <Form>")
  }
  const fieldState = form.getFieldState(fieldContext.name, form.formState)
  const { id } = itemContext
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}
