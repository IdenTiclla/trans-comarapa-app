import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store";
import { recordWithdrawal, selectIsSubmitting } from "@/store/cash-register.slice";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowUpCircle } from "lucide-react";

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  registerId: number;
  onSuccess: () => void;
}

export function WithdrawalModal({
  open,
  onClose,
  availableBalance,
  registerId,
  onSuccess,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isSubmitting = useAppSelector(selectIsSubmitting);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= availableBalance;
  const isDescriptionValid = description.trim().length >= 5;
  const isValid = isAmountValid && isDescriptionValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      if (!isAmountValid) {
        toast.error("El monto debe ser mayor a 0 y no exceder el saldo disponible.");
      }
      if (!isDescriptionValid) {
        toast.error("El motivo debe tener al menos 5 caracteres.");
      }
      return;
    }

    try {
      await dispatch(
        recordWithdrawal({
          registerId,
          data: {
            amount: parseFloat(parsedAmount.toFixed(2)),
            description: description.trim(),
          },
        })
      ).unwrap();

      toast.success(`Retiro de ${parsedAmount.toFixed(2)} Bs. registrado correctamente.`);
      setAmount("");
      setDescription("");
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error?.toString() || "No se pudo registrar el retiro.");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-orange-500" />
              Registrar Retiro
            </DialogTitle>
            <DialogDescription>
              Retire dinero de la caja registradora. El monto no puede exceder el saldo disponible.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="availableBalance">Saldo Disponible (Bs)</Label>
              <div className="text-2xl font-bold text-green-600">
                {availableBalance.toFixed(2)}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto a Retirar (Bs)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={availableBalance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              {parsedAmount > availableBalance && (
                <p className="text-sm text-destructive">
                  El monto excede el saldo disponible
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Motivo del Retiro</Label>
              <Textarea
                id="description"
                required
                minLength={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Pago de combustible para el viaje..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 5 caracteres
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Retiro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
