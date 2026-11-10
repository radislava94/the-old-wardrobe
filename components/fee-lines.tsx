/**
 * Platform fee, cap, courier charge, and payout stay on their own lines.
 * The courier amount is the courier's tariff. This component does not invent one.
 */
export function FeeLines({
  freeLeft,
  youReceive,
  platformFee,
  cap,
  courier,
  reason,
  labels,
}: {
  freeLeft?: string;
  youReceive?: string;
  platformFee?: string;
  cap?: string;
  courier?: string;
  reason?: string;
  labels: {
    platformFee: string;
    cap: string;
    courierCharge: string;
  };
}) {
  return (
    <div className="fee-lines">
      {freeLeft ? <p className="fee-free">{freeLeft}</p> : null}
      <div className="fee-line">
        <span>{labels.platformFee}</span>
        <span>{platformFee ?? "—"}</span>
      </div>
      <div className="fee-line">
        <span>{labels.cap}</span>
        <span>{cap ?? "—"}</span>
      </div>
      <div className="fee-line">
        <span>{labels.courierCharge}</span>
        <span>{courier ?? "—"}</span>
      </div>
      {youReceive ? <p className="fee-receive">{youReceive}</p> : null}
      {reason ? <p className="hint">{reason}</p> : null}
    </div>
  );
}
