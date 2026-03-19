"use client";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Hero from "../components/Hero";
import { useAuth } from "../context/auth.context";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const Home = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  interface Order {
    id: string;
    customerName: string;
  }

  const notificationsSupported = () => {
    return 'Notification' in window && 
           'serviceWorker' in navigator;
  };

  useEffect(() => {
    if (!user || user.role !== "Admin") return;

    if (notificationsSupported() && Notification.permission === "default") {
      Notification.requestPermission();
    }

    socketRef.current = io(import.meta.env.VITE_BASE_URL || "/api", {
      withCredentials: true,
      transports: ['polling', 'websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 5,
    });

    socketRef.current.emit("join_admin");

    socketRef.current.on("new_order", (order: Order) => {
      toast.success(`🛒 New Order from ${order.customerName}!`);
      if (notificationsSupported() && Notification.permission === "granted") {
        new Notification("🛒 New Order Received!", {
          body: `${order.customerName} placed an order`,
          icon: "/logo.svg", 
          badge: "/logo.svg",
          tag: order.id,
        });
      }
    });

    return () => {
      socketRef.current?.off("new_order");
      socketRef.current?.disconnect();
    };
  }, [user])

  if (!user) return null;

  if (user.role !== "Admin") {
    window.location.assign("/");
    toast.error("Not admin");
    return null;
  }
  return (
    <>
      {user && (
        <div>
          <Header />
          <Hero />
        </div>
      )}

      {!user && (<div>session expired</div>)}
    </>
  );
};

export default Home;
