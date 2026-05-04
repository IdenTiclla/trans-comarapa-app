import { useCashRegisterPage } from '@/hooks/use-cash-register-page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlusCircle, ArrowDownCircle, ArrowUpCircle, Wallet, Calendar, History } from "lucide-react";
import { TransactionList } from "@/components/cash-register/TransactionList";
import { OpenRegisterModal } from "@/components/cash-register/OpenRegisterModal";
import { CloseRegisterModal } from "@/components/cash-register/CloseRegisterModal";
import { WithdrawalModal } from "@/components/cash-register/WithdrawalModal";
import { RegisterHistoryTable } from "@/components/cash-register/RegisterHistoryTable";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function Component() {
  const {
    currentRegister, dailySummary, transactions, isLoading, error,
    officeName, withdrawalModalOpen, setWithdrawalModalOpen,
    history, historyLoading, officeId, userId, isOpen,
    handleRegisterOpened, handleRegisterClosed, handleWithdrawalSuccess,
  } = useCashRegisterPage()

  if (isLoading && !currentRegister) {
    return <div className="p-8 text-center text-muted-foreground">Cargando estado de la caja...</div>;
  }

  if (!officeId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card/50 m-8">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Sin Oficina Asignada</h3>
        <p className="text-muted-foreground max-w-md">
          Tu cuenta de secretaria no tiene una oficina asignada. Contacta al administrador para configurar tu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Caja Registradora</h2>
          {officeName && (
            <p className="text-muted-foreground">Oficina: {officeName}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isOpen && dailySummary ? (
            <>
              <Button
                variant="outline"
                onClick={() => setWithdrawalModalOpen(true)}
                className="gap-2"
              >
                <ArrowUpCircle className="h-4 w-4" />
                Registrar Retiro
              </Button>
              <CloseRegisterModal 
                registerId={currentRegister!.id} 
                userId={userId}
                expectedBalance={dailySummary.expected_balance}
                onSuccess={handleRegisterClosed}
              />
            </>
          ) : (
            <OpenRegisterModal 
              officeId={officeId!} 
              userId={userId}
              onSuccess={handleRegisterOpened}
            />
          )}
        </div>
      </div>

      {error && !isOpen && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isOpen ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card/50">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Caja Cerrada</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Actualmente no hay ninguna caja registradora abierta para tu sucursal. 
            Debes abrir caja para poder registrar cobros y ventas de boletos o encomiendas.
          </p>
          <OpenRegisterModal 
            officeId={officeId!} 
            userId={userId}
            onSuccess={handleRegisterOpened}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estado Actual
                </CardTitle>
                <Badge variant={isOpen ? "default" : "secondary"}>
                  {isOpen ? 'ABIERTA' : 'CERRADA'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentRegister!.date ? format(new Date(currentRegister!.date), "dd/MM/yyyy", { locale: es }) : "Hoy"}
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <Calendar className="mr-1 h-3 w-3" />
                  Desde: {format(new Date(currentRegister!.opened_at), "HH:mm", { locale: es })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo Inicial
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentRegister!.initial_balance.toFixed(2)} Bs
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monto de apertura en efectivo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos
                </CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{dailySummary?.total_in.toFixed(2) || "0.00"} Bs
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ventas y cobros
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Efectivo Esperado
                </CardTitle>
                <PlusCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {dailySummary?.expected_balance.toFixed(2) || currentRegister!.initial_balance.toFixed(2)} Bs
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total en caja disponible
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Transacciones Registradas</CardTitle>
              <CardDescription>
                Historial de movimientos financieros para el turno actual de caja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions} />
            </CardContent>
          </Card>

          <WithdrawalModal
            open={withdrawalModalOpen}
            onClose={() => setWithdrawalModalOpen(false)}
            availableBalance={dailySummary?.expected_balance ?? currentRegister!.initial_balance}
            registerId={currentRegister!.id}
            onSuccess={handleWithdrawalSuccess}
          />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Cajas
          </CardTitle>
          <CardDescription>
            Cajas cerradas de los últimos 7 días. Haz clic en una fila para ver las transacciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterHistoryTable registers={history} isLoading={historyLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
