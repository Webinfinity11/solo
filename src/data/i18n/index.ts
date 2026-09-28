// Translated content per locale. Add a folder per new locale and register it here.
import type { Locale } from "@/i18n/config";
import * as ka from "./ka/content";
import * as en from "./en/content";
import * as ru from "./ru/content";

export const content: Record<Locale, typeof ka> = { ka, en, ru };
