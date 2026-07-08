import { Loader2, LogOut, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { AdminUser } from "@/services/api";
import AdminUserRow from "./AdminUserRow";
import styles from "@/app/admin/AdminPage.module.scss";

type Props = {
  users: AdminUser[];
  filteredUsers: AdminUser[];
  selectedUserId?: string;
  search: string;
  totalUnread: number;
  loadingUsers: boolean;
  labels: {
    title: string;
    users?: string;
    unread: string;
    logout: string;
    search: string;
    no_users: string;
    delete_user: string;
  };
  hidden: boolean;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
  onSelect: (user: AdminUser) => void;
  onDelete: (user: AdminUser, event: React.MouseEvent) => void;
};

export default function AdminSidebar({
  users,
  filteredUsers,
  selectedUserId,
  search,
  totalUnread,
  loadingUsers,
  labels,
  hidden,
  onSearchChange,
  onRefresh,
  onLogout,
  onSelect,
  onDelete,
}: Props) {
  return (
    <aside className={`${styles.sidebar} ${hidden ? styles.sidebarHidden : ""}`}>
      <div className={styles.topbar}>
        <div className={styles.titleGroup}>
          <div className={styles.tile}>
            <ShieldCheck size={15} />
          </div>
          <div>
            <p className={styles.title}>{labels.title}</p>
            <p className={styles.caption}>
              {users.length} {labels.users?.toLowerCase()}
              {totalUnread > 0 && (
                <span className={styles.unread}>
                  · {totalUnread} {labels.unread}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className={styles.toolbar}>
          <button className={styles.toolButton} onClick={onRefresh}>
            <RefreshCw size={13} />
          </button>
          <button className={styles.toolButton} onClick={onLogout}>
            <LogOut size={12} />
            <span className={styles.hideOnMobile}>{labels.logout}</span>
          </button>
        </div>
      </div>

      <div className={styles.searchArea}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={14} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder={labels.search}
            value={search}
            onChange={event => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <div className={styles.usersList}>
        {loadingUsers ? (
          <div className={styles.center}>
            <Loader2 className={styles.spin} size={22} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <Users className={styles.emptyStateIcon} size={32} />
            <p>{labels.no_users}</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <AdminUserRow
              key={user.id}
              user={user}
              isActive={selectedUserId === user.id}
              deleteUserLabel={labels.delete_user}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </aside>
  );
}
