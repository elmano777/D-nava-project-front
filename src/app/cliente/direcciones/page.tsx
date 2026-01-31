"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MapPin, Plus, Edit, Trash2, Star } from "lucide-react";
import { getStoredUser } from "@/lib/auth";
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
  AddressDto,
} from "@/lib/api";
import { toast } from "sonner";

export default function DireccionesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressDto | null>(
    null,
  );
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    alias: "",
    direccion_linea1: "",
    direccion_linea2: "",
    distrito: "",
    ciudad: "Lima",
    codigo_postal: "",
  });

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    loadAddresses();
  }, [router]);

  const loadAddresses = async () => {
    try {
      const data = await getAddressesApi();
      setAddresses(data);
    } catch (error) {
      console.error("Error cargando direcciones:", error);
      toast.error("No se pudieron cargar las direcciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (address?: AddressDto) => {
    if (address) {
      setIsEditing(true);
      setSelectedAddress(address);
      setFormData({
        alias: address.alias,
        direccion_linea1: address.direccion_linea1,
        direccion_linea2: address.direccion_linea2 || "",
        distrito: address.distrito,
        ciudad: address.ciudad,
        codigo_postal: address.codigo_postal,
      });
    } else {
      setIsEditing(false);
      setSelectedAddress(null);
      setFormData({
        alias: "",
        direccion_linea1: "",
        direccion_linea2: "",
        distrito: "",
        ciudad: "Lima",
        codigo_postal: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && selectedAddress) {
        await updateAddressApi(selectedAddress.direccion_id, formData);
        toast.success("La dirección se actualizó correctamente");
      } else {
        await createAddressApi(formData);
        toast.success("La dirección se creó correctamente");
      }

      setIsDialogOpen(false);
      loadAddresses();
    } catch (error) {
      console.error("Error guardando dirección:", error);
      toast.error("No se pudo guardar la dirección");
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await setDefaultAddressApi(addressId);
      toast.success("La dirección se marcó como predeterminada");
      loadAddresses();
    } catch (error) {
      console.error("Error estableciendo dirección predeterminada:", error);
      toast.error("No se pudo establecer la dirección predeterminada");
    }
  };

  const handleDelete = async () => {
    if (!deleteAddressId) return;

    try {
      await deleteAddressApi(deleteAddressId);
      toast.success("La dirección se eliminó correctamente");
      setDeleteAddressId(null);
      loadAddresses();
    } catch (error) {
      console.error("Error eliminando dirección:", error);
      toast.error("No se pudo eliminar la dirección");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ClienteNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Direcciones</h1>
            <p className="text-muted-foreground">
              Gestiona tus direcciones de envío
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Dirección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Editar Dirección" : "Nueva Dirección"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="alias">Nombre / Alias *</Label>
                  <Input
                    id="alias"
                    placeholder="Casa, Trabajo, Universidad..."
                    value={formData.alias}
                    onChange={(e) =>
                      setFormData({ ...formData, alias: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="direccion_linea1">
                    Dirección (Calle y Número) *
                  </Label>
                  <Input
                    id="direccion_linea1"
                    placeholder="Av. Javier Prado 123"
                    value={formData.direccion_linea1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        direccion_linea1: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="direccion_linea2">
                    Referencia / Dpto (Opcional)
                  </Label>
                  <Input
                    id="direccion_linea2"
                    placeholder="Dpto 301, Edificio B..."
                    value={formData.direccion_linea2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        direccion_linea2: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="distrito">Distrito *</Label>
                    <Input
                      id="distrito"
                      placeholder="San Isidro"
                      value={formData.distrito}
                      onChange={(e) =>
                        setFormData({ ...formData, distrito: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="codigo_postal">Código Postal *</Label>
                    <Input
                      id="codigo_postal"
                      placeholder="15073"
                      value={formData.codigo_postal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigo_postal: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) =>
                      setFormData({ ...formData, ciudad: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">
                No tienes direcciones guardadas
              </p>
              <p className="text-muted-foreground mb-6">
                Agrega tu primera dirección para facilitar tus pedidos
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Dirección
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card
                key={address.direccion_id}
                className={
                  address.es_predeterminada ? "border-primary border-2" : ""
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{address.alias}</CardTitle>
                      {address.es_predeterminada && (
                        <Star className="h-4 w-4 fill-primary text-primary" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteAddressId(address.direccion_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p>{address.direccion_linea1}</p>
                    {address.direccion_linea2 && (
                      <p className="text-muted-foreground">
                        {address.direccion_linea2}
                      </p>
                    )}
                    <p>
                      {address.distrito}, {address.ciudad}
                    </p>
                    <p className="text-muted-foreground">
                      CP: {address.codigo_postal}
                    </p>
                  </div>

                  {!address.es_predeterminada && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleSetDefault(address.direccion_id)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Marcar como Predeterminada
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog
          open={deleteAddressId !== null}
          onOpenChange={(open) => !open && setDeleteAddressId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La dirección será eliminada
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
