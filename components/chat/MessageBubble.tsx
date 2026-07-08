import { Check, CheckCheck, Pencil, Trash2, X } from "lucide-react";
import styles from "./MessageBubble.module.scss";

type Props = {
  align: "left" | "right";
  content: string;
  timeLabel: string;
  tone: "accent" | "incoming";
  edited?: boolean;
  editedLabel?: string;
  read?: boolean;
  showStatus?: boolean;
  avatarLabel?: string;
  compact?: boolean;
  variant?: "default" | "incomingSoft" | "outgoingLarge";
  isEditing?: boolean;
  editValue?: string;
  editLabel?: string;
  deleteLabel?: string;
  onEditValueChange?: (value: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onStartEdit?: () => void;
  onDelete?: () => void;
};

export default function MessageBubble({
  align,
  content,
  timeLabel,
  tone,
  edited,
  editedLabel,
  read,
  showStatus,
  avatarLabel,
  compact,
  variant = "default",
  isEditing,
  editValue = "",
  editLabel,
  deleteLabel,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
}: Props) {
  const bubbleClass = [
    styles.bubble,
    tone === "accent" ? styles.accent : styles.incoming,
    variant === "incomingSoft" ? styles.incomingSoft : "",
    variant === "outgoingLarge" ? styles.outgoingLarge : "",
  ].join(" ");

  return (
    <div className={`${styles.row} ${align === "right" ? styles.right : styles.left}`}>
      {avatarLabel && align === "left" && <div className={styles.avatar}>{avatarLabel}</div>}
      <div className={`${styles.content} ${compact ? styles.compact : ""}`}>
        {isEditing ? (
          <div className={styles.editForm}>
            <input
              autoFocus
              className={styles.editInput}
              value={editValue}
              onChange={event => onEditValueChange?.(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter") onSaveEdit?.();
                if (event.key === "Escape") onCancelEdit?.();
              }}
            />
            <button className={`${styles.editButton} ${styles.save}`} onClick={onSaveEdit}>
              <Check size={14} />
            </button>
            <button className={`${styles.editButton} ${styles.cancel}`} onClick={onCancelEdit}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className={styles.bubbleWrap}>
            {(onStartEdit || onDelete) && (
              <div
                className={`${styles.actions} ${
                  align === "right" ? styles.actionsRight : styles.actionsLeft
                }`}
              >
                {onStartEdit && (
                  <button className={styles.actionButton} title={editLabel} onClick={onStartEdit}>
                    <Pencil size={11} />
                  </button>
                )}
                {onDelete && (
                  <button
                    className={`${styles.actionButton} ${styles.danger}`}
                    title={deleteLabel}
                    onClick={onDelete}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            )}
            <div className={bubbleClass}>
              {content}
              {edited && editedLabel && <span className={styles.edited}>({editedLabel})</span>}
            </div>
          </div>
        )}
        <div className={styles.meta}>
          <span>{timeLabel}</span>
          {showStatus && (read ? <CheckCheck size={11} /> : <Check size={11} />)}
        </div>
      </div>
    </div>
  );
}
