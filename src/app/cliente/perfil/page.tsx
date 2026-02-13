"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  ProfileResponse,
  listOrdersApi,
  OrderDto,
  sendVerificationCodeApi,
} from "@/lib/api";
import { saveAuthData, getStoredUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Package,
  Lock,
} from "lucide-react";
import { VerificationBanner } from "@/components/VerificationBanner";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { ClienteFooter } from "@/components/cliente/cliente-footer";

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  // Formulario de edición
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");

  // Formulario de cambio de contraseña
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadOrders();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getProfileApi();
      setProfile(data);
      setNombreCompleto(data.nombre_completo);
      const rawPhone = (data.telefono || "").replace(/^\+51/, "");
      const digits = rawPhone.replace(/[^\d]/g, "").slice(0, 9);
      const formatted = digits.replace(
        /(\d{3})(\d{0,3})(\d{0,3})/,
        (_, a, b, c) => [a, b, c].filter(Boolean).join(" "),
      );
      setTelefono(formatted);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setError("No se pudo cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await listOrdersApi();
      const ordersList = Array.isArray(data) ? data : data.data;
      setOrders(ordersList);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const telefonoDigits = telefono.replace(/\s/g, "");
    if (telefonoDigits && telefonoDigits.length !== 9) {
      setError("El teléfono debe tener 9 dígitos");
      setIsSaving(false);
      return;
    }

    try {
      await updateProfileApi({
        nombre_completo: nombreCompleto,
        telefono: telefonoDigits ? `+51${telefonoDigits}` : undefined,
      });

      // Recargar perfil completo del backend
      const fresh = await getProfileApi();
      setProfile(fresh);
      setNombreCompleto(fresh.nombre_completo);
      const rawPhone = (fresh.telefono || "").replace(/^\+51/, "");
      const digits = rawPhone.replace(/[^\d]/g, "").slice(0, 9);
      const fmt = digits.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" "),
      );
      setTelefono(fmt);

      // Actualizar localStorage con los nuevos datos
      const storedUser = getStoredUser();
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          nombre_completo: fresh.nombre_completo,
          telefono: fresh.telefono,
        };
        localStorage.setItem("backend_user", JSON.stringify(updatedUser));
      }

      setSuccess("Perfil actualizado exitosamente");
      setIsEditing(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar perfil";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);

    if (passwordNueva !== passwordConfirm) {
      setError("Las contraseñas nuevas no coinciden");
      setIsChangingPassword(false);
      return;
    }

    if (passwordNueva.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      setIsChangingPassword(false);
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(passwordNueva)) {
      setError(
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
      );
      setIsChangingPassword(false);
      return;
    }

    try {
      await changePasswordApi({
        password_actual: passwordActual,
        nueva_password: passwordNueva,
      });

      setSuccess("Contraseña cambiada exitosamente");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cambiar contraseña";
      setError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setNombreCompleto(profile.nombre_completo);
      const rawPhone = (profile.telefono || "").replace(/^\+51/, "");
      const digits = rawPhone.replace(/[^\d]/g, "").slice(0, 9);
      const formatted = digits.replace(
        /(\d{3})(\d{0,3})(\d{0,3})/,
        (_, a, b, c) => [a, b, c].filter(Boolean).join(" "),
      );
      setTelefono(formatted);
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSendVerification = async () => {
    if (!profile) return;

    setIsSendingVerification(true);
    setError(null);
    setSuccess(null);

    try {
      await sendVerificationCodeApi(profile.email);
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(profile.email)}`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al enviar código de verificación";
      setError(message);
    } finally {
      setIsSendingVerification(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ClienteNav />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-muted-foreground">
              Cargando perfil...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <ClienteNav />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription>
                No se pudo cargar la información del perfil
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter(
    (o) => o.estado_pedido === "completado",
  ).length;
  const totalSpent = orders
    .filter((o) => o.estado_pedido === "completado")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Administra tu información personal y configuración
            </p>
          </div>

          {/* Banner de verificación si no está verificado */}
          {!profile.email_verificado && (
            <VerificationBanner userEmail={profile.email} />
          )}

          {/* Mensajes de éxito/error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info">Información Personal</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>

            {/* Tab: Información Personal */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Datos Personales</CardTitle>
                  <CardDescription>
                    Tu información de contacto y cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        Correo Electrónico
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {profile.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {profile.email_verificado ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">
                              Verificado
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-xs text-orange-500">
                              No verificado
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSendVerification}
                              disabled={isSendingVerification}
                              className="ml-2"
                            >
                              {isSendingVerification
                                ? "Enviando..."
                                : "Verificar ahora"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Nombre Completo */}
                  <div className="flex items-start gap-4">
                    <User className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      {isEditing ? (
                        <Input
                          id="nombre"
                          value={nombreCompleto}
                          onChange={(e) => setNombreCompleto(e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.nombre_completo}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Teléfono */}
                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1">
                      <Label htmlFor="telefono">Teléfono</Label>
                      {isEditing ? (
                        <div className="flex gap-2 mt-1">
                          <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground select-none">
                            +51
                          </div>
                          <Input
                            id="telefono"
                            type="tel"
                            placeholder="928 750 445"
                            maxLength={11}
                            value={telefono}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^\d]/g, "");
                              const formatted = raw
                                .slice(0, 9)
                                .replace(
                                  /(\d{3})(\d{0,3})(\d{0,3})/,
                                  (_, a, b, c) =>
                                    [a, b, c].filter(Boolean).join(" "),
                                );
                              setTelefono(formatted);
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.telefono || "No especificado"}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Rol */}
                  <div className="flex items-start gap-4">
                    <Shield className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Rol</Label>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {profile.rol}
                      </p>
                    </div>
                  </div>

                  {profile.fecha_creacion && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-2" />
                        <div className="flex-1">
                          <Label className="text-sm font-medium">
                            Miembro desde
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(
                              profile.fecha_creacion,
                            ).toLocaleDateString("es-PE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-4">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        Editar Información
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Seguridad */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    <CardTitle>Cambiar Contraseña</CardTitle>
                  </div>
                  <CardDescription>
                    Actualiza tu contraseña para mantener tu cuenta segura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-actual">Contraseña Actual</Label>
                      <Input
                        id="password-actual"
                        type="password"
                        value={passwordActual}
                        onChange={(e) => setPasswordActual(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-nueva">Nueva Contraseña</Label>
                      <Input
                        id="password-nueva"
                        type="password"
                        value={passwordNueva}
                        onChange={(e) => setPasswordNueva(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-confirm">
                        Confirmar Nueva Contraseña
                      </Label>
                      <Input
                        id="password-confirm"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword
                        ? "Cambiando..."
                        : "Cambiar Contraseña"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Estadísticas */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total de Pedidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Package className="h-8 w-8 text-primary" />
                      <span className="text-3xl font-bold">
                        {orders.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Pedidos Completados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <span className="text-3xl font-bold">
                        {completedOrders}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Gastado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      S/ {totalSpent.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Tus últimos pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aún no has realizado ningún pedido
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.pedido_id}
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              Pedido #{order.numero_orden}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                order.fecha_creacion,
                              ).toLocaleDateString("es-PE")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">S/ {order.total}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {order.estado_pedido.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ClienteFooter />
    </div>
  );
}
