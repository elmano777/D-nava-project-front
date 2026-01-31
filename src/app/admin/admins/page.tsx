"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { registerAdminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Shield, Mail, Phone, User, CheckCircle2 } from "lucide-react";

export default function AdminsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNombreCompleto("");
    setTelefono("");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerAdminApi({
        email,
        password,
        nombre_completo: nombreCompleto,
        telefono: telefono || undefined,
      });

      setSuccess(
        `Administrador ${response.user.nombre_completo} creado exitosamente`
      );

      // Cerrar el diálogo y resetear el formulario después de 2 segundos
      setTimeout(() => {
        setIsDialogOpen(false);
        resetForm();
      }, 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al crear el administrador";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Administradores</h1>
            <p className="text-muted-foreground">
              Administra los usuarios con acceso al panel de control
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Crear Administrador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <DialogTitle>Crear Nuevo Administrador</DialogTitle>
                </div>
                <DialogDescription>
                  El nuevo administrador tendrá acceso completo al panel de
                  administración
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nombre"
                        type="text"
                        placeholder="Nombre del administrador"
                        required
                        value={nombreCompleto}
                        onChange={(e) => setNombreCompleto(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@dnava.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono (opcional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefono"
                        type="tel"
                        placeholder="+51 999 999 999"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirmar Contraseña
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repite la contraseña"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

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
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creando..." : "Crear Administrador"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card informativa */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Información Importante</CardTitle>
              </div>
              <CardDescription>
                Sobre la gestión de administradores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Permisos de Administrador</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Gestionar productos y categorías</li>
                    <li>✓ Ver y actualizar pedidos</li>
                    <li>✓ Acceder a reportes y estadísticas</li>
                    <li>✓ Crear nuevos administradores</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Recomendaciones de Seguridad</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Usa contraseñas seguras (min. 8 caracteres)</li>
                    <li>• Incluye mayúsculas, minúsculas y números</li>
                    <li>• No compartas las credenciales</li>
                    <li>• Cambia las contraseñas periódicamente</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nota:</strong> Los nuevos administradores recibirán sus
                  credenciales y podrán iniciar sesión inmediatamente. Se
                  recomienda que cambien su contraseña en el primer acceso.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Cards de estadísticas o información adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Administradores Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold">1+</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tú y los administradores que crees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Acceso Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Dashboard completo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Gestión de productos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Control de pedidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Reportes y estadísticas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Próximas Funciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Lista de administradores</li>
                <li>• Editar permisos</li>
                <li>• Desactivar cuentas</li>
                <li>• Registro de actividad</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
