import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, LogOut, Package, User } from "lucide-react";
import styles from "./CustomerDashboard.module.css";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
}

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setLocation("/login");
      return;
    }
    setUserData(JSON.parse(user));

    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders);
      setOrders(parsedOrders);
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  if (!userData) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brandSection}>
          <h1>StyleShop</h1>
        </div>
        <nav className={styles.nav}>
          <Button variant="ghost" onClick={() => setLocation("/shop")}>
            Shop
          </Button>
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            Orders
          </Button>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.userSection}>
          <Card>
            <CardHeader>
              <CardTitle className={styles.profileTitle}>
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.profileContent}>
                <Avatar className={styles.avatar}>
                  <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                </Avatar>
                <div className={styles.userInfo}>
                  <h3>{userData.name}</h3>
                  <p>{userData.email}</p>
                </div>
                <Button variant="destructive" onClick={handleLogout} className={styles.logoutBtn}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.ordersSection}>
          <Card>
            <CardHeader>
              <CardTitle className={styles.ordersTitle}>
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className={styles.ordersScrollArea}>
                {orders.length === 0 ? (
                  <div className={styles.noOrders}>
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    <p>No orders found</p>
                    <Button onClick={() => setLocation("/shop")}>Start Shopping</Button>
                  </div>
                ) : (
                  orders.map((order, index) => (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <h4>Order #{order.id}</h4>
                        <span>{order.date}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className={styles.orderItems}>
                        {order.items.map((item) => (
                          <div key={item.id} className={styles.orderItem}>
                            <img src={item.image} alt={item.name} className={styles.itemImage} />
                            <div className={styles.itemDetails}>
                              <h5>{item.name}</h5>
                              <p>Qty: {item.quantity}</p>
                              <p>${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-2" />
                      <div className={styles.orderTotal}>
                        <strong>Total:</strong>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
