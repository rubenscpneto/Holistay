import * as React from "react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { FormFieldContext } from "./form"

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { name } = fieldContext

  return {
    name,
  }
}
