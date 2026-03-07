"use client";

import { useTranslations } from "next-intl";
import { useNotifications } from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            {t("markAllRead")}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Bell
                        className={`mt-0.5 h-4 w-4 ${
                          !notification.read
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.read && (
                        <Badge
                          variant="default"
                          className="h-2 w-2 rounded-full p-0"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8" />
              <p>{t("noNotifications")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
