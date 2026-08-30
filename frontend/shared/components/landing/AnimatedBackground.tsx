type AnimatedBackgroundProps = {
  className?: string;
};

export function AnimatedBackground({ className = "" }: AnimatedBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.68] max-[920px]:opacity-[0.58] max-[700px]:opacity-50 [contain:paint] ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-0 block bg-[url('/assets/zimam-fleet-route-background.svg')] bg-no-repeat bg-[center_60%] max-[920px]:bg-[center_56%] max-[700px]:bg-[center_54%] bg-cover max-[700px]:opacity-[0.82]" />
    </div>
  );
}
