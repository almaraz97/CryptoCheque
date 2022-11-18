import { Select } from "@chakra-ui/react";
import { Field } from "formik";

function ModuleSelect() {
  return (
    <Field
      name="mode"
      // validate={validateAmount}
    >
      {({
        field,
        form: { setFieldValue, setFieldTouched, errors, touched, values },
      }: any) => (
        <Select
          w={120}
          placeholder="Select"
          {...field}
          onChange={(value) => setFieldValue("module", value)}
          onBlur={() => setFieldTouched("module", true)}
          value={values.module}
          flexGrow={1}
        >
          <option value="self">Self-serve</option>
          <option value="byoa">BYOA</option>
        </Select>
      )}
    </Field>
  );
}

export default ModuleSelect;
