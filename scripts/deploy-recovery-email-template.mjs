#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_TEMPLATE_PATH = "supabase/email-templates/recovery.html";
const DEFAULT_SUBJECT = "Reset your Ashfall Case Library password";

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(name, fallback) {
  return process.env[name]?.trim() || fallback;
}

async function deployRecoveryTemplate() {
  const dryRun = process.argv.includes("--dry-run");

  const projectRef = getRequiredEnv("SUPABASE_PROJECT_REF");
  const accessToken = getRequiredEnv("SUPABASE_ACCESS_TOKEN");
  const templatePath = getOptionalEnv(
    "SUPABASE_RECOVERY_TEMPLATE_PATH",
    DEFAULT_TEMPLATE_PATH
  );
  const subject = getOptionalEnv(
    "SUPABASE_RECOVERY_TEMPLATE_SUBJECT",
    DEFAULT_SUBJECT
  );

  const absoluteTemplatePath = path.resolve(process.cwd(), templatePath);
  const templateContent = await readFile(absoluteTemplatePath, "utf8");

  if (!templateContent.includes("{{ .ConfirmationURL }}")) {
    throw new Error(
      `Recovery template must include {{ .ConfirmationURL }}: ${absoluteTemplatePath}`
    );
  }

  const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
  const payload = {
    mailer_subjects_recovery: subject,
    mailer_templates_recovery_content: templateContent
  };

  if (dryRun) {
    console.info("Dry run only. No Supabase config was changed.");
    console.info(`Project: ${projectRef}`);
    console.info(`Template path: ${absoluteTemplatePath}`);
    console.info(`Subject: ${subject}`);
    console.info(`Template size: ${templateContent.length} characters`);
    return;
  }

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(
      `Supabase API request failed (${response.status} ${response.statusText}): ${responseBody}`
    );
  }

  console.info("Supabase recovery email template deployed.");
  console.info(`Project: ${projectRef}`);
  console.info(`Template path: ${absoluteTemplatePath}`);
  console.info(`Subject: ${subject}`);
}

deployRecoveryTemplate().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
