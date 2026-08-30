import { useState } from "react";

export function useFormState(initialValues) {
  const [values, setValues] = useState(initialValues);

  function setField(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function setFields(partialValues) {
    setValues((previous) => ({ ...previous, ...partialValues }));
  }

  function reset(nextValues = initialValues) {
    setValues(nextValues);
  }

  return { values, setField, setFields, reset };
}
