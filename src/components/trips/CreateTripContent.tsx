"use client";

import { BellRing, Check, MapPin, Package, Plus, Send, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import { userService } from "@/services/userService";
import { vehicleService } from "@/services/vehicleService";
import { driverService } from "@/services/driverService";
import { tripService } from "@/services/tripService";
import { geocodingService } from "@/services/geocodingService";
import type { Coordinates } from "@/types/api";
import type { Driver, FleetVehicle, User } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { LocationPickerMap } from "./LocationPickerMap";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { useAuth } from "@/auth/AuthContext";

export function CreateTripContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cargo, setCargo] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [isRecipientModalOpen, setRecipientModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [toast, setToast] = useState("");
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const selectedVehicle = vehicles.find((item) => item.id === vehicle);
  const vehicleLabel = selectedVehicle ? `${selectedVehicle.id} · ${selectedVehicle.plate}` : vehicle;
  const selectedDriver = drivers.find((item) => item.id === driver);
  const driverLabel = selectedDriver ? `${selectedDriver.firstName} ${selectedDriver.lastName}` : driver;
  const [originPoint, setOriginPoint] = useState<Coordinates>();
  const [destinationPoint, setDestinationPoint] = useState<Coordinates>();
  const [activePoint, setActivePoint] = useState<"origin" | "destination">("origin");
  const [plannedStartAt, setPlannedStartAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingAddress, setResolvingAddress] = useState(false);

  useEffect(() => { Promise.all([userService.getUsers(), vehicleService.getVehicles(), driverService.getDrivers()]).then(([recipientItems, vehicleItems, driverItems]) => { setUsers(recipientItems); setVehicles(vehicleItems); setDrivers(driverItems); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo cargar el formulario.")).finally(() => setLoading(false)); }, []);

  const toggleRecipient = (id: string) => setRecipients((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const addRecipient = async (event: React.FormEvent) => {
    event.preventDefault();
    const recipient = await userService.createTelegramRecipient({ name: recipientName, telegramChatId });
    setUsers((current) => [...current, recipient]);
    setRecipients((current) => [...current, recipient.id]);
    setRecipientName("");
    setTelegramChatId("");
    setRecipientModalOpen(false);
    setToast(t("create.recipientAdded"));
    setTimeout(() => setToast(""), 2400);
  };

  const createTrip = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!originPoint || !destinationPoint) { setError("Selecciona origen y destino en el mapa."); return; }
    setLoading(true); setError("");
    try { const created = await tripService.createTrip({ vehicleCode: vehicle, driverCode: driver, originLabel: origin, origin: originPoint, destinationLabel: destination, destination: destinationPoint, cargoDescription: cargo, plannedStartAt: plannedStartAt ? new Date(plannedStartAt).toISOString() : undefined, recipientIds: recipients }); setToast(t("create.success")); router.push(`/viajes/${created.code}`); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo crear el recorrido."); setLoading(false); }
  };

  const changeLocationText = (kind: "origin" | "destination", value: string) => {
    if (kind === "origin") { setOrigin(value); setOriginPoint(undefined); }
    else { setDestination(value); setDestinationPoint(undefined); }
  };

  const selectLocation = (kind: "origin" | "destination", result: { displayName: string; latitude: number; longitude: number }) => {
    const point = { latitude: result.latitude, longitude: result.longitude };
    if (kind === "origin") { setOrigin(result.displayName); setOriginPoint(point); }
    else { setDestination(result.displayName); setDestinationPoint(point); }
  };

  const pickOnMap = async (point: Coordinates) => {
    const kind = activePoint;
    if (kind === "origin") { setOriginPoint(point); setOrigin("Buscando dirección…"); setActivePoint("destination"); }
    else { setDestinationPoint(point); setDestination("Buscando dirección…"); }
    setResolvingAddress(true);
    try {
      const result = await geocodingService.reverse(point);
      selectLocation(kind, { ...result, latitude: point.latitude, longitude: point.longitude });
    } catch {
      const fallback = `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
      if (kind === "origin") setOrigin(fallback); else setDestination(fallback);
    } finally { setResolvingAddress(false); }
  };

  return <div className="module-page">
    <PageHeader title={t("create.title")} subtitle={t("create.subtitle")} />
    <form className="create-trip-layout" onSubmit={createTrip}>
      <section className="card form-section">
        <div className="form-section__heading"><Truck /><div><h2>{t("common.vehicle")} & {t("common.driver")}</h2></div></div>
        <div className="form-grid">
          <Select label={t("create.vehicle")} value={vehicle} onChange={(event) => setVehicle(event.target.value)} required><option value="">—</option>{vehicles.filter((item) => item.status === "available").map((item) => <option key={item.id} value={item.id}>{item.id} · {item.plate}</option>)}</Select>
          <Select label={t("create.driver")} value={driver} onChange={(event) => setDriver(event.target.value)} required><option value="">—</option>{drivers.filter((item) => item.status === "available").map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</Select>
        </div>
        <div className="form-section__heading"><MapPin /><div><h2>{t("create.origin")} & {t("create.destination")}</h2></div></div>
        <div className="form-grid">
          <LocationAutocomplete label={t("create.origin")} value={origin} placeholder={t("create.location")} onActivate={() => setActivePoint("origin")} onChange={(value) => changeLocationText("origin", value)} onSelect={(result) => selectLocation("origin", result)} />
          <LocationAutocomplete label={t("create.destination")} value={destination} placeholder={t("create.location")} onActivate={() => setActivePoint("destination")} onChange={(value) => changeLocationText("destination", value)} onSelect={(result) => selectLocation("destination", result)} />
        </div>
        <LocationPickerMap origin={originPoint} destination={destinationPoint} active={activePoint} onPick={(point) => void pickOnMap(point)} />
        {resolvingAddress && <p className="geocoding-status" role="status">Buscando la dirección del punto seleccionado…</p>}
        <div className="form-section__heading"><Package /><div><h2>{t("trips.cargo")}</h2></div></div>
        <div className="form-grid"><Textarea label={t("create.cargo")} value={cargo} onChange={(event) => setCargo(event.target.value)} required /><Input label={`${t("create.datetime")} (${t("common.optional")})`} type="datetime-local" value={plannedStartAt} onChange={(event) => setPlannedStartAt(event.target.value)} /></div>
        <div className="form-section__heading recipient-heading"><BellRing /><div><h2>{t("create.recipients")}</h2><p>{t("create.recipientsHelp")}</p></div><Button type="button" variant="secondary" disabled={currentUser?.role !== "ADMIN"} onClick={() => setRecipientModalOpen(true)}><Plus size={16} />{t("create.addRecipient")}</Button></div>
        <div className="recipient-grid">{users.map((user) => <button type="button" key={user.id} className={`recipient-card ${recipients.includes(user.id) ? "is-selected" : ""}`} onClick={() => user.configured && toggleRecipient(user.id)} disabled={!user.configured} aria-pressed={recipients.includes(user.id)}><span className="avatar">{user.name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{user.name}</strong><small>{user.configured ? t("create.telegramReady") : t("create.telegramMissing")}</small></span>{recipients.includes(user.id) && <Check size={18} />}</button>)}</div>
      </section>
      <aside className="card trip-summary"><span className="eyebrow">{t("create.summary")}</span><h2>{origin || t("create.origin")} <span>→</span> {destination || t("create.destination")}</h2><dl><div><dt>{t("common.vehicle")}</dt><dd>{vehicleLabel || "—"}</dd></div><div><dt>{t("common.driver")}</dt><dd>{driverLabel || "—"}</dd></div><div><dt>{t("trips.cargo")}</dt><dd>{cargo || "—"}</dd></div><div><dt>{t("create.recipients")}</dt><dd>{recipients.length}</dd></div></dl>{error && <p className="form-error" role="alert">{error}</p>}<Button type="submit" disabled={loading || !vehicle || !driver || !origin || !destination || !originPoint || !destinationPoint || !cargo || recipients.length === 0}><Send size={17} />{t("create.create")}</Button></aside>
    </form>
    <Modal isOpen={isRecipientModalOpen} onClose={() => setRecipientModalOpen(false)} title={t("create.addRecipientTitle")}><form className="modal-form" onSubmit={addRecipient}><p className="modal-form__help">{t("create.addRecipientHelp")}</p><Input name="recipientName" label={t("create.recipientName")} value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required /><Input name="telegramChatId" label={t("create.telegramChatId")} value={telegramChatId} onChange={(event) => setTelegramChatId(event.target.value)} inputMode="numeric" pattern="-?[0-9]+" required /><div className="modal-actions"><Button type="button" variant="ghost" onClick={() => setRecipientModalOpen(false)}>{t("common.cancel")}</Button><Button type="submit" disabled={!recipientName.trim() || !telegramChatId.trim()}>{t("create.saveRecipient")}</Button></div></form></Modal>
    {toast && <Toast message={toast} />}
  </div>;
}
