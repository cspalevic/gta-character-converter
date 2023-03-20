import { Spinner } from "@/ui/Spinner/Spinner";
import { ChangeEventHandler, useState } from "react";
import { RenderProps } from "use-prompt";
import cx from "classnames";
import styles from "./promptStyles.module.css";

type PromptProps = {
  fileUpload: Promise<PromiseSettledResult<string>>;
  completeUpload: (
    uploadId: string,
    name: string
  ) => Promise<PromiseSettledResult<"Ok">>;
} & RenderProps;

export default function Prompt({
  resolve,
  visible,
  fileUpload,
  completeUpload,
}: PromptProps) {
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [inputError, setInputError] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);

  const handlInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    setInputError(!value);
    setName(value);
  };

  const submit = async () => {
    if (!name) {
      setInputError(true);
      return;
    }
    setLoading(true);
    const settledFileUpload = await fileUpload;
    if (settledFileUpload.status === "rejected") {
      setLoading(false);
      setUploadError(true);
      return;
    }

    const uploadId = settledFileUpload.value;
    const completedUpload = await completeUpload(uploadId, name);
    if (completedUpload.status === "rejected") {
      setLoading(false);
      setUploadError(true);
      return;
    }

    resolve("");
  };

  if (!visible) return null;

  if (uploadError) {
    return (
      <div className={styles.prompt}>
        <div className={styles.body}>
          <p>
            Something went wrong uploading your image. Please try again later!
          </p>
          <button onClick={() => resolve("")}>I will</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.prompt}>
      <h2>{"Who's this?"}</h2>
      <div className={styles.body}>
        <div
          className={cx(styles.inputContainer, {
            [styles.inputContainerError]: !!inputError,
          })}
        >
          <input type="text" onChange={handlInputChange} />
          {inputError && <span className={styles.error}>Enter a name</span>}
        </div>
        <button onClick={() => submit()}>
          {loading ? <Spinner size="sm" /> : "Save"}
        </button>
      </div>
    </div>
  );
}
