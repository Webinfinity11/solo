"use client";

import { useEffect, useState } from "react";
import { getCurrentCustomer } from "@/lib/customers/actions";
import type { Customer } from "@/lib/customers/auth";

/** The signed-in customer, loaded after hydration so the pages themselves stay static. */
export function useCustomer() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentCustomer()
      .then((c) => active && setCustomer(c))
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  return { customer, setCustomer, loaded };
}
