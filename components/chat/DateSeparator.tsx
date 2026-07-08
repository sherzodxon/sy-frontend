import styles from "./DateSeparator.module.scss";

type Props = {
  label: string;
  plain?: boolean;
};

export default function DateSeparator({ label, plain }: Props) {
  return (
    <div className={`${styles.separator} ${plain ? styles.plain : ""}`}>
      <div className={styles.line} />
      <span className={styles.label}>{label}</span>
      <div className={styles.line} />
    </div>
  );
}
