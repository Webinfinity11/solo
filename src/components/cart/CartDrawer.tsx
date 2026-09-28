"use client";

import Link from "next/link";
import { useCart, cartCount } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { formatPrice } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { CartLine, useCartLines } from "./CartLine";

export function CartDrawer() {
  const { t, href } = useI18n();
  const open = useCart((s) => s.drawerOpen);
  const close = useCart((s) => s.closeDrawer);
  const items = useCart((s) => s.items);
  const { lines, subtotal } = useCartLines();
  const count = cartCount(items);

  return (
    <Modal
      open={open}
      onClose={close}
      variant="drawer"
      eyebrow={t.cart.eyebrow}
      title={`${t.cart.title} (${count})`}
      closeLabel={t.common.close}
    >
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center text-muted">
          <Icon name="cart" className="mb-5 size-10 text-blue" />
          <h3 className="mb-2 text-[19px] font-bold text-navy">{t.cart.empty}</h3>
          <p className="mb-6 text-[14px]">{t.cart.emptyText}</p>
          <Link href={href("/products")} onClick={close} className="btn btn-navy">
            {t.cart.browse} <Icon name="arrow" className="size-[18px]" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto px-5 sm:px-7">
            {lines.map((line, i) => (
              <div key={line.variant.id} className="animate-fade-up" style={{ animationDelay: `${120 + i * 70}ms` }}>
                <CartLine line={line} compact onNavigate={close} />
              </div>
            ))}
          </div>
          <div className="mt-auto shrink-0 border-t border-line bg-mist px-5 py-5 sm:px-7">
            <div className="mb-1 flex items-center justify-between text-[15px] font-bold">
              <span>{t.cart.subtotal}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="mb-4 text-[12px] text-muted">
              {t.cart.shipping}: {t.cart.shippingAtCheckout}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Link href={href("/cart")} onClick={close} className="btn btn-ghost bg-white">
                {t.cart.viewCart}
              </Link>
              <Link href={href("/checkout")} onClick={close} className="btn btn-navy">
                {t.cart.checkout}
              </Link>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">{t.cart.note}</p>
          </div>
        </>
      )}
    </Modal>
  );
}
