import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactConfig, siteConfig } from "@/config/site";
import { submitContact } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Quantum Services" },
      {
        name: "description",
        content: "Reach the Quantum Services team about proxying, networking or custom builds.",
      },
      { property: "og:title", content: "Contact Quantum Services" },
      {
        property: "og:description",
        content: "Reach the Quantum Services team about proxying, networking or custom builds.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const send = useServerFn(submitContact);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const set = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    for (const field of contactConfig.fields) {
      const value = (values[field.name] ?? "").trim();
      if (field.required && !value) next[field.name] = `${field.label} is required`;
      else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        next[field.name] = "Enter a valid email address";
      else if (field.maxLength && value.length > field.maxLength)
        next[field.name] = `Keep this under ${field.maxLength} characters`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setState("sending");
    try {
      const payload: Record<string, string> = {};
      for (const field of contactConfig.fields) payload[field.name] = (values[field.name] ?? "").trim();
      await send({ data: { payload } });
      setState("sent");
      setValues({});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      setState("error");
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1fr_1.2fr] md:py-20">
        <div>
          <h1 className="text-3xl font-bold md:text-5xl">
            {contactConfig.heading.split(" ")[0]}{" "}
            <span className="text-nebula">{contactConfig.heading.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="mt-4 text-muted-foreground">{contactConfig.subheading}</p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-primary" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 text-primary" />
              <span className="text-muted-foreground">{siteConfig.location}</span>
            </li>
          </ul>
        </div>

        <form onSubmit={onSubmit} className="surface-card space-y-5 rounded-2xl p-6 md:p-8" noValidate>
          {contactConfig.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-accent"> *</span>}
              </Label>

              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  rows={5}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select an option</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              )}

              {errors[field.name] && <p className="text-xs text-destructive">{errors[field.name]}</p>}
            </div>
          ))}

          <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : contactConfig.submitLabel}
          </Button>

          {state === "sent" && (
            <p className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
              {contactConfig.successMessage}
            </p>
          )}
          {state === "error" && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
              {errorMessage}
            </p>
          )}
        </form>
      </section>
    </SiteLayout>
  );
}
