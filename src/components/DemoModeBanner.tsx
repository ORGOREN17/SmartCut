const DemoModeBanner = () => (
  <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
    <div className="mb-3 px-4 py-1.5 rounded-full bg-accent/90 backdrop-blur-sm border border-border text-xs font-medium text-accent-foreground shadow-soft pointer-events-auto">
      Demo Mode · AI features simulated locally
    </div>
  </div>
);

export default DemoModeBanner;
