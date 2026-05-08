"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  isStoreOpen,
  getNextOpeningMessage,
  getTodayHoursFormatted,
} from "@/lib/utils/business-hours";

export function useBusinessHours() {
  const [state, setState] = useState({
    isOpen: false,
    currentSlot: null,
    nextOpeningMessage: "",
    todayHours: "",
    loading: true,
  });

  useEffect(() => {
    async function fetchAndCheck() {
      const supabase = createClient();

      const { data: config } = await supabase
        .from("store_config")
        .select("business_hours")
        .single();

      if (!config) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const now = new Date();
      const { isOpen, currentSlot } = isStoreOpen(config.business_hours, now);

      setState({
        isOpen,
        currentSlot,
        nextOpeningMessage: getNextOpeningMessage(config.business_hours, now),
        todayHours: getTodayHoursFormatted(config.business_hours, now),
        loading: false,
      });
    }

    fetchAndCheck();

    // Re-chequea cada 5 minutos por si abre/cierra
    const interval = setInterval(fetchAndCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
