import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { subscribeToNotifications, unsubscribeFromNotifications, Notification, NotificationPayload } from '@/services/notifications';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleNewNotification = (payload: NotificationPayload) => {
        setNotifications(prev => [payload.new, ...prev]);
    };

    const channel = subscribeToNotifications(handleNewNotification);

    return () => {
      unsubscribeFromNotifications();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">You have {unreadCount} unread messages.</p>
          </div>
          <div className="grid gap-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0">
                <span className={`flex h-2 w-2 translate-y-1 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-sky-500'}`} />
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
