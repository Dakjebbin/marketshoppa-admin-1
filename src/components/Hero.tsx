"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiReceipt } from "react-icons/bi";
import { BsDot } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { MdOutlineShoppingBag, MdVerified } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { useAuth } from "../context/auth.context";

type User = {
  fullName: string;
  email: string;
  address: string;
};

type ItemType = {
  createdAt: string;
  _id: string;
  name: string;
  length: number;
  quantity: string;
  targetBudget: string;
  actualPrice?: number;
};

type quoteType = {
  _id: string;
  status: string;
  items: ItemType[];
  userId: User;
  createdAt: string;
  totalAmount: number;
  serviceCharge: number;
  deliveryFee: number;
};

const Hero = () => {
  const [quotes, setQuotes] = useState<quoteType[]>([]);
  const [quotesTab, setQuotesTab] = useState("need_quote");
  const [itemPrices, setItemPrices] = useState<
    Record<string, Record<number, string>>
  >({});
  const [deliveryFees, setDeliveryFees] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [dropDown, setDropDown] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_BASE_URL || "/api";

  const { user } = useAuth();

  const toggleDropDown = (id: string) => {
    setDropDown((prev) => (prev === id ? null : id));
  };

  const updateItemPrice = (
    prev: Record<string, Record<number, string>>,
    questionId: string,
    index: number,
    value: string
  ) => ({
    ...prev,
    [questionId]: {
      ...prev[questionId],
      [index]: value,
    },
  });

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/fetchlistAdmin`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setQuotes(response.data.orders);
        } else {
          toast.error("Something went wrong");
        }
      } catch (error) {
        if (error instanceof axios.AxiosError) {
          if (error?.response?.data) {
            toast.error(error?.response?.data?.message);
          }
        }
      }
    };

    fetchQuotes();
  }, [baseUrl]);

  if (!user) {
    return null;
  }

  if (user.role !== "Admin") {
    window.location.assign("/");
    toast.error("Not an admin");
    return null;
  }

  const getItemsTotal = (orderId: string) => {
    const prices = itemPrices[orderId] || {};
    return Object.values(prices).reduce((sum, p) => sum + (Number(p) || 0), 0);
  };


  const getServiceCharge = (orderId: string) => getItemsTotal(orderId) * 0.07;

  const getGrandTotal = (orderId: string) => {
    return (
      getItemsTotal(orderId) +
      getServiceCharge(orderId) +
      (Number(deliveryFees[orderId]) || 0)
    );
  };

  const sendQuote = async (orderId: string, items: ItemType[]) => {
    try {
      setLoading((prev) => ({ ...prev, [orderId]: true }));

      const prices = itemPrices[orderId] || {};
      const allItemsFilled = items.every((_, i) => Number(prices[i]) > 0);

      if (!allItemsFilled) {
        toast.error("Please fill in actual price for all items");
        return;
      }

      if (!deliveryFees[orderId] || Number(deliveryFees[orderId]) <= 0) {
        toast.error("Please fill in the delivery fee");
        return;
      }

      const updatedItems = items.map((item, i) => ({
        ...item,
        actualPrice: Number(itemPrices[orderId]?.[i]) || 0,
      }));

      const response = await axios.patch(
        `${baseUrl}/api/sendQuote/${orderId}`,
        {
          items: updatedItems,
          deliveryFee: Number(deliveryFees[orderId]) || 0,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Quote sent successfully!");
        setQuotes((prev) =>
          prev.map((q) => (q._id === orderId ? response.data.orders : q))
        );
      }
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        if (!error.response) {
          toast.error("Network error. Check your connection.");
        } else {
          toast.error(error.response.data?.message || "Something went wrong");
        }
      }
    } finally {
      setLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const canEdit = (status: string) => status === "pending_quote";

  const TAB_STATUS: Record<string, string> = {
    need_quote: "pending_quote",
    quote_sent: "quote_Sent",
    awaiting_payment: "payment_pending",
    payment_received: "confirmed",
    inDelivery: "inDelivery",
    delivered: "delivered",
    all: "all",
  };

  const filteredQuotes =
    quotesTab === "all"
      ? quotes
      : quotes.filter((q) => q.status === TAB_STATUS[quotesTab]);

  const pendingQuotes = quotes.filter((q) => q.status === "pending_quote");
  const quotesSent = quotes.filter((q) => q.status === "quote_Sent");
  const approved = quotes.filter((q) => q.status === "payment_pending");
  const paymentReceived = quotes.filter((q) => q.status === "confirmed");
  const inDelivery = quotes.filter((q) => q.status === "inDelivery");
  const delivered = quotes.filter((q) => q.status === "delivered");
  const deliveredCount = delivered.length;
  const inDeliveryCount = inDelivery.length;
  const paymentCount = paymentReceived.length;
  const approvedCount = approved.length;
  const sentCount = quotesSent.length;
  const pendingCount = pendingQuotes.length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className=" bg-[#f4f6f8]">
      <section className="m-auto w-[94%] py-10 ">
        <p className="text-2xl font-bold">Quote Manager</p>
        <p className="text-sm my-1 text-[#5a5f69]">
          Review customer orders and send pricing quotes
        </p>

        {/* quotes card */}
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="flex flex-col basis-70 grow bg-white border border-[#e5e7eb] rounded-xl px-5 py-4.5 gap-1">
            <p className="font-semibold text-2xl text-[#f59e0b]">
              {pendingCount}
            </p>
            <p className="text-sm text-[#4b5563]">Pending Quotes</p>
          </div>

          <div className="flex flex-col basis-70 bg-white grow border border-[#e5e7eb] rounded-xl px-5 py-4.5 gap-1">
            <p className="font-semibold text-2xl text-[#3b82f6]">{sentCount}</p>
            <p className="text-sm text-[#4b5563]">Quotes Sent</p>
          </div>

          <div className="flex flex-col basis-70 bg-white grow border border-[#e5e7eb] rounded-xl px-5 py-4.5 gap-1">
            <p className="font-semibold text-2xl text-[#15803d]">
              {approvedCount}
            </p>
            <p className="text-sm text-[#4b5563]">Approved</p>
          </div>

          <div className="flex flex-col basis-70 bg-white grow border border-[#e5e7eb] rounded-xl px-5 py-4.5 gap-1">
            <p className="font-semibold text-2xl text-[#0f766e]">
              {paymentCount}
            </p>
            <p className="text-sm text-[#4b5563]">Payment Received</p>
          </div>
        </div>
        {/* quotes quick links */}
        <div className="flex flex-wrap gap-3 my-5">
          {/* needs quote */}
          <button
            onClick={() => setQuotesTab("need_quote")}
            className={`flex items-center gap-2 text-[13px] font-semibold px-3.75 py-1.75 rounded-3xl transition-all cursor-pointer ${
              quotesTab === "need_quote"
                ? "bg-[#f0fdf4] border border-[#3ea40b] text-[#3ea40b]"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border hover:border-[#3ea40b60] hover:text-[#374151]"
            }`}
          >
            <p>Needs Quote</p>
            <p className="bg-[#f3f4f6] text-[#9ca3af] rounded-full px-1.75 py-px">
              {pendingCount}
            </p>
          </button>

          {/* quote sent */}
          <button
            onClick={() => setQuotesTab("quote_sent")}
            className={`flex items-center gap-2 text-[13px] font-semibold px-3.75 py-1.75 rounded-3xl transition-all cursor-pointer ${
              quotesTab === "quote_sent"
                ? "bg-[#f0fdf4] border border-[#3ea40b] text-[#3ea40b]"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border hover:border-[#3ea40b60] hover:text-[#374151]"
            }`}
          >
            <p>Quote Sent</p>
            <p className="bg-[#f3f4f6] text-[#9ca3af] rounded-full px-1.75 py-px">
              {sentCount}
            </p>
          </button>

          {/* Awaiting payment */}
          <button
            onClick={() => setQuotesTab("awaiting_payment")}
            className={`flex items-center gap-2 text-[13px] font-semibold px-3.75 py-1.75 rounded-3xl transition-all cursor-pointer ${
              quotesTab === "awaiting_payment"
                ? "bg-[#f0fdf4] border border-[#3ea40b] text-[#3ea40b]"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border hover:border-[#3ea40b60] hover:text-[#374151]"
            }`}
          >
            <p>Awaiting Payment</p>
            <p className="bg-[#f3f4f6] text-[#9ca3af] rounded-full px-1.75 py-px">
              {approvedCount}
            </p>
          </button>

          {/* payment received */}

          <button
            onClick={() => setQuotesTab("payment_received")}
            className={`flex items-center gap-2 text-[13px] font-semibold px-3.75 py-1.75 rounded-3xl transition-all cursor-pointer ${
              quotesTab === "payment_received"
                ? "bg-[#f0fdf4] border border-[#3ea40b] text-[#3ea40b]"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border hover:border-[#3ea40b60] hover:text-[#374151]"
            }`}
          >
            <p>Payment Received</p>
            <p className="bg-[#f3f4f6] text-[#9ca3af] rounded-full px-1.75 py-px">
              {paymentCount}
            </p>
          </button>

          {/* inDelivery */}

          <button
            onClick={() => setQuotesTab("inDelivery")}
            className={`flex items-center gap-2 text-[13px] font-semibold px-3.75 py-1.75 rounded-3xl transition-all cursor-pointer ${
              quotesTab === "inDelivery"
                ? "bg-[#f0fdf4] border border-[#3ea40b] text-[#3ea40b]"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border hover:border-[#3ea40b60] hover:text-[#374151]"
            }`}
          >
            <p>In Delivery</p>
            <p className="bg-[#f3f4f6] text-[#9ca3af] rounded-full px-1.75 py-px">
              {inDeliveryCount}
            </p>
          </button>

          {/* delivered */}

          <button
            onClick={() => setQuotesTab("delivered")}
            className={`flex items-center gap-2 text-[13px] font-semibold px-3.75 py-1.75 rounded-3xl transition-all cursor-pointer ${
              quotesTab === "delivered"
                ? "bg-[#f0fdf4] border border-[#3ea40b] text-[#3ea40b]"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border hover:border-[#3ea40b60] hover:text-[#374151]"
            }`}
          >
            <p>Delivered</p>
            <p className="bg-[#f3f4f6] text-[#9ca3af] rounded-full px-1.75 py-px">
              {deliveredCount}
            </p>
          </button>

          <button
            onClick={() => setQuotesTab("all")}
            className={`flex items-center gap-2 text-[13px] font-semibold px-3.75 py-1.75 rounded-3xl transition-all cursor-pointer ${
              quotesTab === "all"
                ? "bg-[#f0fdf4] border border-[#3ea40b] text-[#3ea40b]"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border hover:border-[#3ea40b60] hover:text-[#374151]"
            }`}
          >
            <p>All</p>
            <p className="bg-[#f3f4f6] text-[#9ca3af] rounded-full px-1.75 py-px">
              {quotes.length}
            </p>
          </button>
        </div>
        {filteredQuotes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              background: "#fff",
              border: "2px dashed #e5e7eb",
              borderRadius: "16px",
            }}
          >
            <MdOutlineShoppingBag
              size={36}
              color="#d1d5db"
              style={{ margin: "0 auto 10px" }}
            />
            <p style={{ color: "#9ca3af", fontWeight: 600 }}>No orders here</p>
          </div>
        ) : (
          filteredQuotes.map((q) => (
            <div
              key={q._id}
              className=" my-4 bg-white border border-[#e5e7eb] rounded-xl"
            >
              <div className="flex w-full px-5 py-4.5">
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#f0fdf4] rounded-lg border border-[#d1fae5] md:w-10 w-7.5 md:h-10 h-7.5 flex items-center justify-center shrink-0">
                      <BiReceipt className="text-[#3ea40b]" size={22} />
                    </div>
                    <div>
                      <p className="md:text-sm text-[13px] font-bold text-[#111827]">
                        {q._id}
                      </p>
                      <div className="flex items-center text-[11px] flex-wrap text-[#9ca3af]">
                        <p>{q.userId.fullName}</p>
                        <BsDot />
                        <p>{q.items.length} items</p>
                        <BsDot />
                        <p>{formatDate(q.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center md:gap-3 gap-1">
                    {q.status === "pending_quote" && (
                      <p className="bg-[#fef3c7] text-[#b45309] text-[11px] font-bold py-1 md:px-2.75 px-2.25 whitespace-nowrap border rounded-3xl border-[b4530930]">
                        Needs Quote
                      </p>
                    )}

                    {q.status === "quote_Sent" && (
                      <span className="flex items-center gap-2">
                        <p className="font-semibold">₦ {q.totalAmount}</p>
                        <p className="bg-[#eff6ff] text-[#1d4ed8] text-[11px] font-bold py-1 md:px-2.75 px-2.25 whitespace-nowrap border rounded-3xl border-[b4530930]">
                          Quote Sent
                        </p>
                      </span>
                    )}

                    {q.status === "payment_pending" && (
                      <span className="flex items-center gap-2">
                        <p className="font-semibold">₦ {q.totalAmount}</p>
                        <p className="bg-[#f5f3ff] text-[#7c3aed] text-[11px] font-bold py-1 md:px-2.75 px-2.25 whitespace-nowrap border rounded-3xl border-[b4530930]">
                          ⏳ Awaiting Payment
                        </p>
                      </span>
                    )}

                    {q.status === "confirmed" && (
                      <span className="flex items-center gap-2">
                        <p className="font-semibold">₦ {q.totalAmount}</p>
                        <p className="bg-[#f5f3ff] text-[#7c3aed] text-[11px] font-bold py-1 md:px-2.75 px-2.25 whitespace-nowrap border rounded-3xl border-[b4530930]">
                          💰 Payment Received
                        </p>
                      </span>
                    )}
                    <button
                      className="cursor-pointer"
                      onClick={() => toggleDropDown(q._id)}
                    >
                      {" "}
                      <IoIosArrowDown className="text-[#9ca3af]" />
                    </button>
                  </div>
                </div>
              </div>

              {dropDown === q._id && (
                <div>
                  <div className="bg-[#f9fafb] border-b border-t border-[#e5e7eb]">
                    <div className="px-5 py-4.5 flex gap-4 text-[#9ca3af] flex-wrap">
                      <div className="flex items-center gap-4">
                        <FaUser size={13} />
                        <div className="flex flex-col gap-2">
                          <p className="text-[11px] font-bold">CUSTOMER</p>
                          <p className="text-[#374151] font-bold text-[12px]">
                            {q.userId.fullName}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-col gap-2">
                          <p className="text-[11px] font-bold">EMAIL</p>
                          <p className="text-[#374151] font-bold text-[12px]">
                            {q.userId.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <TbTruckDelivery size={13} />
                        <div className="flex flex-col gap-2">
                          <p className="text-[11px] font-bold">
                            DELIVERY ADDRESS
                          </p>
                          <p className="text-[#374151] font-bold text-[12px]">
                            {q.userId.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4.5">
                    <p className="text-[#9ca3af] uppercase text-[12px] font-bold ">
                      Items & Pricing
                    </p>

                    <div className="bg-[#f9fafb] mt-4 border border-[#e5e7eb] rounded-xl overflow-x-auto">
                      <div className="min-w-150">
                        {/* header row */}
                        <div className="grid grid-cols-4 px-4 py-2 border-b border-[#e5e7eb]">
                          {[
                            "Product",
                            "Qty",
                            "Budget (₦)",
                            "Actual Price (₦)",
                          ].map((h) => (
                            <p
                              key={h}
                              className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider"
                            >
                              {h}
                            </p>
                          ))}
                        </div>

                        {/* data row */}
                        {q.items.map((item, i) => (
                          <div
                            key={item._id}
                            className="grid grid-cols-4 border-b border-[#e5e7eb] px-4 py-3 items-center"
                          >
                            <p className="text-[13px] font-semibold text-[#111827]">
                              {item.name}
                            </p>
                            <p className="text-[12.5px] text-[#6b7280]">
                              {item.quantity}
                            </p>
                            <p className="text-[12.5px] text-[#6b7280]">
                              ₦ {item.targetBudget || "0"}
                            </p>
                            <input
                              className="border border-[#e5e7eb] rounded-lg px-3 py-1.5 text-[12.5px] text-[#111827] outline-none focus:border-[#3ea40b] w-full"
                              type="number"
                              disabled={!canEdit(q.status)}
                              value={
                                canEdit(q.status)
                                  ? itemPrices[q._id]?.[i] || ""
                                  : item.actualPrice || ""
                              }
                              placeholder="0.00"
                              onChange={(e) =>
                                setItemPrices((prev) => updateItemPrice(prev, q._id, i, e.target.value))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <form className="px-5 flex flex-col w-full gap-5 items-center justify-between ">
                    <div className="flex md:flex-row flex-col w-full gap-5">
                      <div className="flex flex-col w-full items-center gap-3 justify-between">
                        <label htmlFor="serviceCharge" className="text-[#9ca3af] w-full text-[12px] font-bold uppercase">
                          Service Charge (₦)
                        </label>

                        <input
                          className="border border-[#e5e7eb] rounded-lg px-3.25 py-2.75 text-[14px] text-[#111827] outline-none focus:border-[#3ea40b] w-full bg-[#f9fafb]"
                          type="number"
                          id="serviceCharge"
                          readOnly
                          value={
                            canEdit(q.status)
                              ? getServiceCharge(q._id).toFixed(2)
                              : q.serviceCharge
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex flex-col w-full items-center gap-3">
                        <label htmlFor="deliveryFee" className="text-[#9ca3af] w-full text-[12px] font-bold uppercase">
                          Delivery fee (₦)
                        </label>
                        <input
                          className="border border-[#e5e7eb] rounded-lg px-3.25 py-2.75 text-[14px] text-[#111827] outline-none focus:border-[#3ea40b] w-full bg-[#f9fafb]"
                          type="number"
                          placeholder="0.00"
                          required
                          id="deliveryFee"
                          disabled={!canEdit(q.status)}
                          value={
                            canEdit(q.status)
                              ? deliveryFees[q._id] || ""
                              : q.deliveryFee || ""
                          }
                          onChange={(e) =>
                            setDeliveryFees((prev) => ({
                              ...prev,
                              [q._id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex mb-7 justify-between border border-[#e5e7eb] rounded-lg px-3.75 py-2.75 bg-[#f9fafb] w-full items-center gap-3 ">
                      <div className="flex flex-col">
                        <label htmlFor="computedtotal" className="text-[#9ca3af] w-full text-[12px] font-bold uppercase">
                          Computed Total (₦)
                        </label>
                        <input
                          className=" rounded-lg bg-text px-3.25 py-2.75 text-[25px] text-[#111827] outline-none focus:border-[#3ea40b] font-bold"
                          type="text"
                          readOnly
                          id="computedtotal"
                          value={
                            canEdit(q.status)
                              ? `₦ ${getGrandTotal(q._id).toFixed(2)}` // 👈
                              : `₦ ${q.totalAmount}` // 👈
                          }
                          placeholder=" ₦0"
                        />
                      </div>
                      {canEdit(q.status) && (
                        <button
                          onClick={() => sendQuote(q._id, q.items)}
                          disabled={loading[q._id]}
                          className="bg-primary text-white flex gap-2 items-center px-6 py-3 font-semibold rounded-xl cursor-pointer text-sm disabled:opacity-50"
                        >
                          <IoSend />
                          {loading[q._id]
                            ? "Sending..."
                            : "Send Quote to Customer"}
                        </button>
                      )}

                      {/* show this instead when quote already sent */}
                      {!canEdit(q.status) && (
                        <div>
                          <div className="flex items-center w-fit gap-1.75 bg-[#eff6ff] border-[1.5px] border-[#bfdbfe] rounded-[10px] px-4 py-2.5">
                            <span className="flex items-center gap-1 w-fit">
                              {q.status === "quote_Sent" && (
                                <IoSend size={16} color="#1d4ed8" />
                              )}
                              {q.status === "payment_pending" && (
                                <BiReceipt
                                  className="bg-[#f5f3ff] text-[#7c3aed]"
                                  size={20}
                                  color="#1d4ed8"
                                />
                              )}
                              {q.status === "confirmed" && (
                                <MdVerified
                                  className="bg-[#ccfbf1] text-[#7c3aed]"
                                  size={20}
                                  color="#1d4ed8"
                                />
                              )}

                              <p>
                                {" "}
                                {q.status === "quote_Sent" && "Quote Sent"}
                              </p>
                              <p className="text-[#7c3aed] font-semibold text-sm">
                                {" "}
                                {q.status === "payment_pending" &&
                                  "⏳ Awaiting Payment"}
                              </p>
                              <p className="text-[#111827] font-semibold text-sm">
                                {" "}
                                {q.status === "confirmed" &&
                                  "💰 Payment Received"}
                              </p>
                            </span>
                          </div>
                          <span className="text-[11px] text-[#9ca3af]">
                            {q.status === "payment_pending" &&
                              "Customer Approved - waiting for payment"}
                          </span>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default Hero;
