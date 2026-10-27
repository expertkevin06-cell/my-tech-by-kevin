"use strict";
const CONFIG = {
  APP_NAME: "Ma Tech by Kevin",
  VERSION: "6.0.0",
  PACKAGE_ID: "com.kevin.matech",
  /* Seul ce mot de passe ouvre le mode admin (vérifié par hash SHA-256). */
  DEFAULT_ADMIN: { user: "admin", pass: "Kevin83600" },
  /* Contact admin pour les demandes d'accès tiers (mailto). À personnaliser. */
  ADMIN_EMAIL: "contact@matechbykevin.fr",
  YEARS: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
  PAGE_SIZE: 50,
  TOTAL_FICHES: 21000,
  K: { settings:"dtc_settings_v4", overrides:"dtc_overrides_v4", customs:"dtc_customs_v4",
       deleted:"dtc_deleted_v4", tiers:"dtc_tiers_v4", audit:"dtc_audit_v4", session:"dtc_session_v4" }
};
