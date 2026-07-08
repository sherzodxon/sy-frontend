"use client";

import { Loader2, Send } from "lucide-react";
import styles from "./MessageComposer.module.scss";

type Props = {
  value: string;
  placeholder: string;
  sending: boolean;
  avatarLabel: string;
  admin?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onFocus?: () => void;
};

export default function MessageComposer({
  value,
  placeholder,
  sending,
  avatarLabel,
  admin,
  onChange,
  onSend,
  onFocus,
}: Props) {
  return (
    <div className={`${styles.bar} ${admin ? styles.admin : styles.sticky}`}>
      <div className={admin ? styles.form : styles.inner}>
        <div className={admin ? styles.avatar : styles.form}>
          {!admin && <div className={styles.avatar}>{avatarLabel}</div>}
          {!admin && (
            <>
              <input
                className={styles.input}
                type="text"
                value={value}
                onChange={event => onChange(event.target.value)}
                onKeyDown={event => event.key === "Enter" && !event.shiftKey && onSend()}
                placeholder={placeholder}
              />
              <button className={styles.send} onClick={onSend} disabled={!value.trim() || sending}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </>
          )}
          {admin && avatarLabel}
        </div>
        {admin && (
          <>
            <input
              className={styles.input}
              type="text"
              value={value}
              onFocus={onFocus}
              onChange={event => onChange(event.target.value)}
              onKeyDown={event => event.key === "Enter" && !event.shiftKey && onSend()}
              placeholder={placeholder}
            />
            <button className={styles.send} onClick={onSend} disabled={!value.trim() || sending}>
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
