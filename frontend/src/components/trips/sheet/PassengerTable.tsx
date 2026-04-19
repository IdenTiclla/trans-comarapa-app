interface Props {
  startSeat: number
  endSeat: number
  getPassengerName: (n: number) => string
  getPassengerDoc: (n: number) => string
  getPassengerDest: (n: number) => string
}

export function PassengerTable({ startSeat, endSeat, getPassengerName, getPassengerDoc, getPassengerDest }: Props) {
  const seats = Array.from({ length: endSeat - startSeat + 1 }, (_, i) => i + startSeat)

  return (
    /* eslint-disable-next-line no-restricted-syntax */
    <table className="pax-table">
      <thead>
        <tr>
          <th className="col-no">No.</th>
          <th>Nombre y Apellido</th>
          <th className="col-ci">C.I.</th>
          <th className="col-dst">Destino</th>
        </tr>
      </thead>
      <tbody>
        {seats.map((n) => {
          const name = getPassengerName(n)
          return (
            <tr key={n} className={name.trim() ? 'pax-occupied' : ''}>
              <td className="col-no">{n}</td>
              <td className="col-name">{name}</td>
              <td className="col-ci">{getPassengerDoc(n)}</td>
              <td className="col-dst">{getPassengerDest(n)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
