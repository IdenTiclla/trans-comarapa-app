import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useAppDispatch } from "@/store";
import { openRegister } from "@/store/cash-register.slice";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface OpenRegisterModalProps {
  officeId: number;
  userId: number;
  onSuccess: () => void;
}

export function OpenRegisterModal({ officeId, userId, onSuccess }: OpenRegisterModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialBalance, setInitialBalance] = useState("0");
  const dispatch = useAppDispatch();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(initialBalance);
    
    if (isNaN(balance) || balance < 0) {
      toast.error("El monto inicial debe ser un número válido y mayor o igual a cero.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(openRegister({
        office_id: officeId,
        opened_by_id: userId,
        initial_balance: balance,
        date: new Date().toISOString().split("T")[0],
      })).unwrap();
      
      toast.success(`Se abrió la caja con un saldo inicial de ${balance.toFixed(2)} Bs.`);
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.toString() || "No se pudo abrir la caja registradora.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          Abrir Caja
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Abrir Caja Registradora</DialogTitle>
            <DialogDescription>
              Ingrese el monto en efectivo con el que iniciará el turno actual.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialBalance" className="text-right">
                Saldo Inicial (Bs)
              </Label>
              <Input
                id="initialBalance"
                type="number"
                step="0.10"
                min="0"
                required
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Apertura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
