export function ScrollLogoBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-20"
        style={{ backgroundImage: `url('/northstar-brand.png')` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background/95" />
    </div>
  );
}
