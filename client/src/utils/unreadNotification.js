export const unreadNotificationsFunc = (notification) => {
    return notification.filter((n) => n.isRead === false);
}