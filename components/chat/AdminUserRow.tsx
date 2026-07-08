import { memo } from "react";
import { Trash2 } from "lucide-react";
import { AdminUser } from "@/services/api";
import { formatAdminTime } from "./chatUtils";
import styles from "./AdminUserRow.module.scss";

type Props = {
  user: AdminUser;
  isActive: boolean;
  deleteUserLabel: string;
  onSelect: (user: AdminUser) => void;
  onDelete: (user: AdminUser, event: React.MouseEvent) => void;
};

const AdminUserRow = memo(function AdminUserRow({
  user,
  isActive,
  deleteUserLabel,
  onSelect,
  onDelete,
}: Props) {
  return (
    <div
      className={`${styles.row} ${isActive ? styles.active : ""}`}
      onClick={() => onSelect(user)}
    >
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>{user.name[0]?.toUpperCase()}</div>
        {user.unreadCount > 0 && (
          <span className={styles.badge}>{user.unreadCount > 9 ? "9+" : user.unreadCount}</span>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.top}>
          <p className={styles.name}>{user.name}</p>
          {user.lastMessage && (
            <span className={styles.time}>{formatAdminTime(user.lastMessage.createdAt)}</span>
          )}
        </div>
        <p className={styles.preview}>{user.lastMessage ? user.lastMessage.content : user.email}</p>
      </div>
      <button
        className={styles.delete}
        onClick={event => onDelete(user, event)}
        title={deleteUserLabel}
      >
        <Trash2 color="#E86048" size={14} />
      </button>
    </div>
  );
});

export default AdminUserRow;
