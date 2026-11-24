"use client";

import { Activity, BellRing, ChevronRight, Eye, EyeOff, Globe2, LockKeyhole, Mail, MapPin, RadioTower, ShieldCheck, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/auth/AuthContext";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { RegisterDialog } from "./RegisterDialog";

export function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [typedEmail, setTypedEmail] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await login(String(data.get("email")), String(data.get("password")));
      router.replace("/home");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-visual" aria-label={t("login.tagline")}>
        <div className="login-visual__glow login-visual__glow--one" />
        <div className="login-visual__glow login-visual__glow--two" />
        <header className="login-brand">
          <span className="login-brand__mark">C</span>
          <span><strong>Car<span>GO</span></strong><small>{t("app.fleetManagement")}</small></span>
        </header>

        <div className="login-copy">
          <span className="login-kicker"><span />{t("login.live")}</span>
          <h1>{t("login.heroTitle")}</h1>
          <p>{t("login.heroText")}</p>
        </div>

        <div className="fleet-illustration" aria-hidden="true">
          <div className="fleet-route fleet-route--one" />
          <div className="fleet-route fleet-route--two" />
          <span className="fleet-point fleet-point--origin"><MapPin /></span>
          <span className="fleet-point fleet-point--truck"><Truck /></span>
          <span className="fleet-point fleet-point--destination"><MapPin /></span>
          <span className="fleet-signal fleet-signal--one" />
          <span className="fleet-signal fleet-signal--two" />
          <div className="fleet-card fleet-card--vehicle"><span><Truck /></span><div><small>TRK-003</small><strong>Lima → Ica</strong></div><em>78 km/h</em></div>
          <div className="fleet-card fleet-card--signal"><span><RadioTower /></span><div><small>GNSS</small><strong>{t("login.secure")}</strong></div></div>
        </div>

        <div className="login-benefits">
          <span><Truck />{t("login.vehicles")}</span>
          <span><BellRing />{t("login.alerts")}</span>
          <span><Activity />IoT + CEP</span>
        </div>
      </section>

      <section className="login-access">
        <div className="login-access__top">
          <button className="login-language" onClick={() => setLanguage(language === "es" ? "en" : "es")} aria-label={t("header.language")}><Globe2 />{language.toUpperCase()}</button>
        </div>
        <div className="login-panel">
          <div className="login-panel__icon"><ShieldCheck /></div>
          <span className="login-panel__eyebrow">CarGO Control Center</span>
          <h2>{t("login.welcome")}</h2>
          <p>{t("login.subtitle")}</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label><span>{t("login.email")}</span><div className="login-input"><Mail /><input name="email" type="email" placeholder={t("login.emailPlaceholder")} autoComplete="username" required /></div></label>
            <label><span>{t("login.password")}</span><div className="login-input"><LockKeyhole /><input name="password" type={showPassword ? "text" : "password"} placeholder={t("login.passwordPlaceholder")} autoComplete="current-password" minLength={8} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="login-options"><label className="login-check"><input type="checkbox" defaultChecked /><span />{t("login.remember")}</label><button type="button" onClick={() => { setTypedEmail((document.querySelector<HTMLInputElement>("input[name=email]")?.value ?? "").trim()); setForgotOpen(true); }}>{t("login.forgot")}</button></div>
            <button className="login-submit" type="submit" disabled={loading}>{loading ? <><span className="login-spinner" />{t("login.entering")}</> : <>{t("login.submit")}<ChevronRight /></>}</button>
          </form>

          <p className="login-register">{t("register.question")} <button type="button" onClick={() => setRegisterOpen(true)}>{t("register.link")}</button></p>
          <footer><ShieldCheck />{t("login.support")}</footer>
        </div>
      </section>
      <RegisterDialog isOpen={registerOpen} onClose={() => setRegisterOpen(false)} />
      <ForgotPasswordDialog isOpen={forgotOpen} onClose={() => setForgotOpen(false)} initialEmail={typedEmail} />
    </div>
  );
}
