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
import { closeRegister } from "@/store/cash-register.slice";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CloseRegisterModalProps {
  registerId: number;
  userId: number;
  expectedBalance: number;
  onSuccess: () => void;
}

export function CloseRegisterModal({ registerId, userId, expectedBalance, onSuccess }: CloseRegisterModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalBalance, setFinalBalance] = useState(expectedBalance.toFixed(2));
  const dispatch = useAppDispatch();
  const toast = useToast();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFinalBalance(expectedBalance.toFixed(2));
    }
    setOpen(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = parseFloat(finalBalance);
    const balance = isNaN(parsedVal) ? NaN : parseFloat(parsedVal.toFixed(2));
    
    if (isNaN(balance) || balance < 0) {
      toast.error("El monto final debe ser un número válido indicando el efectivo en caja.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(closeRegister({
        registerId,
        data: {
          closed_by_id: userId,
          final_balance: balance,
          closed_at: new Date().toISOString(),
        }
      })).unwrap();
      
      toast.success("El turno fue cerrado correctamente.");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(error?.toString() || "No se pudo cerrar la caja registradora.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const difference = parseFloat(finalBalance) - expectedBalance;
  const hasDiscrepancy = !isNaN(difference) && Math.abs(difference) > 0.01;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="lg" className="w-full sm:w-auto">
          Cerrar Caja
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cerrar Caja Registradora</DialogTitle>
            <DialogDescription>
              Ingrese el monto final de efectivo al momento de hacer el corte.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center rounded-md bg-muted p-3 text-sm">
              <span className="font-medium text-muted-foreground">Efectivo Esperado:</span>
              <span className="font-bold">{expectedBalance.toFixed(2)} Bs</span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="finalBalance" className="text-right">
                Efectivo Real (Bs)
              </Label>
              <Input
                id="finalBalance"
                type="number"
                step="0.01"
                min="0"
                required
                value={finalBalance}
                onChange={(e) => setFinalBalance(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            {hasDiscrepancy && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 text-xs">
                  Hay una diferencia de <strong>{difference > 0 ? '+' : ''}{difference.toFixed(2)} Bs</strong> con respecto al esperado. Si continúas, este monto quedará registrado como el saldo final.
                </AlertDescription>
              </Alert>
            )}
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Cierre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
